import storeLocal from './local';

export default function (selector) {
  return function () {
    var store = storeLocal.get(this);
    return selector.call(this, store.getState());
  };
}
