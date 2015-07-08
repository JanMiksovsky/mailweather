var Greet = React.createClass({

  displayName: 'Greet',

  getInitialState: function() {
    return {
      punctuation: '.'
    };
  },

  render: function() {
    return (
      React.createElement('div', { className: 'test' },
        "Hello, ",
        this.props.message,
        this.state.punctuation
      )
    );
  }

});

window.addEventListener('load', function() {
  window.greet = React.render(
    React.createElement(Greet, {
      message: 'world'
    }),
    document.querySelector('#greet')
  );
});
