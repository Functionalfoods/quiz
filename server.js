const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 3000;

console.log('Starting server...');
console.log('Port:', port);
console.log('Build directory:', path.join(__dirname, 'build'));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  console.log('Request for:', req.path);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Server listening on 0.0.0.0:${port}`);
}); 