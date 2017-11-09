export default function(store, callback, args) {
  var currentState = store.getState();
  function handleUpdate() {
    var nextState = store.getState();
    if (nextState != currentState) {
      currentState = nextState;
      callback.apply(null, args);
    }
  }

  store.subscribe(handleUpdate);
}
