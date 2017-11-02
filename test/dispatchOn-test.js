var tape = require('tape');
var jsdom = require('./jsdom');
var d3 = require('d3-selection');

require('../');

tape('selection.dispatchOn(type, listener) dispatches on event', function(test) {
  var document = jsdom('<div></div>');
  var div = document.querySelector('div');
  var actions = [];
  var store = {
    dispatch: function (action) { actions.push(action);}
  };
  var sel = d3.select(document.body)
    .provide(store)
    .select('div')
    .dispatchOn('click', function () { return 42; });
  sel.dispatch('click');

  test.deepEqual(actions, [42]);
  test.end();
});

tape('selection.dispatchOn(type, listener, capture) passes along the capture flag', function (test) {
  var result;
  var sel = d3.select({
    addEventListener: function(type, listener, capture) { result = capture; }
  });
  test.equal(sel.dispatchOn("click", function() {}, true), sel);
  test.equal(result, true);
  test.end();
});

tape('selection.dispatchOn(type, listener) passes the listener data, index and group', function(test) {
  var document = jsdom('<parent id="one"><child id="three"></child><child id="four"></child></parent><parent id="two"><child id="five"></child></parent>'),
    one = document.querySelector('#one'),
    two = document.querySelector('#two'),
    three = document.querySelector('#three'),
    four = document.querySelector('#four'),
    five = document.querySelector('#five'),
    results = [];

  var selection = d3.selectAll([one, two])
    .provide({ dispatch: function () {} })
    .datum(function(d, i) { return 'parent-' + i; })
    .selectAll('child')
    .data(function(d, i) { return [0, 1].map(function(j) { return 'child-' + i + '-' + j; }); })
    .dispatchOn('foo', function(d, i, nodes) { results.push([this, d, i, nodes]); });

  test.deepEqual(results, []);
  selection.dispatch('foo');
  test.deepEqual(results, [
    [three, 'child-0-0', 0, [three, four]],
    [four, 'child-0-1', 1, [three, four]],
    [five, 'child-1-0', 0, [five, ]]
  ]);
  test.end();
});
