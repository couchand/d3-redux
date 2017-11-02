import storeLocal from './local';

export default function (selector, key) {
  return this.data(function () {
    var store = storeLocal.get(this);
    return selector.call(this, store.getState());
  }, key);
}
