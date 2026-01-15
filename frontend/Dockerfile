FROM node:20-bullseye AS builder
WORKDIR /app
COPY package*.json ./
RUN command -v yarn >/dev/null 2>&1 || npm install -g yarn@latest
RUN yarn install --non-interactive
COPY . .
RUN yarn build
RUN yarn workspaces focus --production --all || true

FROM node:20-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Copy built app and production deps
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000
CMD ["npm", "run", "start"]
