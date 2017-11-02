import storeLocal from './local';

export default function (store) {
  return this.property(storeLocal, store);
}
