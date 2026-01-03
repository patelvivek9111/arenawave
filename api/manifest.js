// Simple serverless function to serve manifest.json without authentication
module.exports = (req, res) => {
  console.log('Manifest.json requested:', req.url, req.method);
  console.log('Headers:', JSON.stringify(req.headers));
  
  const manifest = {
    "short_name": "ArenaWave",
    "name": "ArenaWave E-commerce",
    "icons": [
      {
        "src": "favicon.ico",
        "sizes": "64x64 32x32 24x24 16x16",
        "type": "image/x-icon"
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

