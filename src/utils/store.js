import Pool from "./pool";

// 用于用户权限信息存储

export default {
  getSource() {
    // return window.pool.store;
    return Pool.getInstance();
  },

  set(key, value) {
    this.getSource().setData(key, value);
  },
  get(key) {
    const val = this.getSource().getData(key);
    return val;
  },
  remove(key) {
    this.getSource().remove(key);
  }
};