---
title: "LiteFS multi-region SQLite: local reads, primary writes, and the latency bill"
description: "A practical mental model for LiteFS multi-region SQLite: single-primary writes, local replicas, fly-replay forwarding, read-your-writes, and honest latency modeling."
publishedAt: 2026-07-19
draft: false
tags: [sqlite, litefs, fly-io, edge, distributed-systems]
eyebrow: "Field note / Edge databases"
readingTime: "8 min read"
faq:
  - question: "Is LiteFS a multi-writer SQLite system?"
    answer: "No. The normal LiteFS topology has one primary writer and read replicas. Write requests must reach the primary, while replicas receive changes and can serve local reads."
  - question: "Does a nearby LiteFS replica guarantee a fresh read?"
    answer: "No. Replication is asynchronous. Fly's built-in LiteFS proxy can use a transaction-position cookie and wait for a replica to catch up, trading some read latency for read-your-writes consistency."
  - question: "Are the latency numbers in MakerPortal's Edge DB Sync Lab real pings?"
    answer: "No. They are a disclosed physics model based on great-circle distance, light speed in fiber, and a route multiplier. They are useful for comparing topology, not for choosing a production region without measurements."
---

“Put SQLite at the edge” sounds like one decision. It is at least three: where writes are allowed, where reads are served, and what happens when a client reads immediately after a write. LiteFS makes the topology approachable, but it does not repeal distance or turn SQLite into a conflict-free multi-writer database.

The useful mental model is simple: **one primary accepts ordinary writes; replicas copy the database and serve nearby reads; requests move when semantics require it.**

The [Edge DB Sync Lab](/playground/fly-edge-db-lab) lets you place that topology on a world map before you deploy it.

## The single-writer invariant is the feature

SQLite's transaction semantics are strongest when one database file has one write authority. LiteFS preserves that model across regions. Fly's documentation describes LiteFS as a single-primary system: the primary writes and replicates changes to other nodes for fast reads. The current primary can be discovered through LiteFS's `.primary` file; on a connected replica the file names the primary, while on the primary it is absent. See Fly's official guide to [determining the LiteFS primary](https://fly.io/docs/litefs/primary/).

That yields a clean request split:

```text
GET /projects/42       → local replica (subject to consistency policy)
POST /projects         → forward to primary
PUT /projects/42       → forward to primary
DELETE /projects/42    → forward to primary
```

This convention breaks if a nominal `GET` performs writes. It also means the primary region remains part of every write's latency budget, even when a replica is next door to the user.

## `fly-replay` moves the request; LiteFS moves the data

On Fly.io, the built-in LiteFS HTTP proxy can inspect the request and forward write methods to the primary using the `fly-replay` header. The official [LiteFS proxy documentation](https://fly.io/docs/litefs/proxy/) also explains the consistency path: a response from the primary records a replication position in a cookie, and a later replica read can wait until its database reaches that position.

That distinction matters:

- **Write forwarding** gets the operation to the only node allowed to commit it.
- **Replication** moves the resulting database changes toward replicas.
- **Read-your-writes waiting** prevents one client from immediately observing a version older than its own write.

Local reads are not automatically fresh reads. If your product can tolerate bounded staleness, you may choose a looser policy. If it cannot, the catch-up wait is part of the latency envelope and should be measured.

The built-in proxy also has an important limitation: Fly documents that it does not proxy WebSockets. A WebSocket application can still use LiteFS, but it must route writes to the current primary inside the application.

## A physics model is useful—as long as it stays labeled a model

Before deployment, geography can answer directional questions: does adding a Singapore replica help Singapore reads? How far does a write travel if the primary remains in Virginia? It cannot predict congestion, peering, TLS reuse, instance wake-up, queueing, SQLite lock time, fsync, or replication lag.

The lab uses a disclosed lower-level model:

```text
one_way_distance_time = haversine_km / (c / 1.468)
modeled_RTT = 2 × one_way_distance_time × 1.5
```

`1.468` is the refractive-index approximation used to slow light from vacuum speed to fiber speed. `1.5` is an explicit route-stretch assumption because cables do not follow great-circle paths. The animation adds a small disclosed compute constant so two routes with the same distance still have something to render.

Those values are not a Fly benchmark. Change the topology and compare the direction and ratio. Then deploy and replace the model with actual request timing.

## The topology comparison that matters

Suppose a client is near replica `R`, and the write primary is `P`:

```text
local read ≈ client ↔ R + replica compute
forwarded write ≈ client ↔ nearest edge + edge ↔ P + primary commit
```

The first path benefits immediately from another replica. The second still pays for the primary. Moving the primary helps one write population and hurts another, so primary placement should follow write origin and failure policy—not the prettiest center point on a map.

The lab's aha ratio compares the most recent modeled write with a nearby modeled read only after both exist. It does not display a default “7× faster” claim, because that ratio depends entirely on the regions you selected.

## Deployment details worth deciding before the demo becomes architecture

1. **Lease strategy.** Decide which region can become primary and how promotion is coordinated. Fly's [LiteFS configuration reference](https://fly.io/docs/litefs/config/) documents static and Consul lease options.
2. **Migration ownership.** Run schema changes from the write authority and account for replicas that may see database changes before new application code reaches them.
3. **Consistency cookie behavior.** Test clients that disable cookies and non-browser API consumers.
4. **WebSocket routing.** Implement explicit primary forwarding for state-changing messages.
5. **Failure UX.** A missing `.primary` file can mean “this node is primary” or “the node cannot determine the primary.” Treat a failed write as a real state, not a retry loop without a limit.
6. **Measurements.** Record warm and cold paths, p50 and tail latency, replication catch-up, and commit time separately. Do not replace them with the map model in a capacity plan.

## FAQ

### Is LiteFS multi-writer SQLite?

No. The standard topology has one primary writer and read replicas. That constraint preserves SQLite's write model and keeps conflict resolution out of the application path.

### Does the nearest replica guarantee a fresh read?

No. Replication is asynchronous. The proxy's transaction-position cookie can make a replica wait for read-your-writes consistency, which intentionally trades latency for freshness.

### Are the lab's milliseconds real Fly pings?

No. They are a visible physics model using distance, fiber speed, and route stretch. Use them to reason about placement, then validate a deployment with measurements.

Open the [multi-region SQLite lab](/playground/fly-edge-db-lab), move the primary, and watch which path actually changes. If the same system also runs bursty verification jobs, the [client-versus-serverless GPU lab](/playground/modal-gpu-benchmarker) applies the same discipline to compute: keep fixed overhead separate from work time, and leave missing measurements blank.

For hardware context, [Resources · Gear](/resources#gear) lists the Pi + SSD home replica lab behind the Fly Edge Lab stack, and [/playground](/playground) groups the edge and RTOS instruments together.
