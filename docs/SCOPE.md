# AI Agent — Scope Document (SAP + SaaS POC)

**Project name:** AI-Agent-POC

**Stack:**
*   **Frontend** — React
*   **Backend** — .NET Core
*   **Database** — SQL (Postgres / SQL Server / MySQL)

---

## 1 — High-Level Goals

*   Provide a simple chat UI where users choose an AI tool from a dropdown and send prompts.
*   Backend routes the request to the correct AI provider (OpenAI/GPT, Gemini, Perplexity, Grok, DeepSeek, HuggingFace, Ollama, etc.).
*   Store chat history, contexts, users, and tool configs in SQL.
*   Admin can add/update provider configs (endpoints, headers, templates, priority, enabled/disabled).
*   Securely store API keys in backend configuration or external secrets manager (never in client).
*   Fallback handling: if the provider fails (429/402/5xx), try the next provider by priority.
*   Multi-user SaaS support with authentication (SQL-based).

---

## 2 — Actors & Users

*   **End User:** Logs in, chats with AI, sees chat history.
*   **Admin:** Manages tool configs and monitors usage.
*   **System:** .NET Core backend routing logic.

---

## 3 — Data Model (SQL Tables)

**users**
```sql
id UUID (PK)
email VARCHAR(255) UNIQUE
display_name VARCHAR(255)
password_hash TEXT
role VARCHAR(50) -- user/admin
created_at TIMESTAMP DEFAULT now()
```

**ai_tools**
```sql
id VARCHAR(50) (PK) -- e.g., "openai"
name VARCHAR(100)
base_url TEXT
method VARCHAR(10)
auth_type VARCHAR(50)
api_key_secret_name VARCHAR(100)
headers_template JSONB
body_template JSONB
priority INT
enabled BOOLEAN DEFAULT true
created_at TIMESTAMP DEFAULT now()
updated_at TIMESTAMP
```

**user_contexts**
```sql
id UUID (PK)
user_id UUID (FK -> users.id)
name VARCHAR(100)
context_text TEXT
created_at TIMESTAMP DEFAULT now()
updated_at TIMESTAMP
```

**chats**
```sql
id UUID (PK)
user_id UUID (FK -> users.id)
tool_id VARCHAR(50) (FK -> ai_tools.id)
input TEXT
input_rendered TEXT
provider_raw JSONB
provider_parsed TEXT
status VARCHAR(50)
created_at TIMESTAMP DEFAULT now()
meta JSONB
```

**api_keys**
```sql
id VARCHAR(100) (PK) -- e.g., OPENAI_API_KEY
secret_value TEXT ENCRYPTED -- stored encrypted at rest
created_at TIMESTAMP DEFAULT now()
last_rotated_at TIMESTAMP
```

---

## 4 — API Contracts

### 4.1 Authentication

*   SQL-based auth (JWT issued after login).
*   Backend validates JWT on each request.

### 4.2 POST /api/ai

**Request:**
```json
{
  "userId": "uuid",
  "toolId": "openai",
  "contextId": "ctx-uuid",
  "input": "Summarize these notes..."
}
```

**Response:**
```json
{
  "ok": true,
  "chatId": "chat-uuid",
  "providerParsed": "Short summary...",
  "providerRaw": { },
  "status": 200
}
```

### 4.3 GET /api/chats?userId=...

*   Returns the user's chat history.

### 4.4 POST /api/tools (Admin only)

*   Add/update AI tool config.

---

## 5 — Backend Responsibilities (.NET Core)

*   Authenticate requests using JWT.
*   Fetch `ai_tools` config from SQL.
*   Fetch API key securely from `api_keys` table.
*   Replace `{input}` / `{context}` placeholders in `body_template`.
*   Send request to provider → parse response (standardized).
*   Store chat records in `chats`.
*   Support fallback on errors using priority.

---

## 6 — Frontend (React)

*   User login → obtain JWT.
*   Dropdown of AI tools (GET /api/tools).
*   Textarea for input + optional context selector.
*   Submit prompt → POST to backend.
*   Show parsed AI response in chat UI.
*   Show past history (GET /api/chats).
*   Error handling (e.g., fallback, provider down).

---

## 7 — Security & Secrets

*   API keys stored in SQL (`api_keys.secret_value`) but encrypted at rest.
*   Backend decrypts key at runtime.
*   Never expose keys to the front end.
*   Use HTTPS + JWT.

---

## 8 — Reliability & Fallback

*   Circuit breaker per provider.
*   Retry with the next available tool (based on `priority`).

---

## 9 — Deliverables

*   React SPA: login, chat UI, tool dropdown, contexts, chat history.
*   .NET Core backend: REST APIs (`/api/ai`, `/api/tools`, `/api/chats`).
*   SQL DB schema: `users`, `ai_tools`, `user_contexts`, `chats`, `api_keys`.
*   Secure secret storage plan.
