/**
 * Application Server
 */

// Set environment variables
require("dotenv").config();

// DEPENDENCIES

const path = require("path");

const exphbs = require("express-handlebars"),
  express = require("express");

const { pullWeatherData } = require("./utils/weather");

if (
  !(process.env.GEO_APP_ID && 
    process.env.GEO_APP_CODE && 
    process.env.WEATHER_KEY)
)
{
  console.error("FATAL ERROR: Required environment variables not properly set");
  process.exit(1);
}

// Application setup
const app = express(),
  PORT = process.env.PORT || 3000;

// Static file setup
app.use(express.static(path.join(__dirname, "..", "public")));

// Parser setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup express handlebars template engine
const hbs = exphbs.create({
  extname: ".hbs",
  partialsDir: path.join(__dirname, "../views/includes"),
  helpers: {
    getStylePathsArray: (...stylePaths) =>
    {
      if (stylePaths.length)
      {
        return stylePaths.filter((s) => typeof s === "string");
      }
      
      return null;
    },
    getScriptPathsArray: (...scriptPaths) =>
    {
      if (scriptPaths.length)
      {
        return scriptPaths.filter((s) => typeof s === "string");
      }
      
      return null;
    },
    isActive: (nav, title) => nav === title ? "active" : "",
    isCurrent: (nav, title) => nav === title
  }
});

app.engine(hbs.extname, hbs.engine);
app.set("view engine", hbs.extname);

// MIDDLEWARE

app.use((req, res, next) =>
{
  req.user = { name: "Pistachio Jones" };
  next();
});

// ROUTES

// Landing page get route
app.get("/", (req, res) =>
{
  res.status(200).render("index", {
    title: "Weather",
    name: req.user.name
  });
});

// About page get route
app.get("/about", (req, res) =>
{
  res.status(200).render("about", {
    title: "About",
    name: req.user.name
  });
});

// Help page get route
app.get("/help", (req, res) =>
{
  res.status(200).render("help", {
    title: "Help",
    name: req.user.name,
    message: "Help is here."
  });
});

// Help page endpoint not found
app.get("/help/*", (req, res) =>
{
  res.status(404).render("not-found", {
    title: "Help Article Not Found",
    name: req.user.name,
    path: req.url,
    message: "Try searching the main help page above in the navigation."
  });
});

// Weather api get route
app.get("/weather", (req, res) =>
{
  const addressPattern = /^[a-z0-9\s,\.]{2,}(?<!\s\s)$/i,
    { city, state } = req.query;
    
  if (
    !(city && state) ||
    (typeof city !== "string" && 
     typeof state !== "string")
  )
  {
    return res.status(400).json({
      error: "Not all required address fields provided: street, city, and state"
    });
  }

  const decodedCity = decodeURI(city).trim(),
    decodedState = decodeURI(state).trim();

  if (
    !addressPattern.test(decodedCity) ||
    !addressPattern.test(decodedState)
  )
  {
    return res.status(400).json({
      error: "Insufficient Address Info Provided for required fields: " +
        "street, city, and state"
    });
  }

  const address = `${decodedCity}, ${decodedState}`;
  
  pullWeatherData(address)
    .then((result) =>
    {
      res.status(200).json({ weatherResult: result });
    })
    .catch((err) =>
    {
      res.status(400).json(err);
    });
});

// 404 route for all unsupported routes
app.get("*", (req, res) =>
{
  res.status(404).render("not-found", {
    title: "404 Page Not Found",
    name: req.user.name,
    path: req.url
  });
});

// Server on port
app.listen(PORT, () =>
{
  console.log(`Web server application running on port ${PORT}`);
});
