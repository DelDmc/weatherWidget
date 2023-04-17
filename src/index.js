import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY;
const FORECAST_ENDPOINT = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&days=2`;
const DEFAULT_LOCATION = "Odesa";

const locationInput = document.getElementById("locationInput");
const currentTitle =  document.getElementById("currentTitle");

const currentTemperature = document.getElementById("currentTempC");
const todayMaxTemperature = document.getElementById("todayMinTempC");
const todayMinTemperature = document.getElementById("todayMaxTempC");

const tomorrowMaxTemperature = document.getElementById("tomorrowMinTempC");
const tomorrowMinTemperature = document.getElementById("tomorrowMaxTempC");

const currentCondition = document.getElementById("currentCondition");
const tomorrowCondition = document.getElementById("tommorowCondition");

const currentWindDir = document.getElementById("currentWIndDir");
const currentWindSpeed = document.getElementById("currentWIndSpeed");

const todayChanceOfRain = document.getElementById("todayChanceOfRain");
const todayChanceOfSnow = document.getElementById("todayChanceOfSnow");
const tomorrowChanceOfRain = document.getElementById("tomorrowChanceOfRain");
const tomorrowChanceOfSnow = document.getElementById("tomorrowChanceOfSnow");

const currentIcon = document.getElementById("currentIcon");
const tomorrowIcon = document.getElementById("tomorrowIcon");

const chartToday = document.getElementById('current-chart');

const locationDescription = document.getElementById("locationDescription");
const locationDescriptionChildArray = locationDescription.getElementsByTagName("p");

document.addEventListener("DOMContentLoaded", function() {
  fillTodayWeatherValues(DEFAULT_LOCATION);
  buildChart(DEFAULT_LOCATION);
});

locationInput.addEventListener("change", function() {
  const searchLocation = locationInput.value;
  fillTodayWeatherValues(searchLocation);
  if (Object.values(Chart.instances)[0] !== undefined) {
    Object.values(Chart.instances)[0].destroy();
  }
  buildChart(searchLocation);
});

async function fetchData(endpoint, location) {
  const response = await fetch(`${endpoint}&q=${location}&aqi=no`);
  const data = await response.json();
  return data;
}

async function fetchForecast (location) {
  return fetchData(FORECAST_ENDPOINT, location);
}

function fillTodayWeatherValues(location){
  fetchForecast (location)
    .then(data => {
      currentTitle.textContent = `Current weather in ${location}`;
      
      currentTemperature.textContent = `Current: ${data.current.temp_c} °C`;
      todayMinTemperature.textContent = `Min: ${data.forecast.forecastday[0].day.mintemp_c} °C`;
      todayMaxTemperature.textContent = `Max: ${data.forecast.forecastday[0].day.maxtemp_c} °C`;

      tomorrowMinTemperature.textContent = `Min: ${data.forecast.forecastday[1].day.mintemp_c} °C`;
      tomorrowMaxTemperature.textContent = `Max: ${data.forecast.forecastday[1].day.maxtemp_c} °C`;

      currentCondition.textContent = data.current.condition.text;
      tomorrowCondition.textContent = data.forecast.forecastday[1].day.condition.text;

      currentWindDir.textContent = data.current.wind_dir;
      currentWindSpeed.textContent = `${data.current.wind_kph} kph`;

      todayChanceOfRain.textContent = `${data.forecast.forecastday[0].day.daily_chance_of_rain} %`;
      todayChanceOfSnow.textContent = `${data.forecast.forecastday[0].day.daily_chance_of_snow} %`;
      tomorrowChanceOfRain.textContent = `${data.forecast.forecastday[1].day.daily_chance_of_rain} %`;
      tomorrowChanceOfSnow.textContent = `${data.forecast.forecastday[1].day.daily_chance_of_snow} %`;

      currentIcon.src = data.current.condition.icon;
      currentIcon.style.display = "";
      tomorrowIcon.src = data.forecast.forecastday[1].day.condition.icon;
      tomorrowIcon.style.display = "";

      locationDescriptionChildArray[0].textContent = `Displayed: ${data.location.name}`;
      locationDescriptionChildArray[1].textContent = `Region: ${data.location.region}`; 
      locationDescriptionChildArray[2].textContent = `Country: ${data.location.country}`;
      
    });
}

function collectHourlyData(data, dayIndex){
  const hoursArray = data.forecast.forecastday[+dayIndex].hour;
  const chartData = [];
  hoursArray.forEach(
    hour => {
      const hourShortFormat = hour.time.substring(11, 13);
      chartData.push({x:hourShortFormat, y:hour.temp_c});
    });
  return chartData;
}

async function buildChart(location){
  const data = await fetchForecast(location);
  const todayHourlyData = collectHourlyData(data, 0);
  const tomorrowHourlyData = collectHourlyData(data, 1);

  const currentOptions = {
    scales :{
      y:{
        title:{
          text: "Temperature (°C)",
          display: true,
          color: 'black',
        },
      },
      x: {
        title:{
          text: "Hours (hrs)",
          display: true,
          color: 'black',
        },
      }
    },
    plugins: {
      legend:{
        display: true,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 100,
          font: {
            size: 16,
          }
        }
      }
    },
  };
  new Chart(chartToday,   
    {
        type: 'line',
        data: {
          datasets: [
            {
            label: 'Today temperature',
            data: todayHourlyData,
            borderColor: 'rgb(70, 130, 180)',
            fill: false,
            tension: 0.2
          },
          {
            label: 'Tomorrow temperature',
            data: tomorrowHourlyData,
            borderColor: 'rgb(255, 127, 80)',
            tension: 0.2,
            fill: false
          }
        ]
      },
      options: currentOptions,
      }
    );
}

