import storeLocal from './local';

export default function (store) {
  return function (selection) {
    selection.property(storeLocal, store);
  }
}
