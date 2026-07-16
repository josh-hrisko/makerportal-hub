---
title: "What CMHeadphoneMotionManager actually gives you (and doesn't)"
description: "Building MotionLink on the Headphone Motion API: quaternion attitude, why the reference frame resets on every launch, and the recentering pattern that took real device testing to find."
publishedAt: 2026-07-15
draft: false
tags: [motionlink, coremotion, spatial-audio, ios-craft]
eyebrow: "Field note / MotionLink"
readingTime: "5 min read"
---

Apple's own documentation for `CMHeadphoneMotionManager` is thin — a handful of property listings, no worked example of what to do with the data once it arrives. Most of the coverage that exists online is about `AVAudioEnvironmentNode`'s built-in head-tracked spatial audio, which uses this same sensor pipeline under the hood but hides it behind a higher-level API. If you want the raw motion stream — to drive a head-controlled interface, or to log orientation data for research — you're mostly reading header comments and finding out the rest on-device. [MotionLink](https://makersportal.com/apps/motionlink) exists because we needed the raw stream, not the abstraction.

## The data comes as a quaternion, not angles

Every `CMDeviceMotion` update off the manager carries `attitude.quaternion` — an `(x, y, z, w)` unit quaternion describing the headphone's orientation. That's the right representation for the sensor to emit: quaternions don't suffer gimbal lock and interpolate cleanly, which matters at the update rates CoreMotion runs at. But almost nothing downstream wants a quaternion directly. A head-controlled UI wants yaw to pan a view; a spatial-audio prototype wants yaw/pitch to feed a panner. So the first real piece of code in MotionLink is a quaternion→Euler conversion:

```swift
func yawPitchRoll(from q: CMQuaternion) -> (yaw: Double, pitch: Double, roll: Double) {
    let yaw = atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z))
    let pitch = asin(max(-1, min(1, 2 * (q.w * q.y - q.z * q.x))))
    let roll = atan2(2 * (q.w * q.x + q.y * q.z), 1 - 2 * (q.x * q.x + q.y * q.y))
    return (yaw, pitch, roll)
}
```

The `max(-1, min(1, …))` clamp on the pitch term isn't decorative — floating-point drift can push the asin argument fractionally outside `[-1, 1]`, and an unclamped call there returns `NaN` that silently propagates into every UI value downstream. That one didn't show up in the simulator; it showed up as an occasional frozen head-tracking cursor on a real AirPods Pro after several minutes of continuous motion.

## The reference frame is relative, and it resets every time

This is the gotcha that isn't in the docs anywhere we found: `CMHeadphoneMotionManager` does not give you an absolute, gravity-and-magnetic-north-referenced attitude the way `CMMotionManager`'s device-motion API can with `CMAttitudeReferenceFrame`. The headphone manager gives you one reference frame, and it's relative — whatever orientation the headphones happen to be in the moment you call `startDeviceMotionUpdates`, that becomes the implicit zero point. Face left, launch the app, and "forward" in your data is now pointing left.

For a research data-capture tool that's a problem worth flagging in your own recording metadata (log the wall-clock time tracking started, since that's your only anchor). For a head-controlled interface it's a UX problem: users expect "center" to mean roughly where they're currently facing, not wherever their head happened to be when the screen loaded. MotionLink's answer is a manual recenter — capture the current attitude as a baseline offset on a UI action (a tap, not automatic), and subtract that offset from every subsequent quaternion before converting to Euler. It's a small amount of code, but it's not something you'd think to build until you've watched the "forward" direction be wrong on a real pair of headphones.

## Two more things that only show up on hardware

- **The simulator can't produce this data at all.** `isDeviceMotionAvailable` returns `false` there, full stop — every iteration of the recentering logic above had to be tested on physical AirPods Pro, not in Xcode Previews.
- **The update handler fires off the main thread.** Like `CMMotionManager`, you hand `startDeviceMotionUpdates` an operation queue, and any UI mutation in that closure needs an explicit `DispatchQueue.main.async` — easy to forget once, and the symptom (a UI that updates but stutters or occasionally doesn't render) doesn't obviously point back to the thread it's running on.

None of this is exotic. It's the kind of friction that costs an afternoon the first time and is genuinely undocumented the first time you hit it — which is exactly the gap a field note like this is for.

MotionLink pairs specifically with [AirPods Pro](/resources#gear) — the Headphone Motion API only reports data from H1/W1-chip headphones, which is why that's the one gear pick tied to this build on `/resources`. If you're building anything in the [`ios-craft`](/resources#trending) space that touches CoreMotion, the quaternion clamp above is worth stealing outright.

Want to see the math live instead of reading it? The [quaternion ↔ Euler converter](/tools/quaternion-euler-converter) runs both directions with a live 3D orientation preview and copyable Swift for each.
