window.addEventListener('load', () => {
  let messageForm = document.querySelector('#messageForm');
  let fromField = document.querySelector('#fromField');
  let bodyField = document.querySelector('#bodyField');
  let forecastContainer = document.querySelector('#forecastContainer');
  messageForm.addEventListener('submit', event => {
    event.preventDefault();
    let message = {
      from: fromField.value,
      plain: bodyField.value
    };
    submitMessage(message)
    .then(forecast => {
      forecastContainer.textContent = forecast;
    });
  });
});


function submitMessage(payload) {
  console.log("Submitting...");
  let xhr = new XMLHttpRequest();
  let url = '/message';
  // let body = message.body;
  // let params = 'body=' + encodeURIComponent(body).replace('%20', '+');
  let text = JSON.stringify(payload);
  xhr.open('POST', url, true);
  // xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Content-type', 'application/json');
  return new Promise((resolve, reject) => {
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        console.log("status = " + xhr.status);
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        }
      }
    };
    // xhr.send(params);
    xhr.send(text);
  });
}
