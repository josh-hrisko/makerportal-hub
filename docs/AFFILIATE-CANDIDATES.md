# Affiliate candidate tracker

Working reference — not a data source the site reads. Amazon rows: paste
ASIN / SiteStripe link. SparkFun rows: product path on sparkfun.com (live
links use `buildSparkFunUrl` + code `rOtrc44SZw`).

**Approved live merchants:** Amazon Associates (`engineersport-20`) · SparkFun Affiliate (`rOtrc44SZw`, 10% Originals) · PCBWay referral (`https://pcbway.com/g/VJp6Xm`). **Pending stub-ready:** PCBWay Shared Projects + JLCPCB Brand Advocate — no fake IDs or project URLs shipped; code ready in `affiliate-links.ts` + `FabOrderPanel.astro`.

**Owner-gated fab items:**
- PCBWay generic referral is already live and disclosed. Shared Projects are
  tabled until the owner has a real design plus reviewed KiCad/Gerber assets;
  never create placeholder project URLs.
- JLCPCB Brand Advocate/referral remains deferred. If the owner later supplies
  real terms and a URL, fill `JLCPCB_REFERRAL_CODE` / `JLCPCB_SPONSORSHIP_URL`
  and update `/privacy` in the same change.

**Current sim kits (14 live):** the original ten plus
`voice-synth-workstation`, `modal-edge-bench-stack`, `fly-edge-lab-stack`, and
`vector-retrieval-edge-stack`. All use existing audited link ids only.

**Status key:**
- Confirmed — live in `affiliate-links.json`.
- Suggested — candidate not yet shipped.

Add, edit, or delete entries freely — this file is yours.

---

## SparkFun Affiliate (live 2026-07-19) — code `rOtrc44SZw`

Commission: **10% on SparkFun Originals only**. Third-party (Pi, Jetson, Teensy) still linked for convenience; may pay $0.

| id | Product path | Originals? | Sims |
| :--- | :--- | :---: | :--- |
| sf-raspberry-pi-5-8gb | raspberry-pi-5-8gb.html | no | slam, rtos, pinn |
| sf-raspberry-pi-5-4gb | raspberry-pi-5-4gb.html | no | rtos |
| sf-redboard-plus | sparkfun-redboard-plus.html | yes | rtos, gan |
| sf-teensy-4-0 | teensy-4-0.html | no | rtos, gan, pid |
| sf-thing-plus-rp2350 | sparkfun-thing-plus-rp2350.html | yes | rtos |
| sf-thing-plus-esp32 | sparkfun-thing-plus-esp32-wroom-usb-c.html | yes | pid, rtos |
| sf-inventors-kit-v41 | sparkfun-inventor-s-kit-v4-1-2.html | yes | fea, rtos |
| sf-xrp-kit | experiential-robotics-platform-xrp-kit.html | yes | fea, slam, pid |
| sf-jetson-orin-nano | nvidia-jetson-orin-nano-developer-kit.html | no | slam, pinn |
| sf-gps-rtk-zed-f9p | sparkfun-gps-rtk-sma-breakout-zed-f9p-qwiic.html | yes | slam, antenna |
| sf-icm20948-9dof | sparkfun-9dof-imu-breakout-icm-20948-qwiic.html | yes | pid, slam |
| sf-pro-micro-rp2350 | sparkfun-pro-micro-rp2350.html | yes | rtos |
| sf-micromod-main-single | sparkfun-micromod-main-board-single.html | yes | verilog, rtos |
| sf-openlog | sparkfun-openlog.html | yes | gan, rtos |

**Note:** SparkFun catalog has **no Prusa/Bambu 3D printers** (checked 2026-07). FEA path uses XRP + Inventor’s Kit + Amazon PLA instead.

---

## BLExAR — BLE / Arduino / sensor hardware

1. Arduino Uno R3
   Category: Microcontroller
   Status: Confirmed — RFID, e-Paper posts
   Affiliate link: https://amzn.to/3RDipqb

2. Arduino Nano ESP32
   Category: Microcontroller
   Status: Confirmed — e-Paper post
   Affiliate link: https://amzn.to/4bqqBRk

3. Raspberry Pi 4 Model B 4GB Kit
   Category: SBC
   Status: Confirmed — LiDAR, thermal, stepper, water-metering, QuadMic posts
   Affiliate link: https://amzn.to/4f3NzA3

4. Raspberry Pi Pico
   Category: Microcontroller
   Status: Confirmed — WS2812 ring, OLED, thermal-alt posts
   Affiliate link: https://amzn.to/3RfRHni

