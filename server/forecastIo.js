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
  let calendarDay = calendar.get(day);
  if (!calendarDay) {
    calendarDay = {
      day: day,
      hours: []
    };
    calendar.set(day, calendarDay);
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
  return formatCalendar(calendar);
}

function formatCalendar(calendar) {
  let formattedDays = calendar.keys().map(function(calendarDay) {
    return formatCalendarDay(calendarDay);
  });
  return formattedDays.join('\n');
}

function formatCalendarDay(calendarDay) {
  let day = calendarDay.day;
  let dayOfWeek = DAYS_OF_WEEK[day.getDay()];
  let result = `${dayOfWeek}\n`;
  let formattedHours = calendarDay.hours.map(function(temperature, hour) {
    return formatHour(hour, temperature);
  });
  result += formattedHours.join('\n');
  return result;
}

function formatHour(hour, temperature) {
  return `${hour} ${temperature}°`;
}

function getDateFromHourData(hourData) {
  let date = new Date();
  let milliseconds = hourData.time * 1000;
  date.setTime(milliseconds);
  return date;
}

// Return midnight on the given date.
function getDayFromDate(date) {
  var day = new Date();
  day.setYear(date.getYear());
  day.setMonth(date.getMonth());
  day.setDate(date.getDate());
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
    var data = JSON.parse(response);
    var hourly = data.hourly;
    console.log("Got forecast");
    return JSON.stringify(hourly);
  });
}

module.exports = {
  format: format,
  getForecast: getForecast
};
