var tape = require('tape');
var jsdom = require('./jsdom');
var d3 = require('d3-selection');

require('../');

function storeOf(state) {
  return {
    getState: function () { return state; }
  };
}

tape('selection.datumFromState(selector) gets state from the provided store', function (test) {
  var state = { foo: {} };
  var document = jsdom('<div></div>');
  var sel = d3.select(document.body)
    .provide(storeOf(state))
    .select('div')
    .datumFromState(function (d) { return d.foo; });
  test.equal(sel.datum(), state.foo);
  test.end();
});

tape('selection.datumFromState(selector) calls the selector in the context of the selected element', function (test) {
  var me;
  var document = jsdom('<div></div>');
  var el = document.querySelector('div');
  d3.select(document.body)
    .provide(storeOf({}))
    .select('div')
    .datumFromState(function () { me = this; });
  test.equal(me, el);
  test.end();
});