5. MFRC522 RFID Reader Kit for Arduino (12pcs)
   Category: RFID
   Status: Confirmed — RFID post
   Affiliate link: https://amzn.to/4vtto3h

6. TF-Luna Mini LiDAR Module
   Category: Sensor
   Status: Confirmed — LiDAR post
   Affiliate link: https://amzn.to/4wcUSvy

7. AMG8833 Grid-EYE Infrared Thermal Camera
   Category: Sensor
   Status: Confirmed — Thermal camera post
   Affiliate link: https://amzn.to/4yte3Ti

8. MLX90640 Thermal Camera 32x24
   Category: Sensor
   Status: Confirmed — Thermal, QuadMic, OLED posts
   Affiliate link: https://amzn.to/4wPrETo

9. MLX90614 Non-Contact IR Temperature Sensor GY-906
   Category: Sensor
   Status: Confirmed — Thermal, QuadMic posts
   Affiliate link: https://amzn.to/4fDPpru

10. NEMA 17 Stepper Motor 17HS4023
    Category: Motor
    Status: Confirmed — Stepper motor post
    Affiliate link: https://amzn.to/4wgaxdl

11. DRV8825 Stepper Motor Driver with Heatsink
    Category: Driver
    Status: Confirmed — Stepper motor post
    Affiliate link: https://amzn.to/4wPsYFQ

12. NEO-6M GPS Module
    Category: Sensor
    Status: Confirmed — GPS, QuadMic, OLED posts
    Affiliate link: https://amzn.to/4fDQ9gg

13. ATGM336H Mini GPS Module
    Category: Sensor
    Status: Confirmed — GPS tracker post
    Affiliate link: https://amzn.to/4vt0AIt

14. MG90S Micro Servo
    Category: Actuator
    Status: Confirmed — GPS tracker, OLED posts
    Affiliate link: https://amzn.to/4vC1d2v

15. SSD1306 OLED Display I2C 0.96 inch
    Category: Display
    Status: Confirmed — Pico OLED post
    Affiliate link: https://amzn.to/3SZei8o

16. ADS1115 16-Bit ADC Module
    Category: Component
    Status: Confirmed — cross-referenced in MakerBLE post
    Affiliate link: https://amzn.to/4fguc5L

17. WS2812B Addressable RGB LED Ring
    Category: LED
    Status: Confirmed — LED ring post
    Affiliate link: https://amzn.to/3TneUVn

18. Micro SD Card Module for Arduino
    Category: Storage
    Status: Confirmed — GPS tracker, solar panel posts
    Affiliate link: https://amzn.to/4ypLENG

19. Waveshare 1.54 Inch e-Paper Display
    Category: Display
    Status: Confirmed — e-Paper post
    Affiliate link: https://amzn.to/4hgKrSJ

20. ESP32 D1 Mini Development Board
    Category: Microcontroller
    Status: Confirmed — Haptic joystick post
    Affiliate link: https://amzn.to/4vAwqTI

21. Seeed Studio XIAO nRF52840 
    Category: Microcontroller
    Status: Confirmed — MakerBLE post
    Affiliate link: https://amzn.to/4vt1DIp

22. MPU9250 9-DoF IMU Accelerometer Gyroscope Magnetometer
    Category: Sensor
    Status: Confirmed — Magnetometer calibration post
    Affiliate link: https://amzn.to/4gBlyRB

23. INA226 Current Voltage Sensor Module
    Category: Sensor
    Status: Confirmed — Solar panel post
    Affiliate link: https://amzn.to/4vyuElR

24. 1k Ohm Potentiometer Kit 60 Piece
    Category: Component
    Status: Confirmed — Solar panel post
    Affiliate link: https://amzn.to/45b6J0V

25. Breadboard 400 Tie Points
    Category: Prototyping
    Status: Confirmed — Solar panel post
    Affiliate link: https://amzn.to/3T6Cq90

26. 16GB Micro SD Card
    Category: Storage
    Status: Confirmed — Solar panel post
    Affiliate link: https://amzn.to/4pl6h9I

27. Small Solar Panel 2V 120mA
    Category: Power
    Status: Confirmed — Solar panel post
    Affiliate link: https://amzn.to/4gGB52E

28. 2 Axis Analog Joystick Module
    Category: Input
    Status: Confirmed — Haptic joystick, OLED posts
    Affiliate link: https://amzn.to/4vxCk84

