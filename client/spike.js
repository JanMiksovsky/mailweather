var Greet = React.createClass({

  displayName: 'Greet',

  render: function() {
    return (
      React.createElement('div', { className: 'test' },
        "Hello, world?"
      )
    );
  }

});

window.addEventListener('load', function() {
  React.render(
    React.createElement(Greet, null),
    document.querySelector('#greet')
  );
});
