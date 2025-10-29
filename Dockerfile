FROM node:20-alpine

# Create app dir
WORKDIR /app

# Install only prod deps
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY index.js ./

# Non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

# App listens on 5000 inside the container
ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]