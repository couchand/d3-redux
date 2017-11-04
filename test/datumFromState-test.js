var tape = require('tape');
var jsdom = require('./jsdom');
var d3 = require('d3-selection');

var me = require('../');

function storeOf(state) {
  return {
    getState: function () { return state; }
  };
}

tape('selection.datumFromState(selector) gets state from the provided store', function (test) {
  var state = { foo: {} };
  var document = jsdom('<div></div>');
  var sel = d3.select(document.body)
    .call(me.provide(storeOf(state)))
    .select('div')
    .datum(me.fromState(function (d) { return d.foo; }));
  test.equal(sel.datum(), state.foo);
  test.end();
});

tape('selection.datumFromState(selector) calls the selector in the context of the selected element', function (test) {
  var result;
  var document = jsdom('<div></div>');
  var el = document.querySelector('div');
  d3.select(document.body)
    .call(me.provide(storeOf({})))
    .select('div')
    .datum(me.fromState(function () { result = this; }));
  test.equal(result, el);
  test.end();
});
