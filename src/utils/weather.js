/**
 * Weather Fetching Module
 */

// DEPENDENCIES

const request = require("request");

const { fetchCoordinates } = require("./geo-location");

// Fetch weather with provided coordinates
function fetchWeatherData({ lat, long, address })
{  
  const WEATHER_KEY = process.env.WEATHER_KEY,
    url = `https://api.darksky.net/forecast/${WEATHER_KEY}/${lat},${long}`;

  return new Promise((resolve, reject) =>
  {
    request(
      { url, method: "get", json: true },

      (err, res, body) =>
      {
        if (!err)
        {
          if (body.code === 400) {
            return reject("invalid location coordinates provided");
          }

          let summary, temp;
          
          try
          {
            const { currently } = body;
            summary = currently.summary;
            temp = currently.temperature;
            
          } catch (err)
          {
            return reject("not able to retrieve necessary weather information");
          }

          resolve({ summary: summary.toLowerCase(), temp, address });

        } else
        {
          reject("trouble connecting to weather api");
        }
      }
    );
  });
};

// Get & format weather data
function pullWeatherData(address)
{ 
  return new Promise((resolve, reject) =>
  {
    fetchCoordinates(address)
      .then(fetchWeatherData)
      .then(({ summary, temp, address }) =>
      {
        const message =  (
          `It is ${summary} in ${address} with a temperature of ${temp}.`
        );
    
        resolve({ message, summary, address, temp });
      })
      .catch((err) =>
      {
        const errorNotification = (
          "Unable to fetch weather data with provided address: " +
          `${decodeURI(address)}`
        ),
          error = err;
        
        reject({ errorNotification, error });
      });
  });
};

// Export weather module
module.exports = { fetchWeatherData, pullWeatherData };
