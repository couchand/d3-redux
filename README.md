# d3-redux

[Redux](https://github.com/reactjs/redux) offers a simple yet powerful
state management solution, but it's not immediately obvious how to
idiomatically make use of it from a complex [D3](https://d3js.org/)
application.  With a few judicious extensions to d3-selection,
*d3-redux* makes wiring up state changes simple and easy, the D3 way.

Provide the Redux store at the root of your application:

```js
const initialState = {
  todos: [
    { id: 1, title: "Write amazing code", completed: false }
  ]
};
const store = Redux.createStore(rootReducer, initialState);

const app = d3.select("#app")
  .provide(store);
```

Then in some nested component make use of the store's state, just as
you would any other data join:

```js
let todos = main.select("ul")
  .selectAll("li")
  .dataFromState(state => state.todos);

todos = todos.enter()
  .append("li")
  .merge(todos);
```

Finally, attach handlers that will dispatch actions back to the store:

```js
const destroyTodo = id => ({ type: "DESTROY", payload: { id } });

trashCan.dispatchOn("click", d => destroyTodo(d.id));
```

## Installing

If you use NPM, `npm install d3-redux`. Otherwise, download the
[latest release](https://github.com/couchand/d3-redux/releases/latest).

## API Reference

All methods return the current selection, to facilitate D3's idiomatic
method chaining style.

<a href="#selection_provide" name="selection_provide">#</a> <i>selection</i>.<b>provide</b>(<i>store</i>)

Provides the Redux *store* to nested components.

<a href="#selection_dataFromState" name="selection_dataFromState">#</a> <i>selection</i>.<b>dataFromState</b>(<i>selector</i>[, <i>key</i>])

Calls the *selector*, passing in the current state from the previously-
provided store, and forwards the result (as well as the *key*, if
provided) to [`selection.data()`](https://github.com/d3/d3-selection#selection_data).
Computes a data join.  _Note:_ this is a "selector" in the Redux and 
[reselect](https://github.com/reactjs/reselect) sense, not in the D3
one - it is a unary function of the store's state.

<a href="#selection_datumFromState" name="selection_datumFromState">#</a> <i>selection</i>.<b>datumFromState</b>(<i>selector</i>)

Calls the *selector*, passing in the current state from the previously-
provided store, and forwards the result to
[`selection.datum()`](https://github.com/d3/d3-selection#selection_datum).
Does not computes a data join.  _Note:_ this is a "selector" in the
Redux and [reselect](https://github.com/reactjs/reselect) sense, not
in the D3 one - it is a unary function of the store's state.

<a href="#selection_dispatchOn" name="selection_dispatchOn">#</a> <i>selection</i>.<b>dispatchOn</b>(<i>typenames</i>, <i>actionCreator</i>[, <i>capture</i>])

Attaches an event listener for the given *typenames* using
[`selection.on()`](https://github.com/d3/d3-selection#selection_on).
The return value of *actionCreator* is forwarded on to dispatch from
the previously-provided store.
