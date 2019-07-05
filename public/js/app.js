/**
 * Main Client Side Base
 */

//  TODO: start implementing main logic

// VARIABLES

const addressForm = $("#address");

console.log("Address Form:", addressForm);

// FUNCTIONS

// Check element for style classes
const hasClasses = (el, cls) =>
{
  return cls.some((c) => (
    el.classList.contains(c)
  ));
};

// Add style classes to element
const addStyleClasses = (el, cls) =>
{
  if (cls instanceof Array && cls.length)
  {
    if (!hasClasses(el, cls))
    {
      el.classList.add(...cls);
      return true;
    }
  }

  return false;
};

// Create paragraph
const createElement = (el, text, cls) =>
{
  const element = document.createElement(el);

  addStyleClasses(element, cls);  
  element.textContent = text;
  return element;
};

const appendElement = (parentEl, el) =>
{
  const parent = document.querySelector(parentEl);

  parent.innerHTML = "";
  parent.appendChild(el);
};

// Fetch weather data with provided street, city, state
const fetchWeather = (city, state) =>
{
  return new Promise((resolve, reject) =>
  {
    fetch(`/weather?city=${city}&state=${state}`)
      .then((res) => res.json())
      .then(({ error, weatherResult }) =>
      {
        if (error)
        {
          return reject({ error });
        }
  
        resolve({ weather: weatherResult });
      })
      .catch((err) =>
      {
        return { error: err, weather: null };
      });
  });
};

// EVENT HANDLERS

addressForm.on("submit", function(e)
{
  e.preventDefault();

  const cityStatePattern = /^[a-z\s,\.]{2,}(?<!\s\s)(?<!\.\.)(?<!\,\,)$/i,
    city = $("#city").val().trim(),
    state = $("#state").val().trim();

  if (
    !(cityStatePattern.test(city) &&
    cityStatePattern.test(state))
  )
  {
    return appendElement(
      ".weather", createElement(
        "p", 
        ("Invalid field input: city and state must consist of two or more " +
        "valid alphabet characters"),
        ["lead", "text-center", "text-danger"]
      )
    );
  }

  $("#city").val("");
  $("#state").val("");

  appendElement(
    ".weather", createElement(
      "p", 
      "Loading...", 
      ["lead", "text-center", "text-muted"]
    )
  );

  fetchWeather(city, state)
    .then(({ error = null, weather: { message } = null }) =>
    {
      if (error)
      {
        console.error(error);
        appendElement(
          ".weather", createElement(
            "p", 
            "Unable to fetch weather data", 
            ["lead", "text-center", "text-danger"]
          )
        );
      }

      else appendElement(
        ".weather", createElement(
          "p", message, ["lead", "text-center", "text-success"]
        )
      );
    })
    .catch(({ error }) =>
    {
      appendElement(
        ".weather", createElement(
          "p", error, ["lead", "text-center", "text-danger"]
        )
      );
    });
});
