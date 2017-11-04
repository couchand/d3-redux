import storeLocal from './local';

export default function (selector) {
  return this.datum(function () {
    var store = storeLocal.get(this);
    return selector.call(this, store.getState());
  });
}
