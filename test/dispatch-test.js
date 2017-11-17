var tape = require('tape');
var jsdom = require('./jsdom');
var d3 = require('d3-selection');
require('d3-transition');

var me = require('../build/d3-redux.test');
var provide = me.reduxProvide;
var dispatch = me.reduxDispatch;

tape(
  'selection.on(type, dispatch(actionCreator)) dispatches on event',
  function(test) {
    var document = jsdom('<div></div>');
    var div = document.querySelector('div');
    var actions = [];
    var sel = d3
      .select(document.body)
      .call(
        provide({
          dispatch: function(action) {
            actions.push(action);
          }
        })
      )
      .select('div')
      .on(
        'click',
        dispatch(function() {
          return 42;
        })
      );

    sel.dispatch('click');

    test.deepEqual(actions, [42]);
    test.end();
  }
);

tape(
  'selection.on(type, dispatch(actionCreator) passes the actionCreator data, index and group',
  function(test) {
    var document = jsdom(
      '<parent id="one"><child id="three"></child><child id="four"></child></parent><parent id="two"><child id="five"></child></parent>'
    );
    var one = document.querySelector('#one');
    var two = document.querySelector('#two');
    var three = document.querySelector('#three');
    var four = document.querySelector('#four');
    var five = document.querySelector('#five');
    var results = [];
    var selection = d3
      .selectAll([one, two])
      .call(provide({ dispatch: function() {} }))
      .datum(function(d, i) {
        return 'parent-' + i;
      })
      .selectAll('child')
      .data(function(d, i) {
        return [0, 1].map(function(j) {
          return 'child-' + i + '-' + j;
        });
      })
      .on(
        'foo',
        dispatch(function(d, i, nodes) {
          results.push([this, d, i, nodes]);
        })
      );
    test.deepEqual(results, []);

    selection.dispatch('foo');

    test.deepEqual(results, [
      [three, 'child-0-0', 0, [three, four]],
      [four, 'child-0-1', 1, [three, four]],
      [five, 'child-1-0', 0, [five]]
    ]);
    test.end();
  }
);

tape(
  'transition.on(type, dispatch(actionCreator)) dispatches on event',
  function(test) {
    var document = jsdom();
    var actions = [];
    var sel = d3
      .select(document.body)
      .call(
        provide({
          dispatch: function(action) {
            actions.push(action);
          }
        })
      )
      .transition()
      .duration(10)
      .on(
        'start',
        dispatch(function() {
          return 42;
        })
      )
      .on('end', ended);

    function ended() {
      test.deepEqual(actions, [42]);
      test.end();
    }
  }
);
