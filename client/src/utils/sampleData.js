export const INITIAL_USERS = [
  {
    _id: 'usr_admin_1',
    id: 'usr_admin_1',
    fullName: 'Eleanor Vance',
    username: 'admin_eleanor',
    email: 'admin@chronicle.com',
    bio: 'Chief Editor and Platform Administrator at Chronicle. Overseeing editorial direction, code ethics, and platform reliability.',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    role: 'admin',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    _id: 'usr_author_1',
    id: 'usr_author_1',
    fullName: 'Dr. Sarah Chen',
    username: 'sarah_chen',
    email: 'sarah.chen@chronicle.com',
    bio: 'Senior AI Research Engineer & Systems Architect. Writing on generative pipelines, cognitive agents, and distributed computing.',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    role: 'user',
    createdAt: '2026-01-15T09:30:00.000Z',
  },
  {
    _id: 'usr_author_2',
    id: 'usr_author_2',
    fullName: 'Marcus Rossi',
    username: 'marcus_rossi',
    email: 'marcus.rossi@chronicle.com',
    bio: 'Design technologist, world traveler, and minimalist living advocate. Exploring the intersection of human attention and digital craft.',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    role: 'user',
    createdAt: '2026-01-20T11:15:00.000Z',
  },
  {
    _id: 'usr_author_3',
    id: 'usr_author_3',
    fullName: 'Maya Patel',
    username: 'maya_patel',
    email: 'maya.patel@chronicle.com',
    bio: 'SaaS founder, angel investor, and film enthusiast. Unpacking unit economics and creative virtual production.',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'user',
    createdAt: '2026-02-01T14:45:00.000Z',
  },
];

