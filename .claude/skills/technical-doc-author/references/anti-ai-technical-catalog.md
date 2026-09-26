---
description: "Catalog of 34 AI stylistic tells, three-tier vocabulary replacement matrix, punctuation discipline, and five-dimension scoring metric across 8 technical document archetypes."
version: "3.3.0"
---

# Anti-AI Technical Catalog & Humanization Guide

This guide establishes mechanical rules to identify, analyze, and eliminate machine-generated stylistic artifacts from software engineering documentation. Every rule operates on countable conditions, regular expressions, and verifiable pass/fail criteria.

---

## 1. Core Mechanics of AI Style in Technical Writing

Large language models (LLMs) operate by predicting the next token based on statistical probabilities over broad internet training corpuses. When generating text, models gravitate toward the statistical mean: phrasing that minimizes controversy and satisfies generic patterns. In technical documentation, this default mechanism generates distinct failure modes:

1. The Regression to the Mean Trap:
Models select word sequences with the highest frequency across general web text. Rigorous engineering documentation requires asymmetric, domain-specific vocabulary tied to physical parameters and logical constraints. Statistical averaging renders technical writing generic, diffuse, and devoid of operational precision.

2. Staging Instead of Stating:
Because models lack operational experience and never deploy software, they create artificial weight through dramatic framing, false contrasts ("not merely X, but Y"), and dramatic concluding sentences. Working engineers need direct facts, configuration parameters, and business invariants without theatrical setup.

3. Hedging and Commitment Avoidance:
Safety alignment training conditions models to avoid absolute statements. Models habitually insert qualifiers such as "potentially", "generally", "in most scenarios", and "it is worth noting". In technical specifications and API contracts, these qualifiers undermine strict system invariants.

4. The Em-Dash as an Undifferentiated Connector:
Models use em-dashes as a convenient shortcut to attach secondary clauses without determining their exact syntactic or logical relationship (causal, temporal, or restrictive). This habit produces disjointed sentences that erode technical authority.

5. Adjective Inflation Over Empirical Metrics:
When specific architectural details or latency figures are missing, models compensate with inflated praise: "robust", "pivotal", "seamless", and "cutting-edge". In software specifications, adjectives without empirical thresholds are noise.

---

## 2. Catalog of the 34 Technical AI Tells

### Group A: Staging Instead of Stating

#### Tell 01: Faux-Contrast "Not X but Y" Framing

Failure Mechanism:
The model negates an unstated misconception to introduce an affirmative fact, inflating perceived importance while consuming reader attention without adding technical value.

Mechanical Identification:
Regular expression: `/(not (only|just|merely)).*(but (also)?)/i` or `/(rather than|instead of).*, (it is|we find)/i`.

❌ Before:
> This distributed cache is not merely a memory storage tier, but rather an architectural nervous system that elevates enterprise scalability.

✅ After:
> The distributed cache persists session states across 32 nodes with a P99 retrieval latency below 4 milliseconds.

#### Tell 02: One-Line Dramatic Closers

Failure Mechanism:
A standalone sentence placed at the end of a descriptive paragraph to simulate emotional profundity: "That is where the real value lies" or "Let that sink in".

Mechanical Identification:
Standalone single-sentence paragraph under 15 words following a descriptive block, containing words such as "real value", "critical takeaway", "game changer", or "let that sink in".

❌ Before:
> By routing write operations to local read-replicas, the database minimizes cross-region lock contention.
>
> That changes everything for distributed consistency.

✅ After:
> Routing write operations through local read-replicas reduces cross-region lock contention from 450 milliseconds to 35 milliseconds.

#### Tell 03: Philosophical Truisms and Grand Generalizations

Failure Mechanism:
Opening a technical topic with broad platitudes about software, data, or digital transformation rather than stating immediate technical boundaries.

Mechanical Identification:
Opening sentences containing: "In today's fast-paced digital world", "Software systems are constantly evolving", or "Data is the lifeblood of modern enterprise".

❌ Before:
> In today's hyper-connected enterprise ecosystem, reliable communication between microservices has become more essential than ever before.

✅ After:
> The payment processing pipeline uses gRPC over HTTP/2 with mutual TLS for inter-service communication.

#### Tell 04: Staged Run-Ups and Promotional Openers

Failure Mechanism:
Preambles that announce the text is about to explain something important instead of delivering the information directly.

