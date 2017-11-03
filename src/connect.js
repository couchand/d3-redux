import storeLocal from './local';
import subscribe from './subscribe';

export default function (callback) {
  var args = [this].concat([].slice.call(arguments, 1));

  var stores = [];
  this.each(function () {
    var store = storeLocal.get(this);
    if (stores.indexOf(store) < 0) stores.push(store);
  });

  for (var i = 0; i < stores.length; i++) {
    subscribe(stores[i], callback, args);
  }

  callback.apply(null, args);

  return this;
}