29. 3.7V Vibration Motor
    Category: Actuator
    Status: Confirmed — Haptic joystick post
    Affiliate link: https://amzn.to/4aPSeDi
 
30. 3/4 Inch Hall Effect Flow Meter
    Category: Sensor
    Status: Confirmed — Water-metering post
    Affiliate link: https://amzn.to/4pn2OHP

---

## Shared power (BLExAR + Biquadia)

31. 3.7V LiPo Battery 600mAh with USB Charger
    Category: Power
    Status: Confirmed — GPS tracker, solar panel posts
    Affiliate link: https://amzn.to/4w87XGn

32. 12V 2A Power Supply Barrel Jack
    Category: Power
    Status: Confirmed — Stepper motor post
    Affiliate link: https://amzn.to/4bqjiZS

33. 5V 3A USB-C Power Supply
    Category: Power
    Status: Confirmed — LED ring, Raspberry Pi 4 posts
    Affiliate link: https://amzn.to/4w0KtTj

---

## Biquadia — audio lab

34. Behringer UMC1820
    Category: Audio interface
    Status: Confirmed — already live in affiliate-links.json (inside-biquadia)
    Affiliate link: https://amzn.to/4f4GLlH

35. USB Sound Card
    Category: Audio
    Status: Confirmed — Water-metering (WaWiCo) post
    Affiliate link: https://amzn.to/4vAyWcC

36. ADMP401 MEMS Microphone Breakout
    Category: Audio
    Status: Confirmed — Water-metering post
    Affiliate link: https://amzn.to/4woukrj

37. iRig Pro Duo
    Category: Microphone
    Status: iPhone / iPad Compatible USB Mic with stereo XLR input
    Affiliate link: https://amzn.to/3RDPr9J

38. Shure MV88+ Video Kit
    Category: Microphone
    Status: Mobile Microphone with Digital Stereo Condenser Modules
    Affiliate link: https://amzn.to/3TDGIov

---

## nymic — USB microphone app

39. Shure MV7
    Category: Microphone
    Status: Podcast Dynamic Microphone with Stand, USB-C & XLR Outputs, Auto Level Mode, Digital Pop Filter
    Affiliate link: https://amzn.to/4wLNQ0t

40. Blue Yeti Nano
    Category: Microphone
    Status: Compact USB Microphone for PC, Mac, PS4, Gaming, Streaming, Podcast, Mute Button
    Affiliate link: https://amzn.to/4wM9gdX

41. Rode NT-USB Plus
    Category: Microphone
    Status: USB Microphone For Recording Studio Quality Audio Directly To A Computer Or Mobile Device
    Affiliate link: https://amzn.to/4f63VrS

---

## akous — binaural / reference audio

42. Audio-Technica ATH-M50x
    Category: Headphones
    Status: reference headphones for binaural
    Affiliate link: https://amzn.to/4gGh7F4

43. Sony MDR-7506
    Category: Headphones
    Status: professional studio headphones
    Affiliate link: https://amzn.to/3TlPmYF

44. Sennheiser Pro Audio Wireless Microphone System
    Category: Microphone
    Status: Shotgun microphone for ambient noise recording, nature sounds
    Affiliate link: https://amzn.to/44tdJWX

---

## MotionLink

45. Apple AirPods Pro 3
    Category: Wearable
    Status: Headphone Motion API for MotionLink head tracking
    Affiliate link: https://amzn.to/4ytlycU

---

## itria — AI/ML books

46. Deep Learning (Adaptive Computation and Machine Learning series)
    Category: Book
    Status: Authoritative textbook used in university courses worldwide
    Affiliate link: https://amzn.to/4hfNk6k

47. Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow by Aurelien Geron
    Category: Book
    Status: Practical guide with code examples and real-world applications
    Affiliate link: https://amzn.to/4wFvNJi

48. Designing Machine Learning Systems by Chip Huyen
    Category: Book
    Status: Comprehensive guide covering the entire ML lifecycle from design to deployment
    Affiliate link: https://amzn.to/4wCHksW

---

## Studio / general (optional — not app-specific)

49. SANDISK 1TB Extreme Portable SSD
    Category: Storage
    Status: High-speed external SSD for project storage and backups
    Affiliate link: https://amzn.to/4ytofew

50. USB-C Multiport Hub Dock
    Category: Accessory
    Status: USB-C docking station for connecting multiple peripherals
    Affiliate link: https://amzn.to/4fEltLO

---

## quaternion-euler-converter — added 2026-07-17, not yet confirmed

