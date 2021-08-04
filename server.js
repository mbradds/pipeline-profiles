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

const setCache = function cachePolicy(req, res, next) {
  const period = 60 * 60 * 2; // 2 hours

  // you only want to cache for GET requests
  if (req.method === "GET") {
    // && req.url.match(/.html$/)) {
    res.set("Cache-control", `public, max-age=${period}`);
  } else {
    // for the other requests set strict no caching parameters
    res.set("Cache-control", `no-store`);
  }
  next();
};

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
app.use(setCache);
app.use(limiter);
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));

// send the user to index html page inspite of the url
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

app.listen(port);
