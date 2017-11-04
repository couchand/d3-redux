import storeLocal from './local';

export default function (handler) {
  return function (d, i, g) {
    var action = handler.call(this, d, i, g);
    if (action) {
      var store = storeLocal.get(this);
      store.dispatch(action);
    }
  };
}
