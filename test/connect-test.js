var tape = require('tape');
var jsdom = require('./jsdom');
var d3 = require('d3-selection');

var me = require('../');
var provide = me.reduxProvide;
var connect = me.reduxConnect;

tape('selection.connect(function) calls the specified function immediately', function (test) {
  var result;
  var store = {
    getState: function () { return 42; },
    subscribe: function () {}
  };
  var document = jsdom('<div/><div/><div/>');
  var selection = d3.select(document.body)
    .call(provide(store))
    .selectAll('div');

  test.equal(selection.call(connect(function(sel) { result = sel; })), selection);
  test.equal(result, selection);
  test.end();
});

tape('selection.connect(function, arguments…) calls the specified function, passing additional arguments', function (test) {
  var result = [];
  var foo = {};
  var bar = {};
  var store = {
    getState: function () { return 42; },
    subscribe: function () {}
  };
  var document = jsdom('<div/><div/><div/>');
  var selection = d3.select(document.body)
    .call(provide(store))
    .selectAll('div');

  test.equal(selection.call(connect(function (sel, a, b) { result.push(sel, a, b); }), foo, bar), selection);
  test.deepEqual(result, [selection, foo, bar]);
  test.end();
});

tape('selection.connect(function) subscribes to the store', function (test) {
  var subscribers = [];
  var store = {
    getState: function () { return 42; },
    subscribe: function (subscriber) { subscribers.push(subscriber); }
  };
  var document = jsdom('<div/><div/><div/>');
  var selection = d3.select(document.body)
    .call(provide(store))
    .selectAll('div');

  test.equal(selection.call(connect(function () {})), selection);
  test.equal(subscribers.length, 1);
  test.end();
});

tape('selection.connect(function) calls the specified function when the store updates', function (test) {
  var result;
  var state = 42;
  var subscribers = [];
  var store = {
    getState: function () { return state; },
    subscribe: function (subscriber) { subscribers.push(subscriber); }
  };
  var document = jsdom('<div/><div/><div/>');
  var selection = d3.select(document.body)
    .call(provide(store))
    .selectAll('div');

  test.equal(selection.call(connect(function (sel) { result = sel; })), selection);

  test.equal(subscribers.length, 1);
  var subscriber = subscribers[0];

  test.equal(result, selection);
  result = null;
  state = 43;

  subscriber();

  test.equal(result, selection);

  test.end();
});

tape('selection.connect(function) does not call the specified function if the subscriber is called without a change', function (test) {
  var result;
  var subscribers = [];
  var store = {
    getState: function () { return 42; },
    subscribe: function (subscriber) { subscribers.push(subscriber); }
  };
  var document = jsdom('<div/><div/><div/>');
  var selection = d3.select(document.body)
    .call(provide(store))
    .selectAll('div');

  test.equal(selection.call(connect(function (sel) { result = sel; })), selection);

  test.equal(subscribers.length, 1);
  var subscriber = subscribers[0];

  test.equal(result, selection);
  result = null;

  subscriber();

  test.equal(result, null);

  test.end();
});

tape('selection.connect(function) for selections with multiple stores subscribes to each', function (test) {
  var subscribersA = [];
  var storeA = {
    getState: function () { return 42; },
    subscribe: function (subscriber) { subscribersA.push(subscriber); }
  };
  var subscribersB = [];
  var storeB = {
    getState: function () { return 42; },
    subscribe: function (subscriber) { subscribersB.push(subscriber); }
  };
  var document = jsdom('<div id="a"><a/><a/><a/></div><div id="b"><a/><a/><a/></div>');
  d3.select(document.body)
    .select("#a")
    .call(provide(storeA));
  d3.select(document.body)
    .select("#b")
    .call(provide(storeB));
  var selection = d3.select(document.body)
    .selectAll('div')
    .selectAll('a');

  test.equal(selection.call(connect(function () {})), selection);
  test.equal(subscribersA.length, 1);
  test.equal(subscribersB.length, 1);
  test.end();
});

tape('selection.connect(function) for selections with multiple stores calls the function exactly once immediately', function (test) {
  var results = [];
  var storeA = {
    getState: function () { return 42; },
    subscribe: function () {}
  };
  var storeB = {
    getState: function () { return 42; },
    subscribe: function () {}
  };
  var document = jsdom('<div id="a"><a/><a/><a/></div><div id="b"><a/><a/><a/></div>');
  d3.select(document.body)
    .select("#a")
    .call(provide(storeA));
  d3.select(document.body)
    .select("#b")
    .call(provide(storeB));
  var selection = d3.select(document.body)
    .selectAll('div')
    .selectAll('a');

  test.equal(selection.call(connect(function (sel) { results.push(sel); })), selection);
  test.deepEqual(results, [selection]);
  test.end();
});