51. 3D Math Primer for Graphics and Game Development (Dunn & Parberry)
    Category: Book
    Status: Suggested — the standard reference for the axis-angle/quaternion/gimbal-lock material added to the quaternion ↔ Euler converter's math section. Not yet confirmed you own/use this exact edition.
    Affiliate link: (needs SiteStripe)

52. Adafruit BNO055 9-DOF Absolute Orientation IMU (outputs quaternions directly)
    Category: Sensor
    Status: Suggested — a real hardware IMU that outputs quaternion attitude natively (same data shape as CMHeadphoneMotionManager's attitude.quaternion), a natural "build this yourself" pick for readers of the quaternion ↔ Euler converter page. Not yet confirmed you own/use this exact board.
    Affiliate link: (needs SiteStripe)

53. MPU6050 6-DoF Accelerometer + Gyroscope (GY-521 breakout)
    Category: Sensor
    Status: Suggested — the cheaper 6-DoF sibling of MPU9250 (already live, id `mpu9250-imu`, now cross-linked to this page), no magnetometer but the same DMP quaternion output over I2C. A common first IMU for readers who don't need magnetic heading. Not yet confirmed you own/use this exact board.
    Affiliate link: (needs SiteStripe)

Note: MPU9250 (`mpu9250-imu`) and Arduino Uno R3 (`elegoo-arduino-uno-r3`) were already live picks (originally BLExAR-only) — their `relatedTo` arrays were extended to include `quaternion-euler-converter` rather than duplicating them as new entries, since they're the same real products.

---

### PCBWay / JLCPCB — live referral plus owner-gated projects (2026-07-19)

- **PCBWay:** Shared Projects pay 10% PCB + 10% SMT when others order that design; separate referral ~5% + coupons. Ideal flow: sim exports Gerbers/stackup → “Order this board on PCBWay” with shared-project or referral link. Placement: SI Lab, Antenna EM, Verilog Sculptor export-adjacent, not random banners.
- **JLCPCB:** Referral program coupon-heavy; Brand Advocate / free PCB sponsorship / co-brand is high-leverage path for content site. Do not invent a % commission. CTA copy: “Order PCB” / “Sponsor boards” only after owner has real terms.
- **Status:** PCBWay generic referral is live, sponsored, and disclosed. Shared
  Projects remain empty; JLCPCB remains empty. `buildPcbWayUrl`,
  `buildJlcUrl`, `isFabLive()`, and `FabOrderPanel.astro` preserve that split.
- **Owner action later:** provide a real reviewed project URL only after a board
  design exists. Add it with `merchant: pcbway`, no ASIN, then update privacy
  and monetization docs. JLCPCB stays deferred until the owner supplies terms.

### SaaS — stable affiliates only (owner decision 2026-07-19)

- **ElevenLabs PartnerStack:** LIVE — `https://try.elevenlabs.io/jzowx8mw6p6b`, 22% recurring commission (to us, not customer discount). Stable, approved.
- **Pinecone Affiliate Partner:** PENDING — application submitted via https://www.pinecone.io/partners/. No public rate published. Stable affiliate path per official partner page (Technology / Referral / Affiliate — Affiliate targets technical builders/educators). Keep empty until approved URL arrives. Never commit API key.
- **Rejected — Modal, Fly.io, Supabase, Neon, Cloudflare, Sentry:** No verified public affiliate program with stable commission. Prior sweep considered DevRel credit-grant / free-token path for Modal/Fly — owner explicitly rejected 2026-07-19. Labs remain educational only (`modal-gpu-benchmarker`, `fly-edge-db-lab`). Do not pursue credit grants, do not tailor outreach, do not request workspace/org handles. Future agents must not re-open credit-engine path without explicit owner reversal. PartnerStack + Pinecone are the only approved SaaS affiliate avenues.
- **Rule:** Only established, stable affiliate programs with public terms and persistent destination URLs. No free-token / credit-grant / ephemeral promo programs.

### PartnerStack Network marketplace sweep (2026-07-19) — do not re-sweep

Owner reviewed the full PartnerStack Network Marketplace (~50 programs) on 2026-07-19. Verdict: **no new integrations now.** The marketplace is B2B-SaaS; this site's audience is builders (embedded, DSP/audio, iOS, on-device AI, privacy-first), and traffic is near-zero (Search Console recheck ~2026-07-29), so every program's near-term expected value is ~$0 and several programs reject new/low-traffic sites outright. Do not re-sweep the marketplace or re-research the rejected categories below without an explicit owner request.

**Verified against public program pages (2026-07-19):**

| Program | Verified public terms | Network | Status for this site |
| :--- | :--- | :--- | :--- |
| Kit (ex-ConvertKit) | 50% commission for 12 months; tiers add +10/15/20% lifetime recurring at 10/50/100 referrals/yr (kit.com/affiliate) | PartnerStack | Strongest marketplace fit (creator email). Deferred — owner runs Buttondown; only honest path is a real comparison field note, and only after a traffic baseline exists. |
| Thinkific | 30% lifetime recurring (Plus: flat $150/mo), 90-day cookie, $25 min payout (thinkific.com/affiliates) | PartnerStack | Only if a real course product ever ships. Not before. |
| 1Password | Public program runs on CJ, not PartnerStack: $2/signup + 25% of first payment, $2 min (1password.com/affiliate) | CJ (PS listing also exists) | Privacy-arch pillar fit. Confirm which network the PS listing honors before applying. |
| Brevo | Fixed commission, 90-day cookie; **rejects new sites without traffic**, requires domain-matching professional email (brevo.com/affiliates) | PartnerStack | Traffic-gated — do not apply yet. |
| Webflow | 50% rev share up to 12 months, 90-day cookie; **rejects low-traffic sites**, requires publishing content within 30 days of acceptance (webflow.com/affiliates) | PartnerStack | Skip — weak fit (site hand-codes Astro) plus traffic gate. |
| ElevenLabs | Marketplace lists 22% for first 12 months — matches the live deal exactly | PartnerStack | Already live. Marketplace copy validated as accurate. |

PartnerStack payout mechanics (via Thinkific's public FAQ): monthly payouts ~13th, 30-day reconciliation hold, $25 minimum, PayPal or Stripe. Joining the PartnerStack Network is free and non-binding; each program approves separately and issues its own destination URL, which then goes into `affiliate-links.ts` + `/privacy` in the same change (established ElevenLabs pattern).

**Unverified (marketplace copy only, no public page confirmed):** Riverside (up to 25%), Descript ($25 flat), Optery (30%/12mo), Tidio, Gorgias, Glide, Unbounce, Circle, LearnWorlds, ActiveCampaign. All need audience-with-a-business intent the site doesn't pull yet; revisit only with real products (course, recording/podcast) or explicit owner request.

**Rejected categories (do not re-research):**
- HR/payroll/fintech/accounting (Deel, Gusto, Melio, Papaya, Airwallex, Aspire, QuickBooks, Xero) — eye-catching payouts, zero audience intent. QuickBooks' listed offer is a customer discount, not cash commission — against the commission-not-discount norm.
- Sales/CRM (Apollo, Pipedrive, Close, CallRail, monday.com, Clutch, Ignition, Aircall) — B2B sales tools this audience doesn't buy.
- Enterprise security (Tenable) — enterprise sales cycle, no self-serve conversion.
- Consumer antivirus/identity (Bitdefender, Aura) — coupon-site spam vertical; brand risk on a privacy-first site.
- Bright Data — proxy/data-collection network; clashes with the D-011 anti-scraping-abuse stance and the privacy-arch pillar.
- Misc off-pillar/tiny payouts — AdCreative.ai, Manychat, SocialBee, Superfiliate, SPS Revenue Recovery, Tapstitch, Landingi, Format, VisualCV, Trainual, Sendcloud, Sunsama, Beautiful.ai, Emergent, doola.

**Rule for any future SaaS affiliate:** it must (1) be on the approved stable list (PartnerStack network or direct equivalent with public terms + persistent destination URL — no credit-grant/free-token programs), (2) attach to a real lab/note/product the way ElevenLabs did — no banners, (3) pass the own/use confirmation norm of this file, and (4) wait for a traffic baseline (Search Console recheck) before applying to programs that gate on traffic.

### Next steps
1. Copy each numbered line into Amazon search / SiteStripe to find the real listing and generate the link.
2. Paste the result on that item's Affiliate link line — a bare ASIN is fine.
3. Edit freely — delete anything that doesn't fit, fix any Suggested item (37-44, 46-52 especially) to match what you actually use.
4. Once a batch is ready, tell me and I'll turn the confirmed entries into affiliate-links.json entries (with relatedTo/pillars set per section) — same review-before-ship posture as everything else in this pipeline (see docs/DECISIONS.md D-011/D-015).
5. For PCBWay Shared Projects/JLCPCB: do not invent IDs or project URLs. Prefer
   an empty placement over an unverified destination.
