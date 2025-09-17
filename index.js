require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns");
const bodyParser = require("body-parser");
const urlParser = require("url");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.use(bodyParser.urlencoded({ extended: false }));
let urls = [];
let id = 1;


// POST /api/shorturl
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  // Validate format: must start with http:// or https://
  if (!/^https?:\/\//i.test(originalUrl)) {
    return res.json({ error: "invalid url" });
  }

  const hostname = urlParser.parse(originalUrl).hostname;

  dns.lookup(hostname, (err) => {
    if (err) return res.json({ error: "invalid url" });

    // ✅ Check if URL already exists
    const existing = urls.find((u) => u.originalUrl === originalUrl);
    if (existing) {
      return res.json({
        original_url: existing.originalUrl,
        short_url: existing.shortUrl,
      });
    }

    // If not found → create new
    const shortUrl = id++;
    urls.push({ shortUrl, originalUrl });

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// GET /api/shorturl/:short_url
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = parseInt(req.params.short_url, 10);
  const entry = urls.find((u) => u.shortUrl === shortUrl);

  if (entry) {
    return res.redirect(entry.originalUrl);
  } else {
    return res.json({ error: "invalid url" });
  }
});


// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
