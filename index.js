require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const url = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Store shortened URLs in memory
const urlDatabase = {};
let shortUrlCounter = 1;

// POST endpoint to create shortened URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Validate URL format
  try {
    const parsedUrl = new URL(originalUrl);
    
    // Check if protocol is http or https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    // Verify the URL host exists using dns.lookup
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Create short URL
      const shortUrl = shortUrlCounter++;
      urlDatabase[shortUrl] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });
  } catch (error) {
    res.json({ error: 'invalid url' });
  }
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:shorturl', function(req, res) {
  const shortUrl = parseInt(req.params.shorturl);

  if (urlDatabase[shortUrl]) {
    res.redirect(urlDatabase[shortUrl]);
  } else {
    res.json({ error: 'Short URL not found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
