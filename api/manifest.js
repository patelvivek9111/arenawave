// Simple serverless function to serve manifest.json without authentication
module.exports = (req, res) => {
  console.log('Manifest.json requested:', req.url, req.method);
  console.log('Headers:', JSON.stringify(req.headers));
  
  const manifest = {
    "short_name": "ArenaWav",
    "name": "ArenaWav — In-venue live audio",
    "icons": [
      {
        "src": "favicon.png",
        "sizes": "512x512 192x192 32x32",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ],
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#000000",
    "background_color": "#ffffff"
  };
  
  // Set proper headers - no authentication required
  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Return 200 status with manifest
  console.log('Sending manifest.json response');
  res.status(200).json(manifest);
};

