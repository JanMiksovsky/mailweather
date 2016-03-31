let MessageForm = React.createClass({

  displayName: 'MessageForm',

  render: function() {
    return React.createElement(
      'form',
      {
        onSubmit: this.submit
      },
      React.createElement(
        'p',
        null,
        "From: ",
        React.createElement('input', {
          ref: 'from',
          type: 'text',
          value: this.props.from
        })
      ),
      React.createElement(
        'textarea',
        {
          ref: 'body',
          type: 'text'
        },
        this.props.body
      ),
      React.createElement(
        'p',
        null,
        React.createElement('input', {
          type: 'submit',
          value: 'Send'
        })
      )
    );
  },

  submit: function(event) {
    event.preventDefault();
    let message = {
      from: this.refs.from.getDOMNode().value,
      body: this.refs.body.getDOMNode().value
    };
    this.props.onSubmit(message);
  }

});


let WeatherApp = React.createClass({

  displayName: 'WeatherApp',

  getInitialState: function() {
    return {
      forecast: ''
    };
  },

  render: function() {
    return React.createElement(
      'div',
      null,
      React.createElement(MessageForm, {
        from: '',
        body: '47.6329,-122.2800',
        onSubmit: this.submitMessage
      }),
      React.createElement('pre',
        null,
        this.state.forecast
      )
    );
  },

  submitMessage: function(message) {
    console.log("Submitting...");
    let xhr = new XMLHttpRequest();
    let url = '/message';
    // let body = message.body;
    // let params = 'body=' + encodeURIComponent(body).replace('%20', '+');
    let data = {
      from: message.from,
      plain: message.body
    };
    let text = JSON.stringify(data);
    xhr.open('POST', url, true);
    // xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        console.log("status = " + xhr.status);
        if (xhr.status === 200) {
          this.setState({
            forecast: xhr.responseText
          });
        }
      }
    }.bind(this);
    // xhr.send(params);
    xhr.send(text);
  }

});


window.addEventListener('load', function() {
  window.app = React.render(
    React.createElement(WeatherApp),
    document.querySelector('#app')
  );
});
