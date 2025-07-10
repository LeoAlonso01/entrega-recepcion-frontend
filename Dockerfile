# contruccion 
FROM node:18 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY . .

# Install dependencies
RUN npm install

# Build the application
RUN npm run build

# Etapa 2 Servidor de Producción
FROM node:18 AS production

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/dist ./dist

# puerto de environment
ENV PORT=3000

#puerto de la aplicacion
EXPOSE 3000

# cmd to run the application
CMD ["npm", "start"]