# 🧠 CompliAI

**Your AI-Powered Solution to Comply and Pass Audits with Ease**

CompliAI is an intelligent, agentic AI assistant designed to empower security and compliance teams to seamlessly navigate cybersecurity frameworks and achieve audit readiness. By leveraging advanced LLMs and autonomous agents, CompliAI automates and streamlines tasks for ISO 27001, SOC 2, NIST, and PCI-DSS, ensuring you comply with regulations and pass audits efficiently. From control mapping to policy generation and audit preparation, CompliAI is your partner in compliance success.

## 🚀 Features

- **🔍 Clause-Level Guidance**: Get precise, AI-driven Q&A for ISO 27001, SOC 2, NIST, and PCI-DSS requirements
- **📄 Policy Analysis & Mapping**: Upload policies and map them to compliance frameworks instantly
- **✍️ AI-Generated Policies**: Automatically create tailored policies (e.g., Access Control, Data Retention) that align with regulatory standards
- **🧠 Agentic Audit Planner**: Build step-by-step audit readiness plans with prioritized tasks to ensure you pass with confidence
- **📊 Exportable Compliance Reports**: Generate detailed reports and roadmaps for auditors and stakeholders

## 🗂️ Monorepo Structure

```
compli-ai/
├── apps/
│   ├── web/              # Next.js frontend (TypeScript + Tailwind)
│   └── api/              # FastAPI backend (Python)
│
├── packages/
│   ├── ui/               # Shared UI components
│   ├── utils/            # Shared utilities (TS)
│   ├── types/            # Shared TypeScript interfaces
│   ├── agents/           # LangChain / Agent logic for compliance automation
│   └── prompts/          # Prompt templates for LLM-driven compliance tasks
│
├── infrastructure/       # Docker, Firebase, Terraform for scalable deployment
├── .env.example          # Example environment variables
├── turbo.json            # Turborepo configuration for monorepo
├── package.json          # Monorepo setup with pnpm workspaces
└── README.md             # You're here
```

## 🛠️ Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | Next.js + TypeScript + Tailwind |
| Backend | FastAPI (Python) |
| LLM | OpenAI GPT-4 / Claude (via LangChain or LangGraph) |
| Vector DB | Pinecone / Weaviate |
| Auth | Firebase Auth / Clerk.dev |
| File Storage | AWS S3 / Firebase Storage |
| Deployment | Vercel (web), Railway / Render (API) |
| Monorepo | Turborepo + pnpm |

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/compli-ai.git
cd compli-ai
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run the Frontend

```bash
cd apps/web
pnpm dev
```

### 4. Run the Backend (FastAPI)

```bash
cd apps/api
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

## 🧪 Development Notes

- Use `pnpm` for workspace-aware dependency management
- Configure environment variables in `.env.local` files for secure setup
- Access shared TypeScript interfaces in `packages/types`
- Leverage compliance-focused prompts and agent logic in `packages/prompts` and `agents`

## 📅 MVP Roadmap to Comply and Pass

1. **Compliance UI**: Build intuitive interfaces for landing, chat, and policy uploads
2. **LLM Integration**: Connect OpenAI/Claude for real-time compliance guidance
3. **Policy Mapping & Generation**: Automate policy creation and framework alignment
4. **Audit Readiness Agent**: Develop an intelligent agent to prioritize tasks and ensure audit success
5. **Multi-Framework Support**: Expand coverage for SOC 2, NIST, and additional standards

## 📄 License

This project is licensed under MIT. See LICENSE for details.

## 🤝 Contributions

We're building CompliAI in public to help teams comply and pass audits. Pull requests are welcome!

## 📬 Contact

For inquiries, early access, or compliance support: [hello@clancodelabs.org]

**Clancode Labs Pvt Ltd**