Mechanical Identification:
Phrases matching `/(let us (delve|explore|examine)|here is what you need to know|it is crucial to understand)/i`.

❌ Before:
> Before looking at the consensus implementation, let us delve into the fundamental mechanics of distributed state machines.

✅ After:
> The consensus engine implements Raft leader election with a heartbeat interval of 150 milliseconds.

#### Tell 05: Arguing with Ghost Opponents

Failure Mechanism:
Inventing hypothetical objections or imaginary skeptics to manufacture rhetorical conflict before presenting standard architectural choices.

Mechanical Identification:
Phrasing matching `/(critics might argue|one might wonder why|some may doubt the necessity of)/i`.

❌ Before:
> Critics might argue that relational schemas restrict agility, but strict foreign keys ensure transactional integrity across account balances.

✅ After:
> PostgreSQL foreign key constraints enforce referential integrity across customer balance tables during concurrent settlements.

---

### Group B: Mechanical Rhythm and Punctuation Traps

#### Tell 06: Forced Adjective and Clause Triads

Failure Mechanism:
Structuring descriptions in sets of three parallel adjectives or noun phrases to create synthetic rhetorical cadence.

Mechanical Identification:
Sentences containing patterns matching `/\b\w+, \w+, and \w+\b/` where items are subjective descriptors (such as "reliable, scalable, and secure").

❌ Before:
> The gateway provides an API that is fast, resilient, and developer-friendly.

✅ After:
> The gateway exposes an OpenAPI 3.1 interface with rate limiting at 5,000 requests per second per tenant.

#### Tell 07: Monotonous Sentence Openers

Failure Mechanism:
Starting three or more consecutive sentences with the identical grammatical construct, frequently participial phrases (`-ing`) or transitional adverbs ("Additionally", "Furthermore").

Mechanical Identification:
Three consecutive sentences starting with identical grammatical types or words.

❌ Before:
> Additionally, the message broker buffers incoming telemetry streams. Additionally, the ingestion worker writes micro-batches to ClickHouse. Additionally, the monitor triggers alerts on dead-letter queues.

✅ After:
> The message broker buffers incoming telemetry streams. Ingestion workers then flush micro-batches to ClickHouse every 500 milliseconds. When unparseable payloads occur, the dead-letter queue dispatcher emits an alert.

#### Tell 08: Em-Dashes as Universal Connectors

Failure Mechanism:
Using em-dashes (`—`) or double hyphens (`--`) to avoid selecting precise coordinating or subordinating conjunctions.

