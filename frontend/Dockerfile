FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Environment variable for API URL (can be overridden)
ENV VITE_API_URL=http://localhost:8000

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
