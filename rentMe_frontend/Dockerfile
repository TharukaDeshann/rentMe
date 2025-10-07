# -------- Stage 1: Build the Next.js app --------
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Build the app for production
RUN npm run build

# -------- Stage 2: Serve with Nginx --------
FROM nginx:stable-alpine

# Copy built static files to Nginx's html directory
# Next.js exports to .next/static and .next/server/app (for static sites)
# If you’re using "next export", replace the path with "out/"
COPY --from=builder /app/.next /usr/share/nginx/html/.next
COPY --from=builder /app/public /usr/share/nginx/html/public

# Copy a custom Nginx config for Next.js routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port Nginx serves on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
