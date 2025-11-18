FROM node:18-bullseye AS builder
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
# Install production dependencies only. Use --omit=dev to skip devDeps and
# --legacy-peer-deps to avoid strict peer-dependency resolution inside the
# build environment (avoids failures coming from dev tooling peer deps).
RUN npm install --omit=dev --legacy-peer-deps --no-audit --no-fund --no-progress

COPY . .
RUN npm run build

FROM node:18-bullseye-slim
WORKDIR /app

# Copy production node_modules and built dist from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 3002
CMD ["node", "dist/main"]
