import { select } from 'd3-selection';
import storeLocal from './local';

export default function (selector) {
  return this.each(function () {
    var store = storeLocal.get(this);
    select(this)
      .datum(selector.call(this, store.getState()));
  });
}
