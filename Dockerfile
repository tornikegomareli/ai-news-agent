######################
# BUILDER STAGE
######################
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/api/package*.json ./packages/api/
COPY packages/web/package*.json ./packages/web/
COPY packages/database/package*.json ./packages/database/

# Create necessary directories
RUN mkdir -p packages/shared/src packages/shared/dist \
    packages/api/src packages/api/dist \
    packages/web/src packages/web/public packages/web/build \
    packages/database/migrations

# Install dependencies
RUN npm install

# Copy config files first
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/api/tsconfig.json ./packages/api/
COPY packages/web/tsconfig.json ./packages/web/
COPY packages/web/tsconfig.node.json ./packages/web/
COPY packages/web/svelte.config.js ./packages/web/
COPY packages/web/vite.config.ts ./packages/web/

# Create a minimal SvelteKit app structure
RUN mkdir -p packages/web/src/routes
RUN echo '<h1>AI News Agent</h1>' > packages/web/src/routes/+page.svelte
RUN echo '<div><slot /></div>' > packages/web/src/routes/+layout.svelte
RUN touch packages/web/src/app.html
RUN echo '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>AI News Agent</title>%sveltekit.head%</head><body><div>%sveltekit.body%</div></body></html>' > packages/web/src/app.html

# Copy source files
COPY packages/shared/src ./packages/shared/src
COPY packages/api/src ./packages/api/src
COPY packages/web/src ./packages/web/src
COPY packages/database ./packages/database

# Build shared package first
RUN npm run build --workspace=@ai-news-agent/shared || echo "Shared build failed"

# Build API
RUN npm run build --workspace=@ai-news-agent/api || echo "API build failed"

# Setup SvelteKit and build Web
RUN cd packages/web && npx svelte-kit sync || echo "SvelteKit sync failed"
RUN npm run build --workspace=@ai-news-agent/web || echo "Web build failed"

######################
# API PRODUCTION STAGE
######################
FROM node:18-alpine AS api

WORKDIR /app

# Copy production package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/api/package*.json ./packages/api/
COPY packages/database/package*.json ./packages/database/

# Copy built files
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/database ./packages/database

# Install production dependencies
RUN npm install --omit=dev --workspaces=false && \
    npm install --omit=dev --workspace=@ai-news-agent/shared && \
    npm install --omit=dev --workspace=@ai-news-agent/api && \
    npm install --omit=dev --workspace=@ai-news-agent/database

# Expose API port
EXPOSE 3000

# Start the API
CMD ["node", "packages/api/dist/index.js"]

######################
# WEB PRODUCTION STAGE
######################
FROM node:18-alpine AS web

WORKDIR /app

# Copy production package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/web/package*.json ./packages/web/

# Copy built files
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/web/build ./packages/web/build

# Install production dependencies
RUN npm install --omit=dev --workspaces=false && \
    npm install --omit=dev --workspace=@ai-news-agent/shared && \
    npm install --omit=dev --workspace=@ai-news-agent/web

# Expose Web port
EXPOSE 3000

# Start the web server
CMD ["node", "packages/web/build/index.js"]