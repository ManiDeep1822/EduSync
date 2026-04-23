const https = require('https');

/**
 * Pings the server periodically to prevent Render's free-tier cold starts.
 * @param {string} url - The URL of the hosted application.
 */
const keepAlive = (url) => {
  if (!url) {
    console.log('Keep-alive: No URL provided. Pinging skipped.');
    return;
  }

  // Ping every 14 minutes (Render spins down after 15 minutes)
  const INTERVAL = 14 * 60 * 1000;

  setInterval(() => {
    https.get(url, (res) => {
      console.log(`Keep-alive: Pinged ${url} - Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`Keep-alive: Error pinging ${url}: ${err.message}`);
    });
  }, INTERVAL);

  console.log(`Keep-alive: Started for ${url} (14m intervals)`);
};

module.exports = keepAlive;
