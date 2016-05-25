'use strict';

let forecastTime = 1464149256;
let forecastMilliseconds = forecastTime * 1000;

let date = new Date(forecastMilliseconds);
console.log(`Raw date: ${date}`);

let serverOffsetMinutes = date.getTimezoneOffset();
console.log(`Timezone offset: ${serverOffsetMinutes}`);
const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
let serverOffsetMilliseconds = serverOffsetMinutes * MILLISECONDS_PER_MINUTE;

let forecastOffsetHours = -7;
let forecastOffsetMilliseconds = forecastOffsetHours * MILLISECONDS_PER_HOUR;

let adjustedMilliseconds = forecastMilliseconds + serverOffsetMilliseconds + forecastOffsetMilliseconds;
let adjustedDate = new Date(adjustedMilliseconds);
console.log(`Adjusted date: ${adjustedDate}`);
