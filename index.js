const express = require('express');
const fetch = require('node-fetch');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

// SSL verification disable karne ke liye agent
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT
});

app.use(express.json());
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

app.all('*', async (req, res) => {
  try {
    const targetUrl = `https://api.sora2.ai${req.path}`;
    
    const headers = {
      ...req.headers,
      'origin': 'https://sora2.ai',
      'referer': 'https://sora2.ai/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    
    // Remove problematic headers
    delete headers['host'];
    delete headers['connection'];

    const options = {
      method: req.method,
      headers: headers,
      agent: httpsAgent  // SSL bypass agent
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, options);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    if (typeof data === 'object') {
      res.json(data);
    } else {
      res.send(data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: error.message,
      type: error.type,
      code: error.code 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Sora2 proxy running on port ${PORT}`);
});
