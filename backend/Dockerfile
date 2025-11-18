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
# Use npm ci for reproducible installs (falls back to npm install if lockfile missing)
RUN npm ci --only=production || npm install --production

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
