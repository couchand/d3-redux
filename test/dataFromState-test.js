var tape = require('tape');
var jsdom = require('./jsdom');
var d3 = require('d3-selection');

require('../');

function storeOf(state) {
  return {
    getState: function () { return state; }
  };
}

tape('selection.dataFromState(selector) gets state from the provided store', function (test) {
  var state = { foo: [0, 1, 2] };
  var document = jsdom('');
  var sel = d3.select(document.body)
    .provide(storeOf(state))
    .selectAll('div')
    .dataFromState(function (d) { return d.foo; })
    .enter().append('div');
  test.equal(sel.size(), state.foo.length);
  sel.each(function (d, i) { test.equal(d, i) });
  test.end();
});

tape('selection.dataFromState(selector) calls the selector in the context of the selected element', function (test) {
  var me;
  var document = jsdom('<div></div>');
  var el = document.querySelector('div');
  d3.select(el)
    .provide(storeOf([]))
    .selectAll('.child')
    .dataFromState(function () { me = this; return []; });
  test.equal(me, el);
  test.end();
});

tape('selection.data(selector, key) joins data to element using the computed keys', function(test) {
  var body = jsdom('<node id="one"></node><node id="two"></node><node id="three"></node>').body,
    one = body.querySelector('#one'),
    two = body.querySelector('#two'),
    three = body.querySelector('#three'),
    selection = d3.select(body)
      .provide(storeOf({}))
      .selectAll('node')
      .dataFromState(function () { return ['one', 'four', 'three']; }, function(d) { return d || this.id; });
  test.deepEqual(selection, {
    _groups: [[one,, three]],
    _parents: [body],
    _enter: [[, {
      __data__: 'four',
      _next: three,
      _parent: body,
      namespaceURI: 'http://www.w3.org/1999/xhtml',
      ownerDocument: body.ownerDocument
    }, ]],
    _exit: [[, two, ]]
  });
  test.end();
});
