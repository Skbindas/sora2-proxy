const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

app.all('*', async (req, res) => {
  try {
    const targetUrl = `https://api.sora2.ai${req.path}`;
    
    const headers = {
      ...req.headers,
      'host': 'api.sora2.ai',
      'origin': 'https://sora2.ai',
      'referer': 'https://sora2.ai/'
    };
    delete headers['host'];

    const options = {
      method: req.method,
      headers: headers
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, options);
    const data = await response.text();

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Sora2 proxy running on port ${PORT}`);
});
