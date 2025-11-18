FROM node:20-bullseye AS builder
WORKDIR /app

# Install system deps required to build native modules (sharp, bcrypt, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
		python3 \
		make \
		g++ \
		libc6-dev \
		libvips-dev \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
# Prefer Corepack-provided Yarn (Node 20 includes Corepack). If Yarn is not
# available, fall back to installing yarn globally. Use yarn to install deps.
RUN corepack enable || true
RUN if ! command -v yarn >/dev/null 2>&1; then npm install -g yarn@stable || true; fi
RUN yarn install --non-interactive

COPY . .
# Build the project using Yarn (requires dev deps installed in builder)
RUN yarn build

# Keep node_modules from the builder (includes necessary runtime deps)

FROM node:20-bullseye-slim
WORKDIR /app

# Copy production node_modules and built dist from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 3002
CMD ["node", "dist/main"]