export const INITIAL_POSTS = [
  {
    _id: 'post_1',
    id: 'post_1',
    title: 'Architecting Scalable Microservices with Node.js and Event Streams',
    description: 'A deep dive into distributed systems patterns, idempotent consumer design, and decoupling monolithic bottlenecks using modern asynchronous pipelines.',
    category: 'Technology',
    tags: ['Microservices', 'Node.js', 'System Design', 'Cloud'],
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    readingTime: 6,
    views: 342,
    status: 'published',
    isSample: true,
    author: INITIAL_USERS[1],
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
    content: `
# Architecting Scalable Microservices with Node.js

Building distributed systems requires shifting from synchronous request-response patterns toward resilient event-driven architectures. As applications grow in concurrency and operational scope, synchronous chains between services quickly become single points of failure.

## The Core Pitfalls of Synchronous Service Chains

In traditional REST-first microservices, Service A calls Service B, which synchronously awaits Service C. If Service C suffers a latency spike or temporary outage, cascading timeouts ripple through the entire pipeline:

\`\`\`
Client -> [API Gateway] -> [Orders Service] -> [Payment Service] -> [Inventory Service]
\`\`\`

If any downstream service throttles requests, memory buffers fill up, event loops stall, and cascading 504 Gateway Timeouts bring the entire application down.

## Embracing Event Streams and Pub/Sub

By introducing durable event streams (like Apache Kafka or AWS SQS/SNS), producers emit state notifications without awaiting consumers:

\`\`\`javascript
// Emitting a domain event from an order controller
async function placeOrder(orderPayload) {
  const order = await Order.create(orderPayload);
  
  await eventBus.publish('orders.v1.created', {
    orderId: order._id,
    userId: order.userId,
    amount: order.totalAmount,
    timestamp: new Date().toISOString()
  });
  
  return { status: 'acknowledged', orderId: order._id };
}
\`\`\`

> "A resilient system accepts failure as a continuous reality and guarantees graceful degradation rather than synchronous total collapse."

## Key Design Principles for Production

1. **Idempotent Consumers**: Every consumer must verify whether an event has already been processed using a transactional deduplication ledger.
2. **Dead Letter Queues (DLQ)**: Poison pills must be isolated without blocking subsequent events in the partition.
3. **Correlation Identifiers**: Propagate unique trace IDs across headers to preserve end-to-end observability across distributed logs.

By applying these patterns, services scale horizontally and maintain uninterrupted uptime even during peak traffic surges.
`,
  },
  {
    _id: 'post_2',
    id: 'post_2',
    title: 'The Art of Clean TypeScript: Mastering Generics, Discriminated Unions, and Type Narrowing',
    description: 'Elevate your code quality and compile-time safety by harnessing advanced TypeScript type mechanics without resorting to escape hatches.',
    category: 'Programming',
    tags: ['TypeScript', 'JavaScript', 'WebDev', 'BestPractices'],
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    readingTime: 5,
    views: 289,
    status: 'published',
    isSample: true,
    author: INITIAL_USERS[2],
    createdAt: '2026-03-03T14:30:00.000Z',
    updatedAt: '2026-03-03T14:30:00.000Z',
    content: `
# The Art of Clean TypeScript

TypeScript has transformed JavaScript engineering from speculative runtime debugging into compile-time certainty. Yet, developers often lean on \`any\` or overly complex type assertions, defeating the purpose of the type system.

## Mastering Discriminated Unions

One of the most potent patterns in modern TypeScript is the discriminated union. Instead of optional nullable fields, model domain states with explicit discriminant literals:

\`\`\`typescript
type NetworkState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; timestamp: number }
  | { status: 'error'; error: Error; retryCount: number };

function renderState(state: NetworkState<BlogPost>) {
  switch (state.status) {
    case 'idle':
      return 'Ready to fetch';
    case 'loading':
      return 'Loading articles...';
    case 'success':
      // TypeScript automatically narrows 'data' here with 100% safety
      return \`Rendered: \${state.data.title}\`;
    case 'error':
      return \`Failed: \${state.error.message}\`;
  }
}
\`\`\`

## Defensive Type Narrowing with User-Defined Type Guards

Custom type predicates allow runtime validation to safely inform the compiler:

\`\`\`typescript
interface AdminUser {
  id: string;
  role: 'admin';
  permissions: string[];
}

function isAdmin(user: unknown): user is AdminUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    'role' in user &&
    (user as AdminUser).role === 'admin'
  );
}
\`\`\`

> Clean types serve as living documentation that refactors with you, catching edge cases before code ever ships to production.
`,
  },
  {
    _id: 'post_3',
    id: 'post_3',
    title: 'Generative AI and the Next Frontier of Autonomous Agent Workflows',
    description: 'How multi-agent cooperation, structured tool calling, and cognitive reflection are shifting AI from passive chat interfaces to active co-workers.',
    category: 'Artificial Intelligence',
    tags: ['AI', 'LLM', 'MachineLearning', 'Agents'],
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    readingTime: 7,
    views: 450,
    status: 'published',
    isSample: true,
    author: INITIAL_USERS[1],
    createdAt: '2026-03-05T09:15:00.000Z',
    updatedAt: '2026-03-05T09:15:00.000Z',
    content: `
# Generative AI and Autonomous Agent Workflows

The narrative around Artificial Intelligence is rapidly shifting. While the first wave focused on prompt-and-response chatbots, the next wave belongs to autonomous, tool-augmented agent swarms.

## From Chatbots to Autonomous Co-Workers

Traditional LLM interactions are passive: a user asks a question, and the model generates text. Modern agentic systems introduce three foundational capabilities:

1. **Structured Tool Calling**: Models emit verified JSON arguments that interact directly with APIs, databases, and filesystem tooling.
2. **Memory & Reflection**: Agents critique their own draft outputs and compare them against constraints before returning results.
3. **Multi-Agent Orchestration**: Specialized sub-agents (e.g. Researcher, Reviewer, Coder) collaborate in parallel or sequential DAG pipelines.

\`\`\`
[User Goal]
     │
     ▼
[Orchestrator Agent]
  ├──> [Research Subagent: Web & DB Search]
  ├──> [Implementation Subagent: Code & Test]
  └──> [Verification Subagent: Security & Perf Audit]
\`\`\`

## Safety and Guardrails in Autonomous Loops

With agency comes responsibility. Autonomous execution requires deterministic boundary enforcement:
- Rate-limiting execution steps.
- Requiring human confirmation for irreversible operations.
- Sandboxing script execution environments.

As agent frameworks mature, software development will transition from manual line-by-line typing to goal specification and systemic steering.
`,
  },
  {
    _id: 'post_4',
    id: 'post_4',
    title: 'Modern Learning Paradigms: Active Recall, Spaced Repetition, and Cognitive Flow',
    description: 'Transforming passive studying into enduring mastery using evidence-backed cognitive science frameworks and self-directed sprint methodology.',
    category: 'Education',
    tags: ['Education', 'Learning', 'Productivity', 'Psychology'],
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    readingTime: 5,
    views: 215,
    status: 'published',
    isSample: true,
    author: INITIAL_USERS[3],
    createdAt: '2026-03-07T11:00:00.000Z',
    updatedAt: '2026-03-07T11:00:00.000Z',
    content: `
# Modern Learning Paradigms for Lifelong Mastery

In an age where technical specifications and industry practices evolve every few months, the most valuable meta-skill is the ability to acquire and synthesize complex concepts rapidly.

## The Illusion of Competence

Passive reading, highlighting, and watching tutorials often create a false sensation of understanding known as the *illusion of competence*. You feel you grasp the material because the reference answers are immediately visible in front of you.

True neural retention occurs when you force your brain to retrieve knowledge without hints:

### 1. Active Retrieval Practice
Instead of re-reading a textbook chapter, close your eyes and explain the concept aloud or write a one-page summary from scratch. The cognitive struggle during retrieval is precisely what strengthens synaptic connections.

### 2. Algorithmic Spaced Repetition
Spacing your review intervals disrupts the forgetting curve:
- **Day 1**: Initial consolidation (~90%)
- **Day 4**: Memory reinforcement (~80%)
- **Day 14**: Long-term encoding (~85%)
- **Day 60**: Permanent retention (~95%)

### 3. Project-Based Application
Apply every theoretical concept to a real deliverable within 48 hours. Building a functional application cements abstract rules into practical problem-solving intuition.
`,
  },
  {
    _id: 'post_5',
    id: 'post_5',
    title: 'The Intentional Minimalist: Designing a Life Free from Digital Noise',
    description: 'How curating your digital feeds, simplifying daily physical environments, and reclaiming sustained attention yields deep creative output.',
    category: 'Lifestyle',
    tags: ['Minimalism', 'Mindfulness', 'Wellness', 'Focus'],
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    readingTime: 4,
    views: 310,
    status: 'published',
    isSample: true,
    author: INITIAL_USERS[2],
    createdAt: '2026-03-09T08:45:00.000Z',
    updatedAt: '2026-03-09T08:45:00.000Z',
    content: `
# The Intentional Minimalist: Reclaiming Focus

We live in an economy designed to commodify human attention. Notifications, algorithmic outrage, and perpetual feeds fragment our waking hours into micro-moments of distraction.

## Decluttering the Cognitive Workspace

Minimalism is not about sterile white rooms or owning fewer than 50 items. It is the intentional elimination of the non-essential so that what is truly meaningful has room to breathe.

> "Simplicity is not about having less. It is about making room for what matters most."

### Practical Steps for Digital Hygiene

- **Turn off non-human notifications**: Only direct communications from real people should vibrate your phone. Badges, updates, and news alerts belong in scheduled check-ins.
- **Implement a 60-Minute Analog Morning**: Keep the first hour of your day free of screens. Meditate, write in a journal, brew coffee, or stretch before letting the world demand your attention.
- **Physical Desk Hygiene**: Keep your workspace clear of visual clutter. A clean desk creates an inviting physical canvas for prolonged flow state work.
`,
  },
  {
    _id: 'post_6',
    id: 'post_6',
    title: 'The Hidden Trails of Kyoto: An Off-the-Beaten-Path Odyssey',
    description: 'Wandering beyond crowded tourist landmarks into tranquil bamboo groves, centuries-old tea houses, and contemplative temple gardens.',
    category: 'Travel',
    tags: ['Travel', 'Japan', 'Adventure', 'Culture'],
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    readingTime: 6,
    views: 198,
    status: 'published',
    isSample: true,
    author: INITIAL_USERS[2],
    createdAt: '2026-03-11T12:00:00.000Z',
    updatedAt: '2026-03-11T12:00:00.000Z',
    content: `
# The Hidden Trails of Kyoto

Most travelers visiting Kyoto find themselves shoulder-to-shoulder with thousands of tourists at Fushimi Inari or the golden pavilion of Kinkaku-ji. But Kyoto’s genuine soul whispers in its quieter corners, nestled in the northern foothills of Ohara and the quiet canals of Kurama.

## The Sound of Wind in Kurama

Boarding the small Eizan Electric Railway train northward into the mountains leaves behind the bustling urban sprawl. Here, ancient cedars tower over mountain trails leading up to Kurama-dera. Along the trail, stone lanterns blanketed in emerald moss mark the pathway. At the summit, the air is crisp, scented with mountain pine and incense smoke drifting from wooden altars.

## The Philosophy of Wabi-Sabi

Every wooden bridge, raked gravel Zen garden, and weathered teahouse embodies *wabi-sabi*—the celebration of natural transience, asymmetry, and graceful aging.

### Travel Tips for the Conscious Explorer

1. **Rise before dawn**: The quietest temple gardens open at 7:00 AM; experiencing morning chants in total silence is unforgettable.
2. **Rent a bicycle**: Kyoto’s flat grid system and riverside bike paths along the Kamo River make cycling the most enjoyable way to discover backstreet bakeries.
3. **Respect local customs**: Photography is prohibited inside many sacred temple rooms; allow yourself to be present without a lens.
`,
  },
  {
    _id: 'post_7',
    id: 'post_7',
    title: 'Building Resilient SaaS Businesses: Unit Economics, Churn, and Organic Growth Loops',
    description: 'Strategic frameworks for bootstrapped founders and startup operators navigating modern customer acquisition costs and net dollar retention.',
    category: 'Business',
    tags: ['Startups', 'SaaS', 'Finance', 'Growth'],
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    readingTime: 6,
    views: 412,
    status: 'published',
    isSample: true,
    author: INITIAL_USERS[3],
    createdAt: '2026-03-13T15:20:00.000Z',
    updatedAt: '2026-03-13T15:20:00.000Z',
    content: `
# Building Resilient SaaS Businesses in 2026

The era of hyper-inflated venture capital, where startups burned endless capital to subsidize unprofitable customer acquisition, has yielded to a healthier obsession with sound unit economics and sustainable product-led expansion.

## The Golden Metrics of Modern SaaS

Founders must maintain disciplined visibility over their financial levers:

\`\`\`
LTV / CAC > 3.0
Payback Period < 12 Months
Net Revenue Retention (NRR) > 110%
\`\`\`

If your Net Revenue Retention exceeds 100%, your business grows organically each year even before signing a single net-new customer.

## Organic Growth Loops vs. Paid Advertising

Paid social ads and search keywords are rented channels that stop producing the moment budget dries up. Durable companies build self-reinforcing organic loops:

1. **Collaborative Sharing Loops**: An existing user invites team members to review or edit a document, exposing new users naturally.
2. **Programmatic Content Loops**: User-generated public content or template marketplaces attract organic search queries without advertising expenditure.
3. **In-Product Value Milestones**: Onboarding should deliver the "aha moment" within 3 minutes rather than requiring tedious manual setup.
`,
  },
  {
    _id: 'post_8',
    id: 'post_8',
    title: 'The Evolution of Modern Cinema: From Celluloid Splendor to Immersive Virtual Production',
    description: 'How LED volume stages, real-time Unreal Engine rendering, and dynamic acoustics are revolutionizing filmmaking without losing human heart.',
    category: 'Entertainment',
    tags: ['Cinema', 'Film', 'Entertainment', 'VisualEffects'],
    coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    readingTime: 5,
    views: 260,
    status: 'published',
    isSample: true,
    author: INITIAL_USERS[3],
    createdAt: '2026-03-15T18:00:00.000Z',
    updatedAt: '2026-03-15T18:00:00.000Z',
    content: `
# The Evolution of Modern Cinema

From the hand-cranked cameras of the Lumière brothers to the photorealistic virtual production stages of today, the cinematic medium has consistently bridged technology and timeless human storytelling.

## The Demise of the Green Screen: Enter the Volume

For decades, digital visual effects forced actors to perform inside lime-green soundstages, guessing where dragons or futuristic skylines might appear in post-production.

Today, productions utilize **StageCraft LED Volumes**—massive, wraparound displays running real-time 3D camera parallax powered by game engines:
- **Photorealistic In-Camera Lighting**: Real reflections bounce naturally off actors' skin and costumes.
- **Actor Immersion**: Performers can visually see the alien sunsets or stormy horizons they are interacting with.
- **Creative Agility**: Directors can adjust the sunset to golden hour and hold it there for continuous shooting.

> While tools advance, the core essence of cinematic art remains unchanged: evoking empathy and transporting an audience into another human life.
`,
  },
  {
    _id: 'post_9',
    id: 'post_9',
    title: 'Mastering CSS Grid and Subgrid: Crafting Complex Magazine Layouts with Ease',
    description: 'Say goodbye to fragile flexbox hacks. Learn how CSS Grid and subgrid unlock true editorial multi-column magazine layouts with zero overhead.',
    category: 'Programming',
    tags: ['CSS', 'WebDesign', 'Frontend', 'Responsive'],
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    readingTime: 5,
    views: 380,
    status: 'published',
    isSample: true,
    author: INITIAL_USERS[2],
    createdAt: '2026-03-17T10:10:00.000Z',
    updatedAt: '2026-03-17T10:10:00.000Z',
    content: `
# Mastering CSS Grid and Subgrid

For years, web designers were constrained by rigid columnar frameworks. Building true editorial magazine layouts—with asymmetric gutters, overlapping hero quotes, and aligned card baselines—was notoriously fragile.

## Why CSS Subgrid is a Game Changer

CSS Subgrid solves the classic card alignment problem where cards with unequal content lengths failed to align their footers or headers:

\`\`\`css
.magazine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.article-card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3; /* Header, Body, Footer aligned across all siblings! */
}
\`\`\`

## Fluid Typography with CSS clamp()

Combine Grid with mathematical clamp functions for effortless responsiveness:

\`\`\`css
h1.headline {
  font-size: clamp(2rem, 5vw + 1rem, 4.5rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
}
\`\`\`
`,
  },
  {
    _id: 'post_10',
    id: 'post_10',
    title: 'The Future of Renewable Energy: Solid-State Batteries, Grid Storage, and Distributed Solar',
    description: 'Examining the breakthrough engineering innovations transforming the global clean energy transition from aspiration to inevitable economic reality.',
    category: 'Technology',
    tags: ['CleanTech', 'Energy', 'Sustainability', 'Innovation'],
    coverImage: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1200&q=80',
    readingTime: 6,
    views: 315,
    status: 'published',
    isSample: true,
    author: INITIAL_USERS[0],
    createdAt: '2026-03-19T13:40:00.000Z',
    updatedAt: '2026-03-19T13:40:00.000Z',
    content: `
# The Future of Renewable Energy

The global energy transition is no longer driven solely by climate mandates; it is being propelled by raw economics. Renewable solar and wind electricity have become the cheapest source of bulk power generation in history.

## The Final Frontier: Grid-Scale Energy Storage

The longstanding critique of renewable power has been intermittency—the wind doesn't always blow, and the sun sets every evening. The solution lies in multi-tiered storage:
1. **Short-Duration Battery Storage**: Supplying 4 to 8 hours of peak evening demand.
2. **Medium-Duration Thermal & Gravity Storage**: Utilizing molten salts and compressed air.
3. **Long-Duration Green Hydrogen**: Seasonal storage for winter heating and heavy transport.

By interconnecting decentralized microgrids with intelligent predictive dispatch algorithms, humanity is building an abundant, decarbonized energy future.
`,
  },
];

