/**
 * Express "weather" app — single file with full comments
 * Steps:
 * 1) Declare (have a package.json)
 * 2) Run npm for module (npm i express)
 * 3) Import express
 * 4) Create a route handler
 * 5) Start an HTTP server
 */

/* ===================== 3) IMPORT EXPRESS ===================== */
const express = require('express');            // load the framework
const app = express();                         // create an app instance

/* ===================== 4) CREATE ROUTE HANDLERS ============== */
// Healthcheck (quick sanity check)

app.get('/', (req, res) => {
  res.send('OK. Try /ping or /temperature/HN');
});


app.get('/ping', (req, res) => {
  // This handler runs when a client sends GET /ping
  // It returns JSON to the same client over the same TCP connection.
  res.status(200).json({ ok: true, time: new Date().toISOString() });
});

// Mock weather service (simulates fetching temperature by location code)
const weather = {
  current: async (locationCode) => {
    // Simulate latency
    await new Promise(r => setTimeout(r, 80));

    // Basic validation for the path param
    // Chỉ accept các location code có trong base
    const validCodes = ['HN', 'HCM', 'NYC123', 'LON'];
    if (!validCodes.includes(locationCode)) {
    const err = new Error('Invalid location code');
    err.status = 400;
    throw err;
    }

    // Demo data (normally you'd call a real API/DB)
    const base = { HN: 86, HCM: 90, NYC123: 78, LON: 68 };
    return base[locationCode] ?? 75; // default 75°F
  }
};


// Root path → simple text response
app.get('/', (req, res) => {
  res.send('OK. Try /ping or /temperature/HN');
});



// GET /temperature/:location_code → returns JSON { location, temp_f }
app.get('/temperature/:location_code', async (req, res) => {
  try {
    // Read the path parameter from the URL
    const location = req.params.location_code;

    // Call the “service” (could be an API/DB in real life)
    const temp_f = await weather.current(location);

    // Send JSON response back to the requesting client
    res.json({ location, temp_f });
  } catch (e) {
    // Send an error response with appropriate HTTP status code
    res.status(e.status || 500).json({ message: e.message || 'Server error' });
  }
});

/* ===================== 5) START HTTP SERVER ================== */
// PORT = the TCP port the server will bind to and listen on.
// HOST = 'localhost' (only local) or '0.0.0.0' (all interfaces).
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// app.listen creates an underlying Node http.Server, binds to HOST:PORT,
// registers with the OS to receive incoming TCP connections, and begins
// listening. The callback runs ONCE when the server is ready (not per request).
app.listen(PORT, HOST, () => {
  console.log(`Server listening at http://${HOST}:${PORT}`);
});

/* ===================== NOTES =================================
1) Declare:
   - Run `npm init -y` to create package.json (project manifest).

2) Run npm for module:
   - Install Express: `npm i express`

3) Import express:
   - See the require('express') above; CommonJS style in Node.

4) Create a new route handler:
   - app.get('/path', handler) registers the function to run when METHOD+PATH match.
   - handler signature: (req, res, next?) → read req, write res.

5) Start an HTTP server:
   - app.listen(PORT[, HOST]) binds the process to IP:PORT and listens for HTTP requests.
   - Responses are sent back to the SAME client over the SAME connection.
=============================================================== */
