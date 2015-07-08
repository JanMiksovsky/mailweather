var MessageForm = React.createClass({

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
    var message = {
      from: this.refs.from.getDOMNode().value,
      body: this.refs.body.getDOMNode().value
    };
    this.props.onSubmit(message);
  }

});


var WeatherApp = React.createClass({

  displayName: 'WeatherApp',

  render: function() {
    return React.createElement(MessageForm, {
      from: 'jan@miksovsky.com',
      body: '47.6329,-122.2800',
      onSubmit: this.submitMessage
    });
  },

  submitMessage: function(message) {
    console.log(JSON.stringify(message, null, 2));
  }

});


window.addEventListener('load', function() {
  window.app = React.render(
    React.createElement(WeatherApp),
    document.querySelector('#app')
  );
});
