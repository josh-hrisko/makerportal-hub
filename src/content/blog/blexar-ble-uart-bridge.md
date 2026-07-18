---
title: "HM-10 and nRF52 both call it \"BLE UART\" — they're not the same GATT profile"
description: "Building BLExAR's Arduino-to-iOS bridge: why HM-10's single-characteristic UART and the Nordic UART Service aren't interchangeable, and the newline-framing gotcha that only shows up at low MTU."
publishedAt: 2026-07-17
draft: false
tags: [blexar, ble, arduino, ios-craft]
eyebrow: "Field note / BLExAR"
readingTime: "5 min read"
---

Most "Bluetooth serial for Arduino" tutorials treat every cheap BLE module as a drop-in replacement for the old HC-05/HC-06 SPP bridges — pair it, open a terminal, done. That's true at the AT-command level. It stops being true the moment you write real `CoreBluetooth` central code instead of using a generic BLE terminal app, because HM-10-family clones and Nordic's nRF52 boards expose genuinely different GATT shapes under that same "BLE UART" label. [BLExAR](https://makersportal.com/apps/blexar) has to talk to both — HM-10, CC254x, and nRF52 modules — from one iOS app, so the difference isn't academic.

## Two "BLE UART" bridges, two different characteristic layouts

HM-10 clones expose one vendor service (`FFE0`) with a single characteristic (`FFE1`) that does double duty — it's both `writeWithoutResponse` (central → peripheral) and `notify` (peripheral → central) on the same UUID. Nordic's UART Service (NUS) splits that in half: one service (`6E400001-B5A3-F393-E0A9-E50E24DCCA9E`) with two separate characteristics, one for each direction:

```swift
// HM-10: one characteristic does both directions
let uartService = CBUUID(string: "FFE0")
let uartChar    = CBUUID(string: "FFE1") // write + notify, same UUID

// Nordic UART Service (nRF52): direction is split across two characteristics
let nusService = CBUUID(string: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E")
let nusRX      = CBUUID(string: "6E400002-B5A3-F393-E0A9-E50E24DCCA9E") // write
let nusTX      = CBUUID(string: "6E400003-B5A3-F393-E0A9-E50E24DCCA9E") // notify
```

Central-side code written against one of these and pointed at the other won't just behave differently — `discoverCharacteristics` for `FFE1` against an nRF52 running NUS returns nothing, because that characteristic doesn't exist there. BLExAR's connection flow has to check for `FFE0` first, then fall back to `6E400001`, before it knows which read/write UUIDs to actually use.

## There's no length prefix — the newline carries the whole protocol

Neither module family gives you a framed packet with a length header. BLExAR's own format is plain ASCII, comma-separated, newline-terminated — `"1234,23.5,1023\n"` — and the only thing marking where one row ends and the next begins is that `0x0A` byte. That works because BLE notifications aren't guaranteed to line up with your rows: a notification is capped at the negotiated MTU (20 bytes on a legacy HM-10 connection, up to 185 bytes on nRF52/iOS 10+, 512 under BLE 5), and a ~14-byte row can straddle two notifications if the previous one ended with a partial number left over. The fix is a small accumulating buffer on the receive side, not a smarter parser:

```swift
func peripheral(_ p: CBPeripheral, didUpdateValueFor c: CBCharacteristic, error: Error?) {
    guard let data = c.value else { return }
    lineBuffer.append(data)
    while let nl = lineBuffer.firstIndex(of: 0x0A) {
        let line = lineBuffer.prefix(upTo: nl)
        // parse line as CSV, then:
        lineBuffer.removeSubrange(...nl)
    }
}
```

Code that assumes "one row per notification" instead of buffering to the delimiter will corrupt data intermittently rather than obviously — it looks fine in a quick test and drops or garbles rows once you run it long enough for a fragment to land at exactly the wrong byte.

## Two more things worth knowing before you wire this up

- **MTU changes throughput, not just packet count.** At 20 bytes, HM-10 sends roughly one row per notification; nRF52's 185-byte MTU can batch 10+ rows into a single notification, which means fewer radio wakeups and meaningfully better battery life at the same sample rate — worth choosing hardware around if you're logging continuously.
- **Query the negotiated MTU instead of assuming one.** `CBPeripheral.maximumWriteValueLength(for:)` tells you what you actually got after connecting. A lot of starter BLE-serial code hardcodes the pre-iOS-10 20-byte default, or copies a 185-byte assumption from an nRF52 tutorial — either one silently misbehaves against the other module family. BLExAR reads this value instead of guessing.

None of this shows up if you're only sending short test strings from a generic BLE scanner app — it shows up once you're streaming real sensor rows at a real sample rate over a real connection.

BLExAR's own Arduino-to-iOS bridge — including the CSV export path — pairs with the [Arduino Nano ESP32](/resources#gear) and an [SSD1306 OLED display](/resources#gear), the real hardware behind it. If you want the sketches and Swift bridge code directly rather than reading them here, the [BLExAR Nano+OLED Starter](/shop) packages the RFID, GPS, and OLED builds with the BLE snippet and a wiring diagram. For everything else in the [`ios-craft`](/journal) space, this GATT/framing distinction is worth checking before you assume two "BLE UART" modules are interchangeable.

Want to see the framing live instead of reading it? The [BLE GATT / CSV frame visualizer](/playground/ble-gatt-visualizer) lets you switch between HM-10 and nRF52 service layouts, inject raw bytes at different MTUs, and watch the reassembly buffer fill and flush in real time.
