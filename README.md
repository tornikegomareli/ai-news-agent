# AI News Aggregator Agent

A web-based AI News Aggregator that allows users to configure personalized summaries of AI-related news sourced from the web. The system uses user-selected LLMs (with web search capabilities) to find, summarize, and deliver content via Email or Telegram.

## Features

- **Personalized Delivery**: Configure summaries based on your interests (Technical AI, Business AI, Marketing AI)
- **Multiple Sources**: Collect news from Hacker News, Reddit, Twitter, GitHub, and custom sources
- **Custom Prompts**: Further refine focus areas with custom prompts
- **Flexible Delivery**: Receive summaries via Email or Telegram at your preferred frequency
- **LLM Choice**: Use your preferred LLM provider (OpenAI, Claude) with your own API key

## Project Structure

The project is organized as a monorepo with the following packages:

```
ai-news-agent/
├── packages/
│   ├── api/           # Backend API (Node.js + TypeScript)
│   │   ├── src/       # API source code
│   │   └── Dockerfile.dev  # Development container config
│   │
│   ├── web/           # Frontend (SvelteKit)
│   │   ├── src/       # Web app source code
│   │   └── Dockerfile.dev  # Development container config
│   │
│   ├── shared/        # Shared types and utilities
│   │   └── src/       # Shared code used by both API and web
│   │
│   └── database/      # Database migrations and schemas
│       └── migrations/# SQL migration files
│
├── docker-compose.yml       # Production container orchestration
├── docker-compose.dev.yml   # Development container orchestration
├── Dockerfile               # Production multi-stage build
└── package.json             # Workspace configuration
```

## Tech Stack

- **Frontend**: SvelteKit for a responsive, fast user interface
- **Backend**: Node.js with TypeScript for type safety
- **Database**: PostgreSQL for storing user preferences and summaries
- **Caching & Queue**: Redis for background processing
- **Security**: AES encryption for API keys
- **Deployment**: Docker containerization for easy deployment

## Getting Started

### Prerequisites

- Node.js (version 18+)
- Docker and Docker Compose
- PostgreSQL (if running without Docker)
- Redis (if running without Docker)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-news-agent.git
   cd ai-news-agent
   ```

2. Create environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file to add your configuration settings

3. Development Mode (with Docker):
   ```
   docker-compose -f docker-compose.dev.yml up
   ```

4. Development Mode (without Docker):
   
   Install dependencies:
   ```
   npm install
   ```

   Build shared package:
   ```
   npm run build --workspace=@ai-news-agent/shared
   ```

   Run API and web in separate terminals:
   ```
   npm run dev:api
   npm run dev:web
   ```

5. Production Mode:
   ```
   docker-compose up -d
   ```

6. Open your browser and navigate to:
   - Web UI (Development): `http://localhost:4000`
   - Web UI (Production): `http://localhost:4000`
   - API: `http://localhost:3000`

## Development

### Project Commands

```bash
# Install all dependencies
npm install

# Start API in development mode
npm run dev:api

# Start Web in development mode
npm run dev:web

# Build all packages
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Package Commands

Each package has its own scripts that can be run directly:

```bash
# Build shared package
npm run build --workspace=@ai-news-agent/shared

# Start API in development mode
npm run dev --workspace=@ai-news-agent/api

# Start Web in development mode
npm run dev --workspace=@ai-news-agent/web
```

## Database

The database migrations will run automatically when using Docker. If you're running without Docker, you can execute the migrations manually:

```
cd packages/database
psql -U postgres -d ainewsagent -f migrations/001_initial_schema.sql
```

## Configuration

### LLM API Keys

You need to provide your own API keys for the LLM providers:

- OpenAI: Get API keys from [OpenAI Platform](https://platform.openai.com/api-keys)
- Anthropic Claude: Get API keys from [Anthropic Console](https://console.anthropic.com/keys)

### Email Delivery

The system uses SendGrid for email delivery. You can use any other provider by modifying the `emailService.ts` file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.