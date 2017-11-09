var tape = require('tape');
var jsdom = require('./jsdom');
var d3 = require('d3-selection');

var me = require('../build/d3-redux.test');
var provide = me.reduxProvide;
var fromState = me.reduxFromState;

function storeOf(state) {
  return {
    getState: function() {
      return state;
    }
  };
}

tape(
  'selection.data(fromState(selector)) gets state from the provided store',
  function(test) {
    var state = { foo: [0, 1, 2] };
    var document = jsdom('');
    var sel = d3
      .select(document.body)
      .call(provide(storeOf(state)))
      .selectAll('div')
      .data(
        fromState(function(d) {
          return d.foo;
        })
      )
      .enter()
      .append('div');
    test.equal(sel.size(), state.foo.length);
    sel.each(function(d, i) {
      test.equal(d, i);
    });
    test.end();
  }
);

tape(
  'selection.data(fromState(selector)) calls the selector in the context of the selected element',
  function(test) {
    var result;
    var document = jsdom('<div></div>');
    var el = document.querySelector('div');
    d3
      .select(el)
      .call(provide(storeOf([])))
      .selectAll('.child')
      .data(
        fromState(function() {
          result = this;
          return [];
        })
      );
    test.equal(result, el);
    test.end();
  }
);

tape(
  'selection.datum(fromState(selector)) gets state from the provided store',
  function(test) {
    var state = { foo: {} };
    var document = jsdom('<div></div>');
    var sel = d3
      .select(document.body)
      .call(provide(storeOf(state)))
      .select('div')
      .datum(
        fromState(function(d) {
          return d.foo;
        })
      );
    test.equal(sel.datum(), state.foo);
    test.end();
  }
);

tape(
  'selection.datum(fromState(selector)) calls the selector in the context of the selected element',
  function(test) {
    var result;
    var document = jsdom('<div></div>');
    var el = document.querySelector('div');
    d3
      .select(document.body)
      .call(provide(storeOf({})))
      .select('div')
      .datum(
        fromState(function() {
          result = this;
        })
      );
    test.equal(result, el);
    test.end();
  }
);
