const express = require('express');
const path = require('path');

const app = express();
// Use the PORT environment variable provided by the hosting service, or default to 3000
const port = process.env.PORT || 3000;

// Serve static files (like index.html, index.tsx, etc.) from the root directory
app.use(express.static(path.join(__dirname)));

// For any request that doesn't match a static file, send back index.html.
// This is crucial for single-page applications to handle client-side routing.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Listen on 0.0.0.0 to be accessible from outside the container, on the specified port.
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});
