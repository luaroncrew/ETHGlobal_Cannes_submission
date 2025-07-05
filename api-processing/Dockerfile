# Step 1: Use an official Node.js image
FROM node:20-alpine

# Step 2: Create the app directory in the container
WORKDIR /app

# Step 3: Copy files needed to install dependencies
COPY package*.json ./

# Step 4: Install dependencies (production only here)
RUN npm install --only=production

# Step 5: Copy the rest of the project into the container
COPY . .

# Step 6: Expose the app port (adapt if needed)
EXPOSE 3001

# Step 7: Command to start the app
CMD ["npm", "start"]