export const INITIAL_COMMENTS = [
  {
    _id: 'cmt_1',
    id: 'cmt_1',
    post: 'post_1',
    author: INITIAL_USERS[2],
    content: 'This breakdown of idempotent consumer design is gold. We suffered cascading failures last month due to missing deduplication in our payment pipeline.',
    parentComment: null,
    createdAt: '2026-03-01T12:30:00.000Z',
    updatedAt: '2026-03-01T12:30:00.000Z',
    replies: [
      {
        _id: 'cmt_1_1',
        id: 'cmt_1_1',
        post: 'post_1',
        author: INITIAL_USERS[1],
        content: 'Glad this resonated! The correlation ID headers combined with a Redis bloom filter or transactional ledger usually resolve 99% of duplicate deliveries.',
        parentComment: 'cmt_1',
        createdAt: '2026-03-01T13:15:00.000Z',
        updatedAt: '2026-03-01T13:15:00.000Z',
      },
    ],
  },
  {
    _id: 'cmt_2',
    id: 'cmt_2',
    post: 'post_1',
    author: INITIAL_USERS[0],
    content: 'Featured this piece in the editor newsletter. Essential reading for our backend engineering team.',
    parentComment: null,
    createdAt: '2026-03-01T16:00:00.000Z',
    updatedAt: '2026-03-01T16:00:00.000Z',
    replies: [],
  },
  {
    _id: 'cmt_3',
    id: 'cmt_3',
    post: 'post_2',
    author: INITIAL_USERS[3],
    content: 'Discriminated unions completely eliminated runtime null pointer exceptions across our client-side state machine. Wonderful explanation.',
    parentComment: null,
    createdAt: '2026-03-03T16:40:00.000Z',
    updatedAt: '2026-03-03T16:40:00.000Z',
    replies: [
      {
        _id: 'cmt_3_1',
        id: 'cmt_3_1',
        post: 'post_2',
        author: INITIAL_USERS[2],
        content: 'Pairing discriminated unions with exhaustive switch statement checks using TypeScript `never` is also super powerful!',
        parentComment: 'cmt_3',
        createdAt: '2026-03-03T17:10:00.000Z',
        updatedAt: '2026-03-03T17:10:00.000Z',
      },
    ],
  },
  {
    _id: 'cmt_4',
    id: 'cmt_4',
    post: 'post_3',
    author: INITIAL_USERS[1],
    content: 'Multi-agent cognitive loops will reshape how we build software over the next 24 months. Boundaries and sandboxing are critical.',
    parentComment: null,
    createdAt: '2026-03-05T14:20:00.000Z',
    updatedAt: '2026-03-05T14:20:00.000Z',
    replies: [],
  },
];
