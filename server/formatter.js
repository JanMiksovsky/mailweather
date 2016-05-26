/*
 * Given a Forecast.io forecast, create a version suitable for sending in a
 * text message.
 */

'use strict';


const MAX_MESSAGE_LENGTH = 147; // DeLorme seems to only take this many chars?

const DAYS_OF_WEEK = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

const ABBREVIATIONS = {
  "\\.": "",
  "°F": "°",
  " and ": "+",
  " at ": " ",
  " on ": " ",
  " the ": " ",
  " with ": " ",
  " through ": "–",
  "Friday": "Fri",
  "Monday": "Mon",
  "Saturday": "Sat",
  "Sunday": "Sun",
  "Thursday": "Thu",
  "Tuesday": "Tue",
  "Wednesday": "Wed",
  "bottoming": "bottom",
  "clear-day": "clear",
  "clear-night": "clear",
  "falling": "fall",
  "partly-cloudy-day": "part cloudy",
  "partly-cloudy-night": "part cloudy",
  "peaking": "peak",
  "precipitation": "precip",
  "rising": "rise",
  "temperatures": "temps",
  "throughout": "thru"
};

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
let serverOffsetMinutes = (new Date()).getTimezoneOffset();
const SERVER_TIMEZONE_OFFSET_MILLISECONDS = serverOffsetMinutes * MILLISECONDS_PER_MINUTE;


function abbreviate(text) {
  let result = text;
  for (let key of Object.keys(ABBREVIATIONS)) {
    let regex = new RegExp(key, 'g');
    result = result.replace(regex, ABBREVIATIONS[key]);
  }
  return result;
}

function addDailyDataToCalendar(forecast, dailyData, calendar) {
  let date = getDateFromForecastTime(forecast, dailyData.time);
  let calendarDay = getCalendarDayForDate(calendar, date);
  calendarDay.temperatureMaxHour = getDateFromForecastTime(forecast, dailyData.temperatureMaxTime).getHours();
  calendarDay.temperatureMinHour = getDateFromForecastTime(forecast, dailyData.temperatureMinTime).getHours();
}

function addHourDataToCalendar(forecast, hourData, calendar) {
  let date = getDateFromForecastTime(forecast, hourData.time);
  let calendarDay = getCalendarDayForDate(calendar, date);
  let hour = date.getHours();
  calendarDay.hours[hour] = {
    icon: hourData.icon,
    temperature: hourData.temperature
  };
}

// Clip the full text to fit in the given character limit, breaking at the
// last full line that fits.
function fitLinesToLimit(full, characterLimit) {
  let lines = full.split('\n');
  let result = '';
  for (let line of lines) {
    let added = result;
    if (added.length > 0) {
      added = added + '\n';
    }
    added = added + line;
    // console.log(`[${added.length}, ${line.length}]${line}`);
    if (added.length > characterLimit) {
      // Not enough room for everything.
      break;
    }
    result = added;
  }
  return result;
}

// Format a Forecast.io forecast for human presentation.
function formatForecast(forecast) {
  // Format calendar.
  let calendar = new Map();
  forecast.hourly.data.forEach(function(hourData) {
    addHourDataToCalendar(forecast, hourData, calendar);
  });
  forecast.daily.data.forEach(function(dailyData) {
    addDailyDataToCalendar(forecast, dailyData, calendar);
  });

  // Format message outro (bottom).
  let formattedSummary = abbreviate(forecast.daily.summary);
  // let formattedLatitude = formatFloat(forecast.latitude);
  // let formattedLongitude = formatFloat(forecast.longitude);
  // let outro = `\n\n${formattedSummary}\n${formattedLatitude},${formattedLongitude}`;
  let outro = `\n\n${formattedSummary}`;

  // Fit the calendar into the room remaining.
  let formattedCalendar = formatCalendar(calendar);
  let roomForCalendar = MAX_MESSAGE_LENGTH - outro.length;
  let fitCalendar = fitLinesToLimit(formattedCalendar, roomForCalendar);

  // Combine calendar and outro.
  let result = fitCalendar + outro;
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
    includeHour = includeHour || hour === calendarDay.temperatureMaxHour;
    includeHour = includeHour || hour === calendarDay.temperatureMinHour;
    let temperature = data.temperature;
    if (temperature && includeHour) {
      let icon = formatIcon(data.icon);
      // Suppress duplicate icon.
      let formattedIcon = (icon !== previousIcon) ?
        icon :
        '';
      formattedHours.push(formatHour(hour, temperature, formattedIcon));
      previousIcon = icon;
    }
  });
  result += formattedHours.join('\n');
  return result;
}

function formatFloat(float) {
  return Math.round(float * 100) / 100;
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
  let formattedIcon = icon || '';
  return `${formattedHour}${meridiem} ${formattedTemperature}°${formattedIcon}`;
}

function formatIcon(icon) {
  return icon ?
    abbreviate(icon) :
    '';
}

function getCalendarDayForDate(calendar, date) {
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
  return calendarDay;
}

// Return a JavaScript Date for the given UTC time, offsetting by the time zone
// specified by the forecast.
function getDateFromForecastTime(forecast, time) {

  let timeMilliseconds = time * 1000;

  // The forecast timezone offset has the opposite sign of the offset we get
  // back from JavaScript's getTimezoneOffset.
  let forecastOffsetHours = -forecast.offset;
  let forecastOffsetMilliseconds = forecastOffsetHours * MILLISECONDS_PER_HOUR;

  let adjustedMilliseconds = timeMilliseconds + SERVER_TIMEZONE_OFFSET_MILLISECONDS - forecastOffsetMilliseconds;
  let adjustedDate = new Date(adjustedMilliseconds);
  return adjustedDate;
}

// Return midnight on the given date.
function getDayFromDate(date) {
  let day = new Date(date.getTime());
  day.setHours(0);
  day.setMinutes(0);
  day.setSeconds(0);
  day.setMilliseconds(0);
  return day;
}


module.exports = {
  abbreviate,
  formatForecast
};
