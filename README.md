# d3-redux

Idiomatic D3.js bindings for Redux.

[![Build Status](https://travis-ci.org/couchand/d3-redux.svg?branch=master)](https://travis-ci.org/couchand/d3-redux) [![license: MIT License](https://img.shields.io/github/license/couchand/d3-redux.svg)](https://github.com/couchand/d3-redux/blob/master/LICENSE) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)

[Redux](https://github.com/reactjs/redux) offers a simple yet powerful
state management solution, but it's not immediately obvious how to
idiomatically make use of it from a complex [D3](https://d3js.org/)
application.  With a few judicious extensions to d3-selection,
**d3-redux** makes wiring up state changes simple and easy, the D3 way.

Provide the Redux store at the root of your application:

```js
const initialState = {
  todos: [
    { id: 1, title: "Write amazing code", completed: false }
  ]
};
const store = Redux.createStore(rootReducer, initialState);

const app = d3.select("#app")
  .call(d3.reduxProvide(store));
```

Then in some nested component make use of the store's state, just as
you would any other data join:

```js
let todos = main.select("ul")
  .selectAll("li")
  .data(d3.reduxFromState(state => state.todos));

todos = todos.enter()
  .append("li")
  .merge(todos);
```

Finally, attach handlers that will dispatch actions back to the store:

```js
const destroyTodo = ({ id }) => ({ type: "DESTROY", payload: { id } });

trashCan.on("click", d3.reduxDispatch(destroyTodo));
```

## Table of Contents

- [Installing](#installing)
- [Getting Started](#getting-started)
  - [Coming from Redux](#coming-from-redux)
  - [Coming from D3](#coming-from-d3)
- [Usage Notes](#usage-notes)
- [API Reference](#api-reference)
  - [d3.reduxProvide](#reduxProvide)
  - [d3.reduxConnect](#reduxConnect)
  - [d3.reduxFromState](#reduxFromState)
  - [d3.reduxDispatch](#reduxDispatch)

## Installing

If you use NPM, `npm install d3-redux`. Otherwise, download the
[latest release](https://github.com/couchand/d3-redux/releases/latest).

## Getting Started

The introduction above should give you a quick sense for how to make
use of **d3-redux** in your projects, but now we'll dive into a more
complete guide to getting started.  The first step is of course to
install **d3-redux** in your project, see the above [steps on installing](#installing).

The rest of this guide is split into two sections.  If you've used
Redux before but you're new to D3, read the [first](#coming-from-redux)
section.  On the other hand, if you're more familiar with D3, read the
[second](#coming-from-d3).  If you're new to both, you'll want to
first read [an introduction to D3](https://d3js.org/#introduction) and
[an introduction to Redux](http://redux.js.org/#the-gist).

For a complete (simple) application written with **d3-redux**, see
[TodoMVC - D3 - Redux](https://github.com/couchand/todomvc-d3-redux),
from which this library was extracted.

### Coming from Redux

This guide uses terms from the [react-redux](https://github.com/reactjs/react-redux)
bindings, because they're the most common.  Since many other bindings
use similar descriptions, hopefully everything will be clear.

The basic currency of D3-based code is the "selection", a group of
nodes paired with some data that we intend to render into them.  Most
of the time we'll get a selection from one we already have by treating
the existing selection as a parent and selecting deeper into it with
the methods `select` or `selectAll`.  You can think of this, generally,
as a way to create, update, or remove child nodes.

To get started with the top-level selection, we just pass a DOM node or
(more commonly) a DOM selector to `d3.select` or `d3.selectAll`.  For
example, given the initial page:

```html
<html>
  <body>
    <div id="my-app" />
  </body>
</html>
```

We can obtain a selection on the `div` element with the call:

```js
const myApp = d3.select("#my-app");
```

Now, let's say we've previously created for ourselves a Redux store.
We can use that in our D3 app the same way we would in a React app.  In
react-redux we would wrap our app in a `<Provider />`.  With **d3-redux**
we can also "provide" it to child nodes:

```js
myApp.call(d3.reduxProvide(store));
```

Idiomatic D3 code relies heavily on method chaining (it uses a "fluent"
interface), so unless a method returns a new selection, it will usually
return the current one.  That means we can do the above in one go:

```js
const myApp = d3.select("#my-app")
  .call(d3.reduxProvide(store));
```

We'll go ahead and create a list in our app:

```js
const todoList = myApp.append("ul");
```

Manually adding elements to the page like this is worse than death, but
fortunately most D3 code is much more powerful.  The selection object
really takes off when we incorporate the "data-join", which allows us
to pair data with DOM elements.  This is similar to how React will
diff a virtual DOM against the real one, except for two big things:
with D3 we're diffing abstract data against the DOM, and D3 gives us
the power to separately handle the cases of creating, updating, and
removing nodes.

Let's see what that looks like on our todo list with vanilla D3:

```js
// Compute the data-join.
const todoJoin = todoList.selectAll("li")
  .data([
    { id: 1, title: "Learn Redux", completed: true },
    { id: 2, title: "Leard D3", completed: false }
  ]);

// Handle the new nodes that we need to create.
const todoEnter = todoJoin.enter()
  .append("li");

todoEnter.append("input")
  .attr("class", "edit")
  .attr("type", "text");

// Handle the old nodes that we need to remove.
todoJoin.exit()
  .remove();

// Merge the new nodes with the existing ones to update them all.
const todos = todoEnter.merge(todoJoin);

// Update the text input within each todo:
todos.select(".edit")
  .property("value", d => d.title);
```

But we'd really like to get the list of todos from the store, rather
than passing them in explicitly -- we'd like to "connect" it.  In this
case we're not doing a full connect, we're basically just doing the
`mapStateToProps` part of it.  With **d3-redux** it's called
`dataFromState`.  So, if our state has a key `todos` that has our list
on it, we can make a simple change to the above code:

```diff
 // Compute the data-join.
 const todoJoin = todoList.selectAll("li")
-  .data([
-    { title: "Learn Redux", completed: true },
-    { title: "Leard D3", completed: false }
-  ]);
+  .data(d3.reduxFromState(state => state.todos));
```

Of course, for a complete Redux application we also need to be able to
dispatch actions.  With react-redux we'd do that with
`mapDispatchToProps`; in **d3-redux** the method is `dispatchOn`.
Assuming we have an action creator called `updateTodo`, we can modify
our todo creation to attach a handler that dispatches that action:

```diff
 todoEnter.append("input")
   .attr("class", "edit")
-  .attr("type", "text");
+  .attr("type", "text")
+  .on("change", d3.reduxDispatch(d => updateTodo(d.id, this.value)));
```

Now we've handled the initial render, but how do we respond to state
updates?  We could manually subscribe to the store, starting again at
the top each time.  But we'd really like to use the third feature of
connect, the automatic subscription.

Just as with connect from react-redux, we first make a component.  In
D3, we make a component by wrapping some code in a function that takes
the selection as the only paramter, and then use the method `call`:

```diff
-const todoList = myApp.append("ul");
+myApp.append("ul")
+  .call(function (todoList) {
+    // data join code here...
+  });
```

Using **d3-redux**, we can wrap the call in connect, and our component
will update any time the state changes:

```diff
 myApp.append("ul")
-  .call(function (todoList) {
+  .call(d3.reduxConnect(function (todoList) {
     // data join code here...
    }));
```

That's it!  We've built the D3 side of a simple **d3-redux** app.

### Coming from D3

Redux is a state management library.  We can use it to keep track of
our application state and handle making changes to that state, and as
our app grows in complexity we won't have the rats nest of references
that you might find if we were managing state directly.

The core of a Redux app is the "store".  The store holds on to the
state.  When we'd like to make a change, we dispatch an action, which
is just an object, which conventionally has the shape:

```js
{
  type: "MY_ACTION_TYPE",
  payload: {
    data: "that the action needs"
  }
}
```

To teach the store how to convert an action into changes to our state,
we initialize it with a reducer, which is a just a function from the
previous state and action to the new state.  A simple reducer might
look like:

```js
function todosReducer (state = [], action) {
  switch (action.type) {
    case "ADD_TODO":
      return state.concat(action.payload);
  }

  return state;
}
```

The default value tells Redux what to use as the initial state.
Conventionally, we put the sub-state managed by this reducer at a
specific key (in a real app, combined with other reducers) with:

```js
const rootReducer = Redux.combineReducers({
  todos: todosReducer
});
```

We can now use this reducer to create a store:

```js
const store = Redux.createStore(rootReducer);
```

And then we can get the current state from the store by asking for it:

```js
const state = store.getState(); // { todos: [] }
```

If we try to dispatch our action to add a todo, we can see the change:

```js
store.dispatch({
  type: "ADD_TODO",
  payload: {
    id: 1,
    title: "Learn Redux",
    completed: false
  }
});

const state = store.getState(); // { todos: [{ id, title, completed }] }
```

Great.  Now let's see how we can use **d3-redux** to use D3 to render the
todos in our Redux store.  First we need to (as always) create a new D3
selection, and we'll use the method `provide` to bind the store to it:

```js
const app = d3.select("#my-app")
  .call(d3.reduxProvide(store));

const todoList = app.append("ul");
```

Now, instead of manually binding our todo list in the call to `data`,
we'll use `fromStore` to grab the todos from the right place:

```js
const todoJoin = todoList.selectAll("li")
  .data(d3.reduxFromStore(store => store.todos));

const todoEnter = todoJoin.enter()
  .append("li");

todoEnter.append("input")
  .attr("type", "text")
  .attr("class", "edit");

const todos = todoEnter.merge(todoJoin);

todos.select(".edit")
  .property("value", d => d.title);
```

The last step is dispatching actions in response to user interaction.
Instead of just using `on`, we'll wrap the handler with `dispatch`,
which automatically dispatches the result to the provided store:

```diff
 todoEnter.append("input")
   .attr("class", "edit")
-  .attr("type", "text");
+  .attr("type", "text")
+  .on("change", d3.reduxDispatch(function (d) {
+    return {
+      type: "UPDATE_TODO",
+      payload: {
+        id: d.id,
+        title: this.value
+      }
+    };
+  }));
```

Now, assuming our reducer can handle this action type appropriately,
we're good to go.

Now to the matter of calling in to our D3 code when the Redux state
updates.  A store offers the method `subscribe`, which allows us to
listen for updates and respond to them.  We could just subscribe with
our whole application, but there's a better way.  Much the same as
`call` allows us to encapsulate a component's D3 logic, **d3-redux**
has a method `connect`, which we wrap our component in before the call,
and it will automatically rerender when the state changes.

If we first encapsulated the todo data join in a `call`, like this:

```diff
-const todoList = myApp.append("ul");
+myApp.append("ul")
+  .call(function (todoList) {
+    // data join code here...
+  });
```

Using connect to update on state change would just require:

```diff
 myApp.append("ul")
-  .call(function (todoList) {
+  .call(d3.reduxConnect(function (todoList) {
     // data join code here...
    }));
```

One final note: the method `fromState` can be used not just for calls
to `data`, but also for `datum`.  Remember that this just sets the
current node's datum without computing a data join.

## Usage Notes

You may find your code easier to read if you alias the methods on
import like this:

```
import {
  reduxProvide as provide,
  reduxConnect as connect,
  reduxFromState as fromState,
  reduxDispatch as dispatch
} from "d3-redux";
```

Then, combined with judicious naming of selectors and action creators,
you can write code like this:

```
d3.select(element)
  .call(provide(store))
  .call(connect(function (el) {
    el.data(fromState(selectTodoList));
    // ...
    trash.on("click", dispatch(deleteTodo));
  }));
```

## API Reference

All methods return the current selection, to facilitate D3's idiomatic
method chaining style.

<a href="#reduxProvide" name="reduxProvide">#</a> d3.<b>reduxProvide</b>(<i>store</i>) <a href="https://github.com/couchand/d3-redux/blob/master/src/provide.js">&lt;&gt;</a>

Use with *selection*.call:

```
d3.select(document.body)
  .call(provide(store));
```

Provides the Redux *store* to the nodes in this selection as well as
any nested nodes.  You can then implicitly access the state and
dispatch of the provided store through the various other methods.

<a href="#reduxConnect" name="reduxConnect">#</a> d3.<b>reduxConnect</b>(<i>function</i>) <a href="https://github.com/couchand/d3-redux/blob/master/src/connect.js">&lt;&gt;</a>

Use with *selection*.call:

```
d3.select("svg")
  .call(connect(myCoolChart));
```

Calls the *function*, passing in the current selection.  A call is made
immediately, and the selection subscribes to the store, calling the
function again any time the state changes.  This is analogous to a
vanilla use of [*selection*.call](https://github.com/d3/d3-selection#selection_call),
but adding a subscription to the provided store.

<a href="#reduxFromState" name="reduxFromState">#</a> d3.<b>reduxFromState</b>(<i>selector</i>) <a href="https://github.com/couchand/d3-redux/blob/master/src/fromState.js">&lt;&gt;</a>

Use with *selection*.data or *selection*.datum:

```
d3.select(".user")
  .datum(fromState(user))

d3.selectAll("li")
  .data(fromState(todoItems));
```

Calls the *selector*, passing in the current state from the provided
store, and returns the result, to be used by the enclosing call to
[*selection*.data](https://github.com/d3/d3-selection#selection_data) or
[*selection*.datum](https://github.com/d3/d3-selection#selection_datum).
The *selector* is passed the current state as the only parameter, with
the `this` context set to the current node.

_Note:_ the parameter is a "selector" in the Redux and
[reselect](https://github.com/reactjs/reselect) sense, not in the D3
and DOM sense - it is simply a unary function of the store's state.

<a href="#reduxDispatch" name="reduxDispatch">#</a> d3.<b>reduxDispatch</b>(<i>actionCreator</i>) <a href="https://github.com/couchand/d3-redux/blob/master/src/dispatch.js">&lt;&gt;</a>

Wraps an *actionCreator* into an event listener to be passed on to the
enclosing call to [*selection*.on](https://github.com/d3/d3-selection#selection_on).
The *actionCreator* is called in the same way that a handler passed to
`on` would be: it gets the current datum, index, and all the groups,
and the `this` context is set to the current element.  If the return
value of *actionCreator* is truthy, it is forwarded to the dispatch
method of the provided store.

##### ╭╮☲☲☲╭╮ #####
