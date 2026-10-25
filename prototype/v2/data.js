window.PORTFOLIO = {
  name: 'Anmol Tomer',
  first: 'Anmol',
  last: 'Tomer',
  role: 'Full-stack engineer',
  headline: '0→1 builder for messy, high-ownership problems.',
  intro: 'I like the early, ambiguous part of building. Full-stack by default, backend at heart. Currently shipping agentic AI workflows, with a strong pull towards infrastructure and product.',
  portrait: { src: '../../../images/photo_2025-06-28_23-41-00.jpg', w: 853, h: 1280, alt: 'Illustrated portrait of Anmol hiking in green hills with a backpack' },
  email: 'anmol3540@gmail.com',
  links: {
    github: 'https://github.com/AnmolTomer',
    linkedin: 'https://www.linkedin.com/in/anmol-tomer/',
    x: 'https://x.com/anmol_tomer_cc',
    medium: 'https://medium.com/@anmol_tomer',
  },
  stats: [
    { value: 10, suffix: '', label: 'Articles on Medium' },
    { value: 18, suffix: '', label: 'Tools in daily use' },
    { value: 1, suffix: '', label: 'Patent filed' },
    { value: 2021, suffix: '', label: 'Shipping since', plain: true },
  ],
  stack: [
    { group: 'Backend', note: 'Languages, frameworks and APIs', tools: [
      { name: 'Java', logo: 'java.svg' }, { name: 'Spring Boot', logo: 'spring.svg' },
      { name: 'Python', logo: 'python-color.svg' }, { name: 'FastAPI', logo: 'fastapi-color.svg' },
      { name: 'TypeScript', logo: 'typescript-color.svg' } ] },
    { group: 'Systems', note: 'Cloud, queues and data stores', tools: [
      { name: 'AWS', logo: 'aws.svg', mono: true }, { name: 'Kafka', logo: 'apachekafka.svg', mono: true },
      { name: 'Redis', logo: 'redis-color.svg' }, { name: 'PostgreSQL', monogram: 'PG' } ] },
    { group: 'AI workflows', note: 'Model APIs, typed agents and traces', tools: [
      { name: 'Bedrock', logo: 'bedrock.jpg' }, { name: 'OpenAI', logo: 'openai.svg', mono: true },
      { name: 'Claude', logo: 'anthropic.svg', mono: true }, { name: 'Langfuse', logo: 'langfuse.svg', mono: true },
      { name: 'PydanticAI', monogram: 'Py' } ] },
    { group: 'Automation & Delivery', note: 'Workflows, containers and CI/CD', tools: [
      { name: 'n8n', logo: 'n8n.svg' }, { name: 'Lambda', logo: 'aws-lambda.svg' },
      { name: 'Step Functions', logo: 'aws-step-functions.svg' },
      { name: 'Docker', logo: 'docker-color.svg' }, { name: 'CI/CD', logo: 'githubactions.svg' } ] },
  ],
  logoBase: '../../../assets/logos/',
  principles: [
    { title: 'Start close to the problem.', body: 'I work with sales, end customers and partner teams to understand requirements, turn them into technical solutions, and stay close through delivery.' },
    { title: 'Move across the stack.', body: 'Backend is home, but I enjoy the product and infrastructure conversations that make a build more complete.' },
    { title: 'Keep learning where it matters.', body: 'Right now, that means treating agentic AI less like a demo and more like a real workflow to design carefully.' },
  ],
  now: {
    title: 'Currently shipping agentic AI workflows.',
    body: 'Models make decisions; the harness sets deterministic rules and checkpoints. I’m building around typed tools, evals, bounded retries, recovery and tracing, so failures can be understood and work can resume safely.',
    note: 'I’m drawn to the stretch between a good prototype and a product people can actually rely on.',
  },
  agentRun: [
    { step: 'Plan', detail: 'Read the request, split it into steps, choose the tools each step needs.' },
    { step: 'Call a tool', detail: 'Query the orders service through a typed FastAPI endpoint.' },
    { step: 'Tool times out', detail: 'The call fails after 8 seconds. Expected, and the plan allows for it.', fail: true },
    { step: 'Recover', detail: 'Retry once with backoff, then fall back to the cached read from Redis.' },
    { step: 'Trace it', detail: 'Every step, input and cost goes to Langfuse so a person can see why it answered this way.' },
    { step: 'Answer', detail: 'Reply with the result, and say that the data came from the cache.' },
  ],
  timeline: [
    { year: 2018, period: '2018–2022', title: 'VIT, Chennai', body: 'B.Tech in Electronics and Computer Science Engineering; CGPA 8.6/10.' },
    { year: 2019, period: '2019–2020', title: 'Data science & applied AI', body: 'Data science at Nokia Networks; rover object detection and V.A.N.I. voice analytics, with a patent filed.', highlights: [
      'Data science internship at Nokia Networks in Chennai.',
      'Custom object detection for the Indian Rover Challenge and V.A.N.I. voice analytics for early dyslexia detection; patent filed.',
    ] },
    { year: 2022, period: 'Jun 2022–Jun 2024', title: 'Product & partner engineering', body: 'At CRED, worked with partner product and business teams on payment integrations for 400+ brands. Built self-serve onboarding APIs and automated payment and refund operations.' },
    { year: 2024, period: 'Jul 2024–Mar 2026', title: 'Backend engineering, payments', body: 'At CRED, built Java/Spring Boot payment services, UPI bank integrations and idempotent Kafka/SQS processing. Automated merchant onboarding with Step Functions and Lambda.' },
    { year: 2026, period: 'Mar 2026–present', title: 'Founding Engineer', body: 'Owning backend architecture, databases and deployment while building Python/FastAPI AI workflows with checkpoints, bounded retries and human review. Shipping evals and retrieval changes with clear rollback paths.' },
  ],
  personal: [
    { title: 'Football & F1', body: 'Real Madrid. Max Verstappen.' },
    { title: 'Off the keyboard', body: 'Out for a run or a game of cricket.' },
    { title: 'Homelab tinkering', body: 'AdGuard, Immich & open-source experiments.' },
  ],
  quote: 'Perhaps wisdom…is realizing how small I am, and unwise, and how far I have yet to go.',
  articles: [
    { title: 'Authentication Concepts Explained', date: '2026-09-25', tags: ['OAuth2', 'Security'], blurb: 'Basic, Digest, API keys, sessions, JWT and OAuth2: what each one actually answers about who is making a request.', url: 'https://medium.com/@anmol_tomer/authentication-concepts-explained-b6d5d208cfee', cover: 'https://cdn-images-1.medium.com/max/1024/1*cY2aWbMMzhGqkeVLIpcpbg.png' },
    { title: 'The LiteLLM Supply Chain Attack: What Actually Happened', date: '2026-03-25', tags: ['LLM', 'Python', 'Security'], blurb: 'Two malicious LiteLLM releases hit PyPI and stole credentials from laptops, CI runners and clusters within hours. How it worked.', url: 'https://medium.com/@anmol_tomer/the-litellm-supply-chain-attack-what-actually-happened-2d9d634ed82b', cover: 'https://cdn-images-1.medium.com/max/1024/1*LTf-P3CsPqG4bEBQRjpAlA.png' },
    { title: 'PACELC Theorem: An Extension to CAP', date: '2026-03-10', tags: ['Distributed systems'], blurb: 'Why CAP isn’t enough: the latency versus consistency trade-off that applies even when the network is healthy.', url: 'https://medium.com/@anmol_tomer/pacelc-theorem-an-extension-to-cap-theorem-in-distributed-systems-ed2e02ce2377', cover: 'https://cdn-images-1.medium.com/max/1024/0*UsiXyAdwzMI-4ht1.png' },
    { title: 'GraalVM vs Traditional JVM for Spring Boot', date: '2026-02-17', tags: ['Java', 'Spring Boot'], blurb: 'Startup time, memory footprint and throughput of native images against the JVM, and when the switch is worth it.', url: 'https://medium.com/@anmol_tomer/graalvm-vs-traditional-jvm-for-spring-boot-a-performance-deep-dive-20705c530fe7', cover: 'https://cdn-images-1.medium.com/max/1000/0*3O85aUUICbAJRSPz.jpg' },
    { title: 'Understanding CAP Theorem in Modern Distributed Systems', date: '2026-02-10', tags: ['Distributed systems', 'Kafka'], blurb: 'A three-part series from the fundamentals to how Kafka-backed microservices get close to relaxing CAP.', url: 'https://medium.com/@anmol_tomer/understanding-cap-theorem-in-modern-distributed-systems-a-3-part-technical-series-1-3-c2ea46b776db', cover: 'https://cdn-images-1.medium.com/max/1024/0*jlkuawP8pEUPISix.png' },
    { title: 'Guide to Alembic Setup for FastAPI Projects', date: '2026-02-09', tags: ['FastAPI', 'Python'], blurb: 'From a bare /health endpoint to versioned database migrations, and why Alembic is worth it.', url: 'https://medium.com/@anmol_tomer/guide-to-alembic-setup-for-fastapi-projects-b107fe354751', cover: 'https://cdn-images-1.medium.com/max/1024/0*Sb6C66O1c6wryk8B.png' },
    { title: 'Mastering SDKMAN for Spring Boot Developers', date: '2026-02-10', tags: ['Java', 'Tooling'], blurb: 'Managing multiple JDKs, Maven and Gradle versions without the headache.', url: 'https://medium.com/@anmol_tomer/mastering-sdkman-the-essential-tool-for-spring-boot-developers-d2a5e2143f82', cover: 'https://cdn-images-1.medium.com/max/960/0*ZjhXth-ILTG1UvgI.png' },
    { title: 'Git 101', date: '2026-02-17', tags: ['Git'], blurb: 'The essential commands and workflow for managing a repository with confidence.', url: 'https://medium.com/@anmol_tomer/git-101-72d8509ba2b1', cover: 'https://cdn-images-1.medium.com/max/1024/0*DZ9SlJt6HTmQ4bE2.png' },
  ],
};
