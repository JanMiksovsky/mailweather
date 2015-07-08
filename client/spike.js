var Greet = React.createClass({

  displayName: 'Greet',

  render: function() {
    return (
      React.createElement('div', { className: 'test' },
        "Hello, ",
        this.props.message,
        this.props.punctuation
      )
    );
  }

});


var MessageForm = React.createClass({

  displayName: 'MessageForm',

  render: function() {
    return React.createElement(
      'form',
      {
        action: '/message',
        method: 'POST'
      },
      React.createElement(
        'p',
        null,
        "From: ",
        React.createElement('input', {
          id: 'from',
          type: 'text',
          name: 'from',
          value: this.props.from
        })
      ),
      React.createElement(
        'textarea',
        {
          type: 'text',
          name: 'plain'
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
  }

});


var WeatherApp = React.createClass({

  displayName: 'WeatherApp',

  getInitialState: function() {
    return {
      from: 'jan@miksovsky.com',
      body: '47.6329,-122.2800'
    };
  },

  render: function() {
    return React.createElement(MessageForm, {
      from: this.state.from,
      body: this.state.body
    });
  }

});


window.addEventListener('load', function() {
  window.app = React.render(
    React.createElement(WeatherApp),
    document.querySelector('#app')
  );
});
