import storeLocal from './local';

export default function(selector) {
  return function(d, i, g) {
    var store = storeLocal.get(this);
    return selector.call(this, store.getState(), d, i, g);
  };
}
