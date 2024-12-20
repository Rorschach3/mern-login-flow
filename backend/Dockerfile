# Use Node.js official image
FROM node:18


# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose port 5000
EXPOSE 5000

# Run the server
CMD ["npm", "start"]
