/**
 * Geo Location Fetching Module
 */

// DEPENDENCIES

const request = require("request");

// Fetch location coordinates
function fetchCoordinates(address)
{
  const GEO_APP_ID = process.env.GEO_APP_ID,
    GEO_APP_CODE = process.env.GEO_APP_CODE, 
    encodedAddress = address ? encodeURI(address) : "",
    url = `https://geocoder.api.here.com/6.2/geocode.json?app_id=${GEO_APP_ID}&app_code=${GEO_APP_CODE}&searchtext=${encodedAddress}`;

  return new Promise((resolve, reject) =>
  {
    request(
      { url, method: "get", json: true },

      (err, res, body) =>
      {
        if (!err)
        {          
          if (body.type === "ApplicationError")
          {
            return reject("invalid address provided");
          }

          let lat, long, displayAddress = {};

          try
          {
            const {
              Response: {
                View: { 0: {
                  Result: { 0: {
                    Location: {
                      NavigationPosition,
                      Address
                    }
                  } }
                } }
              }
            } = body,
              { State: state, City: city } = Address;
              
            lat = NavigationPosition[0].Latitude;
            long = NavigationPosition[0].Longitude;
            displayAddress = `${city}, ${state}`;

          } catch (err)
          {
            return reject(
              `Not able to retrieve information for provided address: ${address}`
            );
          }

          resolve({ lat, long, address: displayAddress });

        } else
        {
          reject("trouble connecting to geo location api");
        }
      }
    )
  });
};

// Export geo location module
module.exports = { fetchCoordinates };
 