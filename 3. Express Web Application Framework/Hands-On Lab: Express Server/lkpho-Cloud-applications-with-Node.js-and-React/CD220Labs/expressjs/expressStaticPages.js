 // Import the Express.js library
const express = require('express');

// Create an instance of an Express application
const app = new express();

// Serve static files from the 'cad220_staticfiles' directory
app.use(express.static('cad220_staticfiles'));

// Start the server and listen on port 8080

app.listen(8080, () => {
    console.log(`Listening at http://localhost:8080`);
});
