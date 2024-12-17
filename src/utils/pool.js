import kit from "./kit";

export default class Pool {
  constructor() {
    this._data = {};
  }

  static getInstance() {
    if (!Pool.__pool) {
      Pool.__pool = new Pool();
    }
    return Pool.__pool;
  }
  setData(key, value) {
    this._data[key] = value;
    kit.debug(key, '设置Data', value);
  }
  getData(key) {
    const v = this._data[key] ?? '';
    if (key != 'TOKEN') kit.debug(key, '获取Data', v);
    return v;
  }

  remove(key) {
    if (kit.hasKeyInObject(key, this._data)) {
      delete this._data[key];
      kit.debug('删除', key);
    }
  }
}
