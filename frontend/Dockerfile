FROM node:20-bullseye AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Remove dev dependencies to leave only production deps
RUN npm prune --production

FROM node:20-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and production deps
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "run", "start"]
