# Stage 1: Base image
FROM node:18-slim AS base

WORKDIR /app

COPY package*.json ./

RUN npm install

# Stage 2: Development image
FROM base AS dev

ENV NODE_ENV=development

# Install development dependencies and copy app code
RUN npm install --only=development

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Stage 3: Production image
FROM base AS prod

ENV NODE_ENV=production

# Install production dependencies
RUN npm install --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
