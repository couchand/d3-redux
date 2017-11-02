import { select } from 'd3-selection';
import storeLocal from './local';

export default function (event, handler, capture) {
  return this.on(event, function (d, i, g) {
    var action = handler.call(this, d, i, g);
    if (action) {
      var store = storeLocal.get(this);
      store.dispatch(action);
    }
  }, capture);
}