Mechanical Identification:
Occurrences of `—` or `--` used as sentence punctuation, outside inline code spans and fenced code blocks. Count must equal 0. (An em-dash inside an inline code span that preserves an external source's verbatim official title is exempt; see Section 4.)

❌ Before:
> The scheduler deploys tasks to worker pods—ensuring optimal resource allocation—while monitoring memory limits.

✅ After:
> The scheduler deploys tasks to worker pods to balance CPU load, while enforcing a 2 GiB memory ceiling per container.

#### Tell 09: Stacked Defensive Qualifiers

Failure Mechanism:
Nesting multiple hedges within a single assertion to avoid definitive commitments.

Mechanical Identification:
Sentences containing two or more qualifiers from: "generally", "typically", "often", "potentially", "largely", "in most respects".

❌ Before:
> The ingestion worker generally tends to process batches within approximately two seconds under typical circumstances.

✅ After:
> Under nominal load (10,000 records per batch), worker processing completes within 1.8 seconds.

#### Tell 10: Symmetrical Hyphenated Buzzword Pairs

Failure Mechanism:
Overusing hyphenated compound descriptors such as "mission-critical", "cloud-native", "future-proof", and "battle-tested" without defining concrete operational constraints.

Mechanical Identification:
Density of buzzword compounds exceeding 1 occurrence per 1,000 words.

❌ Before:
> We deliver a future-proof, cloud-native storage engine for mission-critical operations.

✅ After:
> The storage engine runs on Kubernetes, using distributed Ceph block devices replicated across three availability zones.

#### Tell 11: Agentless Passive Voice

Failure Mechanism:
Omitting the executing system, process, or actor responsible for a technical event.

Mechanical Identification:
Sentences matching `/(is|was|were|been) (executed|processed|updated|stored)/` lacking an explicit agent (`by [system/actor]`).

❌ Before:
> After validation, data is written to the persistent layer and events are emitted.

✅ After:
> After validating the payload, the order service writes records to PostgreSQL and publishes an `OrderCreated` event to Kafka.

---

### Group C: Inflation and Borrowed Authority

#### Tell 12: Overused AI Vocabulary

Failure Mechanism:
Defaulting to high-frequency LLM tokens that signify importance without communicating quantitative parameters.

Mechanical Identification:
Presence of banned Tier-1 words: delve, tapestry, landscape, pivotal, foster, robust (figurative), leverage (verb), seamless, utilize.

❌ Before:
> We delve into the microservices landscape to leverage event streaming and foster seamless subsystem communication.

✅ After:
> We configure Apache Kafka partitions to route event streams between payment and inventory microservices.

#### Tell 13: Inflated Significance and Breathless Framing

Failure Mechanism:
Describing routine software design choices with monumental vocabulary: "paradigm shift", "revolutionary", "groundbreaking", or "transformational".

Mechanical Identification:
Presence of words matching `/(paradigm shift|revolutionary|groundbreaking|quantum leap|unprecedented)/i`.

❌ Before:
> Migrating our schema to JSONB represents a revolutionary paradigm shift for our query architecture.

✅ After:
> Storing semi-structured metadata in PostgreSQL JSONB columns avoids table migrations for dynamic tenant attributes.

#### Tell 14: Vague Superficial Linkages

Failure Mechanism:
Connecting two separate components using superficial phrases such as "is closely linked to", "plays a role in", or "serves as a testament to".

Mechanical Identification:
Phrases matching `/(is tied to|plays a pivotal role in|serves as a testament to|intertwined with)/i`.

❌ Before:
> The caching layer plays a pivotal role in and is deeply intertwined with overall system performance.

✅ After:
> The Redis caching layer intercepts read requests, reducing PostgreSQL read IOPS by 78 percent.

#### Tell 15: Shallow -ing Participial Riders

Failure Mechanism:
Attaching dangling participial phrases at the end of sentences that summarize results in vague terms: "ensuring optimal efficiency", "fostering improved workflows".

Mechanical Identification:
Sentences ending with `, (ensuring|fostering|enabling|providing|creating) [abstract noun]`.

❌ Before:
> The load balancer distributes traffic across six pods, ensuring maximum operational efficiency.

✅ After:
> The load balancer uses weighted round-robin distribution to keep CPU utilization across all six pods within 15 percent of the cluster average.

#### Tell 16: Marketing and Promotional Tone

Failure Mechanism:
Adopting promotional copy style instead of objective engineering prose.

Mechanical Identification:
Phrasing matching `/(best-in-class|industry-leading|cutting-edge|tailored to your needs|unlock the power)/i`.

❌ Before:
> Our cutting-edge authentication module provides best-in-class security to unlock seamless enterprise login.

✅ After:
> The authentication module implements OAuth 2.0 with PKCE and validates JWT claims against an RSA public key.

#### Tell 17: Borrowed Authority and Academic Namedropping

Failure Mechanism:
Citing external cognitive or psychological laws without explaining their direct structural link to the technical architecture.

Mechanical Identification:
Unwarranted mentions of "Miller's Law (7 plus minus 2)", "Conway's Law", or "Dunbar's number" in technical specification sections.

❌ Before:
> In accordance with Miller's Law regarding human short-term memory limits, this dashboard displays exactly seven metrics.

✅ After:
> The operational dashboard displays primary service health indicators: error rate, request throughput, P99 latency, CPU, and memory utilization.

#### Tell 18: Copula Avoidance

Failure Mechanism:
Avoiding simple forms of "to be" (`is`, `are`) in favor of elaborate substitutes: "serves as", "acts as", "functions as", "stands as".

Mechanical Identification:
Recurrent use of `/(serves as|acts as|functions as|stands as)/` where `is` or `are` conveys identical meaning.

❌ Before:
> The API gateway serves as the single entry point for all client requests.

✅ After:
> The API gateway is the single entry point for client requests.

---

### Group D: Habitual Formatting and Typography

#### Tell 19: Bold-First Bullet Lists

Failure Mechanism:
Mechanically bolding the initial one to three words of every bullet point, creating predictable AI cadence.

Mechanical Identification:
Bullet items formatted as `- **[Word(s)]:** [Description]`.

❌ Before:
> - **Scalability:** The architecture scales horizontally across multiple availability zones.
> - **Availability:** The system maintains 99.95 percent uptime through redundant failover nodes.
> - **Security:** All network payloads undergo AES-256 encryption in transit.

✅ After:
> The system scales horizontally across three availability zones. Redundant standby instances provide automated failover to meet a 99.95 percent uptime service level objective. AES-256 GCM encrypts all network payloads in transit.

#### Tell 20: Decorative Headings and Emojis

Failure Mechanism:
Placing emojis or motivational labels inside technical headings: "🚀 Getting Started", "💡 Key Insights".

Mechanical Identification:
Unicode emojis or marketing labels located within Markdown heading lines (`#`, `##`, `###`).

❌ Before:
> ### 🚀 1.2 Quickstart & Key Wins 💡

✅ After:
> ### 1.2 Initial Environment Setup

#### Tell 21: Curly Typographic Quotes in Code Identifiers

Failure Mechanism:
Substituting straight ASCII quotes (`"`, `'`) with smart curly quotes (`“`, `”`, `‘`, `’`) inside technical specifications, breaking executable command snippets.

Mechanical Identification:
Occurrences of Unicode curly quotes (`\u201C`, `\u201D`, `\u2018`, `\u2019`) inside code snippets or configuration parameter declarations.

❌ Before:
> Run command: `curl -H “Authorization: Bearer token” https://api.service.internal/v1/health`

✅ After:
> Run command: `curl -H "Authorization: Bearer token" https://api.service.internal/v1/health`

---

### Group E: Chatbot Residue and Draft Leakage

#### Tell 22: Chatbot Conversational Residue

Failure Mechanism:
Retaining conversational meta-text directed at the prompt author: "Here is your documentation", "Certainly!", "I hope this helps!".

Mechanical Identification:
Sentences matching `/(certainly|here is the|as requested|in this document, we will|i hope this helps)/i`.

❌ Before:
> Certainly! Here is the system design document for your distributed ledger service.

✅ After:
> # Distributed Ledger Service Design Document

#### Tell 23: Knowledge Cutoff Disclaimers

Failure Mechanism:
Inserting AI model capability warnings or training cutoff disclaimers inside engineering documentation.

Mechanical Identification:
Phrases matching `/(as of my last knowledge update|as an ai|my training data)/i`.

❌ Before:
> Note: As of my last training cutoff, Kubernetes 1.30 was recently released; verify flags against current documentation.

✅ After:
> Target deployment environment: Kubernetes 1.30 on Linux kernel 6.1.

#### Tell 24: Heading Repetition in Opening Sentences

Failure Mechanism:
Opening a section by repeating the section title as the subject of the first sentence.

Mechanical Identification:
The opening sentence of section `### X.Y [Name]` begins with `[Name] is...`.

❌ Before:
> ### 3.1 Session State Management
> Session state management is an important mechanism for keeping user credentials across requests.

✅ After:
> ### 3.1 Session State Management
> The authentication proxy persists user sessions in Redis using encrypted session tokens with a 30-minute time-to-live.

#### Tell 25: Version History in Forward-Looking Specifications

Failure Mechanism:
Discussing previous drafts or historical conversation iterations in live specification documents.

Mechanical Identification:
Phrases referring to "in the previous response", "as revised earlier", or "updated version from earlier".

❌ Before:
> As discussed in our previous design iteration, we replaced MySQL with Cassandra.

✅ After:
> Storage backend: Apache Cassandra 4.1 with a replication factor of 3 across distinct availability racks.

---

### Group F: Requirements, Architecture & Structural Modeling AI Tells

#### Tell 26: Spurious Formalism & Academic Overkill (Proportional Rigor Violation)

Failure Mechanism:
Embellishing straightforward, routine business rules, standard benchmark steps, or ordinary operational logic with first-order predicate logic ($\forall, \exists, \exists!$), academic set theory notation, or trivial algebraic cancellation equations to fabricate an illusion of mathematical rigor ("Academic Ornamentation" / "Hallucinated Rigor"). True engineering rigor is proportional: reserve mathematical formalisms for cryptographic proofs, consensus algorithms, or queueing saturation limits; express standard business invariants and system constraints in precise natural language and schema invariants.

Mechanical Identification:
Formal predicate calculus operators ($\forall, \exists, \exists!$) or algebraic cancellation equations applied to basic database relationships, routine balance updates, or standard HTTP request handling.

❌ Before:
> $$\forall c \in \text{Categories}, \quad \exists! g \in \text{Groups}: \text{parent}(c) = g$$
> $$\Delta \sum_{w \in Wallets} Balance_w = (-A) + (+A) = 0$$
> $$\text{Throughput}(t) = \lim_{\delta \to 0} \frac{\int_{t}^{t+\delta} r(u)du}{\delta} \implies \text{RPS} = \text{Count} / 60$$

✅ After:
> Every subcategory must link to exactly one parent group upon creation.
> Internal wallet transfers execute as an atomic transaction: the debit to the source wallet balance must equal the credit to the destination wallet balance.
> Ingestion throughput is reported as sustained requests per second: total successfully processed requests divided by the 60-second test window duration.

#### Tell 27: Monolithic Bundling & God Operations ("Manage X" / Omnibus Anti-Pattern)

Failure Mechanism:
Bundling distinct, asynchronous, or multi-step operations into an amorphous "Manage X" / "Quản lý X" unit instead of defining discrete, atomic goals (`<Active Verb> + <Direct Object>`). This mistakes a user interface dashboard or admin menu for an engineering specification, obscuring discrete acceptance criteria, alternative flows, and failure modes.

Mechanical Identification:
Specification titles, API endpoints, or operational procedures matching `/(Manage|Quản lý)\s+\w+/i` or omnibus endpoints (such as `POST /api/v1/manage-account`). Count must equal 0.

❌ Before:
> `UC01: Quản lý ví tiền` (bundles creation, updating, archiving, balance queries, and cross-wallet transfers into a monolithic bubble).
> API: `POST /v1/manage-orders` (handles create, cancel, refund, and reassign within a single poly-payload).

✅ After:
> `UC-WAL-01: Tạo ví tiền mới`
> `UC-WAL-02: Chuyển tiền nội bộ giữa các ví`
> `UC-WAL-03: Đóng và lưu trữ ví`
> API: `POST /v1/orders` (create), `POST /v1/orders/{id}/cancel` (cancel), `POST /v1/orders/{id}/refund` (refund).

#### Tell 28: Cross-Modal Desynchronization & Phantom Entities (AI Stitching)

Failure Mechanism:
Inventing entity identifiers, diagram nodes, sequence participants, benchmark metrics, or pipeline stages in visual diagrams or summary tables that have zero corresponding textual specification in the document body, or conversely omitting documented entities from accompanying diagrams.

Mechanical Identification:
Diagram entity identifiers or table rows (such as `UC-SAV-01.1`, `TelemetryWorker`) that do not exist as titled specification sections or explicit definitions in the document body. Count of unsynchronized diagram nodes must equal 0.

❌ Before:
> Mermaid diagram introduces `UC-SAV-01.1: Mở sổ tiết kiệm` and `UC-SAV-01.2: Tất toán sổ`, but Section 6 only defines `UC-SAV-01: Quản lý sổ` with zero text for `.1` or `.2`.
> Benchmark architecture diagram shows `TelemetryCollectorWorker`, but Section 3 methodology never mentions its configuration, CPU allocation, or role.

✅ After:
> Section 4.1 defines `UC-SAV-01: Mở sổ tiết kiệm mới` and Section 4.2 defines `UC-SAV-02: Quyết toán sổ tiết kiệm`; the Mermaid diagram references `UC-SAV-01` and `UC-SAV-02` with 100% parity.
> Every node in the benchmark data pipeline diagram maps to an explicit configuration paragraph and resource allocation entry in Section 2.

#### Tell 29: Mechanical 1:1 Structural Symmetry & Forced Artificial Balance

Failure Mechanism:
Mechanically enforcing a 1-to-1 pairing between static architectural subsystems and dynamic behavioral workflows (e.g., exactly 10 subsystems paired mechanically with 10 identical use cases), or fabricating artificial balance in trade-off tables by inventing trivial pros/cons to make options appear deceptively equal.

Mechanical Identification:
Workflow catalog mirrors the static subsystem component list 1:1, with each workflow named identically after its respective subsystem; trade-off matrices where every option artificially receives exactly 2 pros and 2 cons regardless of technical merit.

❌ Before:
> 10 Subsystems (`FR-WAL`, `FR-TXN`, `FR-DEBT`...) mapped directly to 10 Use Cases (`UC01: Quản lý ví`, `UC02: Quản lý giao dịch`, `UC03: Quản lý nợ`...).
> Option A (mature battle-tested database) and Option B (untested prototype) given identical 2-pro/2-con balancing bullets.

✅ After:
> Static subsystems define container and deployment boundaries; dynamic workflows define user journeys and cross-cutting transactions (e.g., `UC-INV-01: Đầu tư chứng chỉ quỹ từ ví tiền` coordinates the Wallet, Category, and Fund subsystems).
> Trade-off matrices reflect genuine engineering asymmetry, highlighting decisive disqualification criteria without artificial balance.

#### Tell 30: Procedural Misdirection & Menu Navigation in Exception/Alternative Paths

Failure Mechanism:
Structuring alternative flows, failure modes, or exception handling as an interactive navigation menu where the caller or user abandons the goal to perform unrelated operational tasks (e.g., Main flow: Create resource; Alt flow 2a: user views list; Alt flow 2b: user edits settings).

Mechanical Identification:
Alternative flows or recovery steps that jump to unrelated operational routines rather than genuine alternative execution paths, validation failures, retries, or graceful degradation.

❌ Before:
> Main flow: User submits payment. Alternative flow 2a: User clicks view transaction history; Alternative flow 2b: User clicks edit profile.
> Runbook failover step 3: "If node fails, operator opens dashboard to view general server inventory."

✅ After:
> Main flow: User submits payment with default credit card. Alternative flow 2a: User selects alternative bank account. Exception flow 3a: Card issuer declines charge; system records failure and prompts for retry.
> Runbook failover step 3: "If standby node fails to promote within 15 seconds, trigger manual promotion script `/opt/scripts/promote-replica.sh`."

#### Tell 31: Redundant Context Looping & Preamble Bloat

Failure Mechanism:
Re-explaining the high-level system context, project mission, or business background in opening sentences of sub-sections, or placing throat-clearing preambles before tables and diagrams instead of asserting immediate technical facts. Sub-sections must inherit parent context implicitly without re-stating it.

Mechanical Identification:
Opening sentences in sub-sections (level 2 or 3 headings) matching `/(in the context of .* (mentioned|stated|discussed)|as outlined in (the|our) (overview|introduction)|to achieve the overall goal of)/i` or Vietnamese equivalents `/(trong bối cảnh .* đã (nêu|trình bày)|nhằm phục vụ mục tiêu .* ở trên|như đã đề cập trong phần tổng quan)/i`. Count must equal 0.

❌ Before:
> ### 3.2 Ingress Gateway Rate Limiting
> In the context of the distributed e-commerce platform requiring high availability as described in Section 1, the ingress gateway implements rate limiting to ensure that incoming traffic spikes do not overwhelm downstream services.
> 
> In order to achieve the operational objectives outlined above, the following table summarizes the rate limiting parameters:
> | Parameter | Value |
> |---|---|

✅ After:
> ### 3.2 Ingress Gateway Rate Limiting
> The ingress gateway enforces per-tenant token bucket rate limiting with a burst capacity of 5,000 requests per second and a sustained refill rate of 2,000 tokens per second.
> 
> | Parameter | Value |
> |---|---|

#### Tell 32: Person Infiltration & Subjective Phrasing

Failure Mechanism:
Infiltrating technical documentation with first-person ("we", "our", "chúng tôi") or second-person ("you", "bạn") pronouns, and adopting promotional, hyperbolic, or emotionally charged adjectives ("superior", "effortless", "tuyệt vời", "ưu việt") instead of dispassionate, third-person engineering prose.

Mechanical Identification:
Occurrences of first/second person pronouns matching `/\b(we|us|our|you|chúng tôi|chúng ta|tôi|bạn|quý vị)\b/i` outside verbatim quotes and code blocks; occurrences of subjective emotional adjectives. Count must equal 0.

❌ Before:
> We have designed an outstanding authentication pipeline that allows you to easily verify client tokens with minimal hassle and superior responsiveness.

✅ After:
> The authentication pipeline verifies client JWT signatures against an Ed25519 public key cluster with P99 verification latency under 1.2 milliseconds.

#### Tell 33: Lazy Cross-Document Deflection & Unsolicited External Referencing

Failure Mechanism:
Evading concrete technical specifications in the document body by deflecting responsibility to unverified external or separate documents ("refer to the Architecture Document for details", "chi tiết xem tại tài liệu thiết kế"), or inserting unrequested external document references. A technical document must be completely self-contained within its declared scope and abstraction level. Cross-document citations are permitted ONLY when explicitly requested by the user, and must be strictly isolated within a dedicated `## References` / `## Tài liệu tham khảo` section.

Mechanical Identification:
References to external documents in the body text matching `/(refer to .* document|as detailed in .* specification|chi tiết (vui lòng )?(xem|tham khảo) tại tài liệu|theo tài liệu .*)/i` outside the dedicated references section. Count must equal 0.

❌ Before:
> For database schema definitions, partition keys, and replication topology, refer to the System Database Design Document v3.2.

✅ After:
> The ledger service persists transactions in PostgreSQL partitioned by `tenant_id` hash across 16 shards with asynchronous streaming replication to two standby nodes.

#### Tell 34: Tunnel-Vision Patching & Regressive Degradation

Failure Mechanism:
When requested to edit, fix, or update a document, the model focuses exclusively on a narrow localized phrase or sub-section without evaluating the end-to-end dependency chain. This localized tunnel vision introduces contradictions with upstream architectural designs, degrades existing quantitative precision, discards previously optimized data structures or algorithms in favor of generic prose, or breaks cross-section traceability matrices.

Mechanical Identification:
1. Contradictions between newly patched parameters and existing system constraints.
2. Deletion or dumbing-down of existing numerical thresholds, tolerances, or formal invariants during an edit.
3. Breaking bidirectional traceability links (orphaned requirements, untested components, or disconnected data flow nodes).
Count of regressive contradictions, degraded specifications, and broken traceability links must equal 0.

❌ Before:
> User prompt: "Add support for OAuth2 authentication."
> Patched section:
> ### 3.1 Authentication
> The service supports OAuth2 authentication. Requests must pass a valid Bearer token in the Authorization header.
> *(Failure: The model completely discarded the existing P99 < 1.2ms Ed25519 cryptographic validation specifications, tenant isolation key rotators, and Redis cache bypass protections that were previously specified, degrading the technical specification into a generic high-level statement.)*

✅ After:
> ### 3.1 Authentication & Token Verification (AUTH-SEC-01)
> The service verifies inbound requests using OAuth2 Bearer tokens signed via Ed25519 or RS256. Verification latency is bounded at P99 < 1.5ms across a local LRU public-key cache (capacity: 10,000 keys, TTL: 300s). Inbound requests lacking valid claims or bearing expired signatures are rejected at the Envoy ingress filter before reaching downstream business microservices.

---

## 3. Three-Tier Vocabulary Matrix

### Tier 1: Always Replace (Zero-Tolerance Banned Words)

| AI Banned Word | Preferred Engineering Alternatives | Rationale |
|---|---|---|
| delve | investigate, inspect, trace, profile, evaluate | Figurative cliché; lacks physical engineering meaning. |
| tapestry | architecture, topology, graph, hierarchy | Decorative metaphor; software is structured logic, not fabric. |
| landscape | ecosystem, environment, platform, market | Vague spatial metaphor; obscures concrete service boundaries. |
| pivotal | critical, blocking, primary, determinative | Overused rhetorical amplifier; replace with explicit severity. |
| foster | provide, enforce, support, generate | Anthropomorphic; software systems execute logic, they do not nurture. |
| robust | fault-tolerant, resilient, typed, boundary-checked | Ambiguous praise; replace with exact error-handling mechanics. |
| leverage (verb) | use, call, consume, query, apply | Corporate buzzword; use standard operational verbs. |
| seamless | integrated, zero-copy, synchronous, automated | Commercial claim; engineering interfaces have latency and error modes. |
| utilize | use, run, invoke, allocate | Pretentious syllable inflation; "use" is clearer and more direct. |
| game-changer | structural shift, architectural modification | Marketing colloquialism; unsuited for engineering documentation. |
| fantastic / tuyệt vời | verified, within tolerance, passing | Emotionally charged praise; replace with empirical test status. |
| superior / ưu việt | lower latency, reduced footprint | Promotional claim; state concrete measurable metrics. |
| effortlessly / dễ dàng | automated, single-command, declarative | Subjective usability assumption; document explicit operational steps. |
| flawless / hoàn hảo | tested, fault-tolerant, bounded | Engineering fallacy; all systems feature explicit failure modes. |

### Tier 2: Flag in Clusters (Permitted Individually, Banned in Groups)

Flag whenever two or more words from this tier appear within a single 200-word passage:
- comprehensive
- intricate
- multifaceted
- enhance
- facilitate
- navigate
- streamline
- holistic

Remediation:
Replace abstract verbs with concrete operations (e.g., replace "facilitate data flow" with "route messages through Kafka"). Replace adjectives with specific architectural metrics or constraints.

### Tier 3: Density Threshold Words

Transitional connectives that indicate robotic pacing when overused:
- notably
- overall
- furthermore
- moreover
- additionally
- in summary

Threshold:
Maximum 2 occurrences of Tier-3 words per 500 words of technical text. Use direct assertions and logical paragraph sequencing rather than repetitive transitional adverbs.

---

## 4. Punctuation and Typography Discipline

### Em-Dash Elimination Rules

The em-dash (`—`) and double hyphen (`--`) are prohibited as sentence punctuation in engineering documentation. Apply four replacement techniques:

1. Period and Sentence Split:
- Prohibited: The cache invalidates entries every five minutes—preventing stale data reads during batch updates.
- Compliant: The cache invalidates entries every five minutes. This prevents stale data reads during batch updates.

2. Comma Integration:
- Prohibited: The storage node—having detected disk failure—transfers replicas to standby nodes.
- Compliant: Having detected disk failure, the storage node transfers replicas to standby nodes.

3. Colon for Specification:
- Prohibited: The gateway enforces three rate limits—per IP, per tenant, and per endpoint.
- Compliant: The gateway enforces three rate limits: per IP, per tenant, and per endpoint.

4. Deliberate Parentheses:
- Prohibited: The protocol payload—typically under 512 bytes—travels over UDP.
- Compliant: The protocol payload (typically under 512 bytes) travels over UDP.

Sole exception: an em-dash inside an inline code span (single backticks) that preserves the verbatim official title of an external source (a standard, publication, or reference document whose real name contains an em-dash) is not counted against the threshold. Mechanical identification: count em-dashes or double hyphens outside inline code spans and fenced code blocks; that count must equal 0.
- Accepted: `` `Reference Standard XYZ — Second Edition` `` cited verbatim inside a references section.
- Still a violation: The gateway responds fast—reliably to every request. (the em-dash sits outside a code span.)

### Formatting Rules

1. Bold Text Discipline:
Reserve bold styling for table column headers, status markers (PASS/FAIL), and specific UI elements in how-to guides. Never format lists where every bullet begins with an automated bold label.

2. Heading Casing:
Use sentence case or clean title case consistently. Do not insert decorative emojis, exclamation marks, or question marks in technical document headings.

---

## 5. Five-Dimension Technical Scoring Metric

Evaluate technical documents across five measurable dimensions (1 to 10 points each). Documents must score at least 35 out of 50 points to achieve publication status:

| Dimension | 1-4 Points (Deficient) | 5-7 Points (Acceptable) | 8-10 Points (Exemplary) |
|---|---|---|---|
| Directness | Heavy staging, "Not X but Y" phrases, and introductory preambles. | Direct statements with occasional hedging qualifiers. | Zero preambles; immediate technical assertions with explicit boundaries. |
| Rhythm | Monotonous sentence openers, forced triads, and repetitive em-dashes. | Mixed sentence lengths; zero em-dashes; few repetitive transitions. | Natural sentence length variation, active voice, and varied syntax. |
| Trust | Qualitative adjectives ("fast", "secure"); lacks empirical benchmarks. | Some quantitative metrics; basic error conditions covered. | 100% of NFRs have numerical thresholds; explicit failure modes stated. |
| Authenticity | High frequency of Tier-1 AI words (`delve`, `tapestry`, `robust`). | Zero Tier-1 words; low density of Tier-2 and Tier-3 words. | Domain-specific engineering vocabulary; zero conversational residue. |
| Density | High volume of filler sentences; fractal introductory summaries. | Compact prose; tables used for structured entity listings. | High information density; every sentence conveys an architectural fact or constraint. |
