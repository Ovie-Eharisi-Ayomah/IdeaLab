console.log('Starting server initialization...');
require('dotenv').config();
console.log('Loaded dotenv');

const express = require('express');
console.log('Loaded express');

const cors = require('cors');
console.log('Loaded cors');

const app = express();
console.log('Created express app');

const PORT = process.env.PORT || 5003;
console.log('Port configured:', PORT);

// Middleware
app.use(cors());
console.log('Added cors middleware');

app.use(express.json());
console.log('Added json middleware');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Idea Lab API is running' });
});
console.log('Added health check endpoint');

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`What's popping homie`);
});
console.log('Called listen()');