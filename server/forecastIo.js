"use strict";

/*
 * Return a promise for a weather forecast for the given location.
 */

let request = require('request-promise');

let MAX_MESSAGE_LENGTH = 160;

let DAYS_OF_WEEK = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
  // 'SUN',
  // 'MON',
  // 'TUE',
  // 'WED',
  // 'THU',
  // 'FRI',
  // 'SAT'
];

let ABBREVIATIONS = {
  " at ": " ",
  " on ": " ",
  " the ": " ",
  " with ": " ",
  "Friday": "Fri",
  "Monday": "Mon",
  "Saturday": "Sat",
  "Sunday": "Sun",
  "Thursday": "Thu",
  "Tuesday": "Tue",
  "Wednesday": "Wed",
  "clear-day": "clear",
  "clear-night": "clear",
  "falling": "fall",
  "partly-cloudy-day": "partly cloudy",
  "partly-cloudy-night": "partly cloudy",
  "precipitation": "precip",
  "rising": "rise",
  "temperatures": "temps",
  "throughout": "thru"
  // "cloudy": "",
  // "fog": "",
  // "rain": "",
  // "sleet": "",
  // "snow": "",
  // "wind": "",
};

function abbreviate(text) {
  let result = text;
  for (let key of Object.keys(ABBREVIATIONS)) {
    result = result.replace(key, ABBREVIATIONS[key]);
  }
  return result;
}

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
  calendarDay.hours[hour] = {
    icon: hourData.icon,
    temperature: hourData.temperature
  };
}

// Clip the full text to fit in a 160 character text message, breaking at the
// last full line that fits.
function fitInTextMessage(full) {
  let lines = full.split('\n');
  let result = '';
  for (let line of lines) {
    let added = result;
    if (added.length > 0) {
      added = added + '\n';
    }
    added = added + line;
    // console.log(`[${added.length}, ${line.length}]${line}`);
    if (added.length > MAX_MESSAGE_LENGTH) {
      // Not enough room for everything.
      break;
    }
    result = added;
  }
  // console.log(`[${result.length}]`);
  // Entire message fit.
  return result;
}

// Format a Forecast.io forecast for human presentation.
function format(forecast) {
  let calendar = new Map();
  forecast.hourly.data.forEach(function(hourData) {
    addHourDataToCalendar(hourData, calendar);
  });
  // addHourDataToCalendar(forecast.hourly.data[0], calendar);
  let formattedSummary = abbreviate(forecast.daily.summary);
  let text = `${formattedSummary}\n`;
  text += formatCalendar(calendar);
  let result = fitInTextMessage(text);
  return result;
}

function formatCalendar(calendar) {
  let calendarDays = [];
  for (let calendarDay of calendar.values()) {
    calendarDays.push(calendarDay);
  }
  let formattedDays = calendarDays.map(function(calendarDay) {
    return formatCalendarDay(calendarDay);
  });
  return formattedDays.join('\n\n');
}

function formatCalendarDay(calendarDay) {
  let day = calendarDay.day;
  let dayOfWeek = DAYS_OF_WEEK[day.getDay()];
  let result = `${dayOfWeek}\n`;
  let formattedHours = [];
  let previousIcon = null;
  calendarDay.hours.forEach(function(data, hour) {
    let includeHour = (hour % 3 ===0) && (hour >= 6) && (hour <= 21);
    let temperature = data.temperature;
    if (temperature && includeHour) {
      let icon = (data.icon === previousIcon) ? null : data.icon;
      formattedHours.push(formatHour(hour, temperature, icon));
      previousIcon = data.icon;
    }
  });
  result += formattedHours.join('\n');
  return result;
}

function formatHour(hour, temperature, icon) {
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
  let formattedIcon = formatIcon(icon);
  return `${formattedHour}${meridiem} ${formattedTemperature}°${formattedIcon}`;
}

function formatIcon(icon) {
  let formattedIcon = icon ?
    abbreviate(icon) :
    '';
  return formattedIcon;
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
