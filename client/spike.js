var Greet = React.createClass({

  displayName: 'Greet',

  render: function() {
    return (
      React.createElement('div', { className: 'test' },
        "Hello, " + this.props.message + "."
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
