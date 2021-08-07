const express = require("express");
const compression = require("compression");
const path = require("path");
const rateLimit = require("express-rate-limit");

const port = process.env.PORT || 8080;
const app = express();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 500, // limit each IP to 500 requests per windowMs
});

function cachePolicy(req, res, next) {
  const periodShort = 60 * 60 * 2; // 2 hours
  const periodLong = 31536000; // 1 year

  const noContentHash = /GCWeb|wet-boew/;
  const isHtml = /.html$/;
  if (req.method === "GET") {
    if (req.url.match(isHtml)) {
      res.set("Cache-control", `no-store`);
    } else if (!req.url.match(noContentHash)) {
      res.set("Cache-control", `public, max-age=${periodLong}`);
    } else {
      res.set("Cache-control", `public, max-age=${periodShort}`);
    }
  } else {
    // for the other requests set strict no caching parameters
    res.set("Cache-control", `no-store`);
  }
  next();
}

function shouldCompress(req, res) {
  if (req.headers["x-no-compression"]) {
    // don't compress responses with this request header
    return false;
  }
  // fallback to standard filter function
  return compression.filter(req, res);
}

app.disable("x-powered-by");
app.use(compression({ filter: shouldCompress }));
app.use(cachePolicy);
app.use(limiter);
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));

// send the user to index html page inspite of the url
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

app.listen(port);
