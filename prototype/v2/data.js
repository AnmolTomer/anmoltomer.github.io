window.PORTFOLIO = {
  name: 'Anmol Tomer',
  first: 'Anmol',
  last: 'Tomer',
  role: 'Full-stack engineer',
  headline: '0→1 builder for messy, high-ownership problems.',
  intro: 'I like the early, ambiguous part of building. Full-stack by default, backend at heart. Currently deep-diving into agentic AI workflows, with a strong pull towards infrastructure and product.',
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
    { group: 'Build', note: 'Backend and full-stack foundations', tools: [
      { name: 'Java', logo: 'java.svg' }, { name: 'Spring Boot', logo: 'spring.svg' },
      { name: 'Python', logo: 'python-color.svg' }, { name: 'FastAPI', logo: 'fastapi-color.svg' } ] },
    { group: 'Ship', note: 'Cloud and systems that need to hold up', tools: [
      { name: 'AWS', logo: 'aws.svg', mono: true }, { name: 'Kafka', logo: 'apachekafka.svg', mono: true },
      { name: 'Redis', logo: 'redis-color.svg' }, { name: 'Docker', logo: 'docker-color.svg' } ] },
    { group: 'Explore', note: 'Agentic workflows, evals and AI product experiments', tools: [
      { name: 'Bedrock', logo: 'bedrock.jpg' }, { name: 'OpenAI', logo: 'openai.svg', mono: true },
      { name: 'Claude', logo: 'anthropic.svg', mono: true }, { name: 'Langfuse', logo: 'langfuse.svg', mono: true } ] },
    { group: 'Connect', note: 'Product surfaces and the glue that makes them useful', tools: [
      { name: 'TypeScript', logo: 'typescript-color.svg' }, { name: 'React', logo: 'react-color.svg' },
      { name: 'n8n', logo: 'n8n.svg', mono: true } ] },
  ],
  logoBase: '../../../assets/logos/',
  principles: [
    { title: 'Start close to the problem.', body: 'I’m most useful when the shape is still unclear and someone needs to make the first good decisions.' },
    { title: 'Move across the stack.', body: 'Backend is home, but I enjoy the product and infrastructure conversations that make a build more complete.' },
    { title: 'Keep learning where it matters.', body: 'Right now, that means treating agentic AI less like a demo and more like a real workflow to design carefully.' },
  ],
  now: {
    title: 'Currently deep-diving into agentic AI workflows.',
    body: 'How agents make decisions, use tools, recover from failures, expose useful product behaviour and stay observable once they leave the prototype stage.',
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
    { year: 2018, title: 'B.Tech, Electronics & Computer Science', body: 'Started engineering school; CGPA 8.6/10.' },
    { year: 2019, title: 'Data science internship, Nokia Networks', body: 'First taste of production data work in Chennai.' },
    { year: 2020, title: 'V.A.N.I. and the rover', body: 'Voice analytics to spot dyslexia early (patent filed) and custom object detection for the Indian Rover Challenge.' },
    { year: 2022, title: 'Backend engineer, payments platform', body: 'Services, partner integrations and onboarding automation at scale.' },
    { year: 2026, title: 'Agentic AI workflows', body: 'Designing agents that use tools, recover from failure and stay observable.' },
  ],
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
