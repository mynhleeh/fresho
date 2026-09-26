---
trigger: always_on
description: "FRESH O! project charter: product summary, actors, domain glossary, order lifecycle state machine, and ambiguity-handling policy."
---

# 00. Project Charter — FRESH O!

## 1. Product Summary

FRESH O! is a mobile app and website connecting farmers (supply side) with bulk buyers (demand side: restaurants, kitchens, food stores) through a "pre-harvest booking" model. Farmers post an upcoming harvest 7-14 days before it is ready; buyers reserve part or all of the batch in advance. The platform mediates matching, deposits, logistics quoting, delivery tracking, and post-delivery settlement.

This charter states only what is required to write correct code. Full business rationale lives in `docs/`; do not duplicate it here.

## 2. Actors & Roles

| Actor | Description | Core permissions |
|---|---|---|
| Farmer | Posts harvest batches, confirms/rejects pre-orders, updates harvest progress | Full CRUD on own batches; read/write on own orders |
| Buyer | Searches batches, places pre-orders, confirms receipt | Read on public batches; read/write on own orders |
| Operator/Admin | Platform staff monitoring transactions and disputes | Read on all orders; write on dispute resolution and moderation |
| Logistics partner | Fulfills shipping requests | Read/write on assigned delivery records only |
| AI assist | Suggests price range, packaging, buyer-batch matching, demand forecast | Advisory output only; never final decision-maker on price or order state |

## 3. Domain Glossary

Use these English identifiers consistently across code, database, and API. Do not invent synonyms.

| Vietnamese term | English identifier | Notes |
|---|---|---|
| Mùa vụ / lô hàng | `harvest_batch` | One posted harvest listing |
| Đặt trước | `pre_order` | A buyer's reservation against a batch |
| Đặt cọc | `deposit` | Partial payment securing a `pre_order` |
| Đối soát | `settlement` | Final reconciliation of quantity, price, deposit, shipping fee |
| Uy tín | `trust_score` | Rating accumulated per actor from completed orders |
| Cước vận chuyển | `shipping_fee` | Always quoted separately from goods price |
| Bàn giao | `handover` | Physical transfer event, self-pickup or carrier pickup |

## 4. Order Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> open
    open --> pending_confirmation: pre_order placed
    pending_confirmation --> deposited: farmer confirms + deposit paid
    pending_confirmation --> rejected: farmer rejects
    deposited --> awaiting_harvest
    awaiting_harvest --> ready_for_handover: farmer marks ready
    ready_for_handover --> in_transit: carrier picks up
    ready_for_handover --> delivered: self-pickup completed
    in_transit --> delivered: carrier delivers
    delivered --> settled: buyer confirms + final payment
    pending_confirmation --> cancelled
    deposited --> cancelled
    cancelled --> [*]
    settled --> [*]
    rejected --> [*]
```

This is the single source of truth for order status values. Any module reading or writing order status MUST reference this exact set of states; do not introduce ad hoc statuses.

## 5. Ambiguity-Handling Policy

When the business context does not specify enough detail to implement a feature:

1. Choose the simplest assumption consistent with the state machine and glossary above.
2. Mark the assumption inline: `// TODO(business-confirm): <assumption and why>`.
3. Never invent financial, legal, or payout logic beyond what is explicitly stated; stop and ask instead.

## 6. Explicitly Out of Scope for This Project

This charter intentionally omits the heavy-process elements used in other workspaces:

- No Anti-One-Shot 4-step gate on every code-modifying turn.
- No `.ops-memory/` decision ledger.
- No mandatory academic-grounding hierarchy.

Code is written directly against this charter and normal code review, not against a frozen requirements deliverable.
