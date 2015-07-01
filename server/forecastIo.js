"use strict";

/*
 * Return a promise for a weather forecast for the given location.
 */

let request = require('request-promise');

let DAYS_OF_WEEK = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

function addHourDataToCalendar(hourData, calendar) {
  let date = getDateFromHourData(hourData);
  let day = getDayFromDate(date);
  let time = day.getTime();
  let calendarDay = calendar.get(time);
  if (!calendarDay) {
    calendarDay = {
      day: day,
      hours: []
    };
    calendar.set(time, calendarDay);
  }
  addHourDataToCalendarDay(hourData, calendarDay);
}

function addHourDataToCalendarDay(hourData, calendarDay) {
  let date = getDateFromHourData(hourData);
  let hour = date.getHours();
  calendarDay.hours[hour] = hourData.temperature;
}

// Format a Forecast.io forecast for human presentation.
function format(forecast) {
  let calendar = new Map();
  forecast.hourly.data.forEach(function(hourData) {
    addHourDataToCalendar(hourData, calendar);
  });
  // addHourDataToCalendar(forecast.hourly.data[0], calendar);
  return formatCalendar(calendar);
}

function formatCalendar(calendar) {
  let calendarDays = [];
  for (let calendarDay of calendar.values()) {
    calendarDays.push(calendarDay);
  }
  let formattedDays = calendarDays.map(function(calendarDay) {
    return formatCalendarDay(calendarDay);
  });
  return formattedDays.join('\n');
}

function formatCalendarDay(calendarDay) {
  let day = calendarDay.day;
  let dayOfWeek = DAYS_OF_WEEK[day.getDay()];
  let result = `${dayOfWeek}\n`;
  let formattedHours = [];
  calendarDay.hours.forEach(function(temperature, hour) {
    var includeHour = (hour % 3 ===0) && (hour >= 6) && (hour <= 21);
    if (temperature && includeHour) {
      formattedHours.push(formatHour(hour, temperature));
    }
  });
  result += formattedHours.join('\n');
  return result;
}

function formatHour(hour, temperature) {
  let meridiem = hour < 12 ? 'a' : 'p';
  let formattedHour = hour % 12;
  if (formattedHour === 0) {
    formattedHour = 12;
  } else if (formattedHour < 10) {
    formattedHour = ` ${formattedHour}`;
  }
  // We round the temperature to the nearest integer. Forecast.io appears to
  // do something more complex, sometimes (but not always?) rounding down for
  // fractions above .5. So our forecasts won't agree precisely.
  let formattedTemperature = Math.round(temperature);
  return `${formattedHour}${meridiem} ${formattedTemperature}°`;
}

function getDateFromHourData(hourData) {
  return new Date(hourData.time * 1000);
}

// Return midnight on the given date.
function getDayFromDate(date) {
  var day = new Date(date.getTime());
  day.setHours(0);
  day.setMinutes(0);
  day.setSeconds(0);
  day.setMilliseconds(0);
  return day;
}

// Return a promise for a forecast from Forecast.io.
function getForecast(location) {
  let apiKey = process.env.FORECAST_API_KEY;
  let latitude = location.latitude;
  let longitude = location.longitude;
  let url = `https://api.forecast.io/forecast/${apiKey}/${latitude},${longitude}`;
  console.log(`Getting forecast: ${url}`);
  return request(url)
  .then(function(response) {
    let forecast = JSON.parse(response);
    console.log("Got forecast");
    let formatted = format(forecast);
    return formatted;
  });
}

module.exports = {
  format: format,
  getForecast: getForecast
};
