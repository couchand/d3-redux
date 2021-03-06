var tape = require('tape');
var jsdom = require('./jsdom');
var d3 = require('d3-selection');
require('d3-transition');

var me = require('../build/d3-redux.test');
var provide = me.reduxProvide;
var connect = me.reduxConnect;

testFor('selection', function(el) {
  return d3.select(el);
});

testFor('transition', function(el) {
  return d3.select(el).transition();
});

function testFor(name, factory) {
  tape(
    name + '.call(connect(function)) calls the specified function immediately',
    function(test) {
      var result;
      var store = {
        getState: function() {
          return 42;
        },
        subscribe: function() {}
      };
      var document = jsdom('<div/><div/><div/>');
      d3.select(document.body).call(provide(store));
      var selection = factory(document.body).selectAll('div');

      test.equal(
        selection.call(
          connect(function(sel) {
            result = sel;
          })
        ),
        selection
      );
      test.equal(result, selection);
      test.end();
    }
  );

  tape(
    name +
      '.call(connect(function, arguments…)) calls the specified function, passing additional arguments',
    function(test) {
      var result = [];
      var foo = {};
      var bar = {};
      var store = {
        getState: function() {
          return 42;
        },
        subscribe: function() {}
      };
      var document = jsdom('<div/><div/><div/>');
      d3.select(document.body).call(provide(store));
      var selection = factory(document.body).selectAll('div');

      test.equal(
        selection.call(
          connect(function(sel, a, b) {
            result.push(sel, a, b);
          }),
          foo,
          bar
        ),
        selection
      );
      test.deepEqual(result, [selection, foo, bar]);
      test.end();
    }
  );

  tape(name + '.call(connect(function)) subscribes to the store', function(
    test
  ) {
    var subscribers = [];
    var store = {
      getState: function() {
        return 42;
      },
      subscribe: function(subscriber) {
        subscribers.push(subscriber);
      }
    };
    var document = jsdom('<div/><div/><div/>');
    d3.select(document.body).call(provide(store));
    var selection = factory(document.body).selectAll('div');

    test.equal(selection.call(connect(function() {})), selection);
    test.equal(subscribers.length, 1);
    test.end();
  });

  tape(
    name +
      '.call(connect(function)) calls the specified function when the store updates',
    function(test) {
      var result;
      var state = 42;
      var subscribers = [];
      var store = {
        getState: function() {
          return state;
        },
        subscribe: function(subscriber) {
          subscribers.push(subscriber);
        }
      };
      var document = jsdom('<div/><div/><div/>');
      d3.select(document.body).call(provide(store));
      var selection = factory(document.body).selectAll('div');

      test.equal(
        selection.call(
          connect(function(sel) {
            result = sel;
          })
        ),
        selection
      );

      test.equal(subscribers.length, 1);
      var subscriber = subscribers[0];

      test.equal(result, selection);
      result = null;
      state = 43;

      subscriber();

      test.equal(result, selection);

      test.end();
    }
  );

  tape(
    name +
      '.call(connect(function)) does not call the specified function if the subscriber is called without a change',
    function(test) {
      var result;
      var subscribers = [];
      var store = {
        getState: function() {
          return 42;
        },
        subscribe: function(subscriber) {
          subscribers.push(subscriber);
        }
      };
      var document = jsdom('<div/><div/><div/>');
      d3.select(document.body).call(provide(store));
      var selection = factory(document.body).selectAll('div');

      test.equal(
        selection.call(
          connect(function(sel) {
            result = sel;
          })
        ),
        selection
      );

      test.equal(subscribers.length, 1);
      var subscriber = subscribers[0];

      test.equal(result, selection);
      result = null;

      subscriber();

      test.equal(result, null);

      test.end();
    }
  );

  tape(
    name +
      '.call(connect(function)) for selections with multiple stores subscribes to each',
    function(test) {
      var subscribersA = [];
      var storeA = {
        getState: function() {
          return 42;
        },
        subscribe: function(subscriber) {
          subscribersA.push(subscriber);
        }
      };
      var subscribersB = [];
      var storeB = {
        getState: function() {
          return 42;
        },
        subscribe: function(subscriber) {
          subscribersB.push(subscriber);
        }
      };
      var document = jsdom(
        '<div id="a"><a/><a/><a/></div><div id="b"><a/><a/><a/></div>'
      );
      d3
        .select(document.body)
        .select('#a')
        .call(provide(storeA));
      d3
        .select(document.body)
        .select('#b')
        .call(provide(storeB));
      var selection = factory(document.body)
        .selectAll('div')
        .selectAll('a');

      test.equal(selection.call(connect(function() {})), selection);
      test.equal(subscribersA.length, 1);
      test.equal(subscribersB.length, 1);
      test.end();
    }
  );

  tape(
    name +
      '.call(connect(function)) for selections with multiple stores calls the function exactly once immediately',
    function(test) {
      var results = [];
      var storeA = {
        getState: function() {
          return 42;
        },
        subscribe: function() {}
      };
      var storeB = {
        getState: function() {
          return 42;
        },
        subscribe: function() {}
      };
      var document = jsdom(
        '<div id="a"><a/><a/><a/></div><div id="b"><a/><a/><a/></div>'
      );
      d3
        .select(document.body)
        .select('#a')
        .call(provide(storeA));
      d3
        .select(document.body)
        .select('#b')
        .call(provide(storeB));
      var selection = factory(document.body)
        .selectAll('div')
        .selectAll('a');

      test.equal(
        selection.call(
          connect(function(sel) {
            results.push(sel);
          })
        ),
        selection
      );
      test.deepEqual(results, [selection]);
      test.end();
    }
  );
}
