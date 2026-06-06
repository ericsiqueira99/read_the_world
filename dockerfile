FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---

FROM node:20-alpine AS final

WORKDIR /app
COPY package*.json ./
RUN npm install
# Copy server and any root-level files (no backend/ folder anymore)
COPY server.js ./
COPY helper.js ./
COPY cache/ ./cache/

# Copy the built frontend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 3001
CMD ["node", "server.js"]