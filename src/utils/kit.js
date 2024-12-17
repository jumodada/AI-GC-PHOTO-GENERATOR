import config from "./config";


export default {
  /**
   * return if it works under debug
   */
  isDebug() {
    return process.env.NODE_ENV === "development";
  },
  buildversion() {
    return config.build;
  },
  version() {
    return config.version;
  },
  appVersion() {
    return this.version() + '.' + this.buildversion();
  },
  cfg() {
    return config;
  },

  /**
   * 打印标记
   * @param {string} title
   * @param {string} content
   * @param {string} contentBgColor
   * @param {string} titleBgColor
   */
  mark(title, content, contentBgColor = '#4aca69', titleBgColor = '#606060') {
    if (this.isDebug()) contentBgColor = '#ccc';
    console.info("%c ".concat(title, " %c ").concat(content, " "),
      "padding: 1px; border-radius: 3px 0 0 3px; color: #fff; background: ".concat(titleBgColor, ";"),
      "padding: 1px; border-radius: 0 3px 3px 0; color: #fff; background: ".concat(contentBgColor, ";"));
  },

  /**
   * 显示系统信息
   */
  dispaySysInfo(projectName) {
    this.mark('Environment', process.env.NODE_ENV);
    this.mark('Project', projectName);
    this.mark('Version', this.appVersion());
  },
  ms() {
    return this.dateFormat('hh:mm:ss:S', new Date());
  },

  /**
   * 获取YYYYMMDD格式
   * @param {Date} dateObj
   * @returns
   */
  dateFormat(formatString, dateObj) {
    // console.log(dateObj.toString())
    let date = {
      "M+": dateObj.getMonth() + 1,
      "d+": dateObj.getDate(),
      "h+": dateObj.getHours(),
      "m+": dateObj.getMinutes(),
      "s+": dateObj.getSeconds(),
      "q+": Math.floor((dateObj.getMonth() + 3) / 3),
      "S": dateObj.getMilliseconds()
    };
    if (/(y+)/i.test(formatString)) {
      formatString = formatString.replace(RegExp.$1, (dateObj.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (let k in date) {
      if (new RegExp("(" + k + ")").test(formatString)) {
        formatString = formatString.replace(RegExp.$1, RegExp.$1.length == 1 ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
      }
    }
    return formatString;
  },
  guid() {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
  },

  /**
   * debug 日志
   * @param  {...any} args
   * @returns
   */
  debug(...args) {
    if (!this.isDebug()) return;
    console.log(this.ms(), '[DEBUG]', ...args);
  },

  log(...args) {
    console.info(this.ms(), '[INFO]', ...args);
  },

  info(...args) {
    console.info(this.ms(), '[INFO]', ...args);
  },

  warn(...args) {
    console.warn(this.ms(), '[WARN]', ...args);
  },

  error(...args) {
    console.error(this.ms(), '[ERROR]', ...args);
  },
  buildHttpURI(params = {}) {
    let url = '';
    if (Object.prototype.toString.call(params) === '[object Object]') {
      let arr = [];
      for (const key in params) {
        if (Object.hasOwnProperty.call(params, key)) {
          const value = params[key];
          arr.push([key, encodeURIComponent(value)].join('='));
        }
      }
      url = arr.join('&');
    }
    return url;
  },
  hasKeyInObject(key, object) {
    return this.isObject(object) && key in object;
  },
  isObject(value) {
    const type = typeof value;
    return value != null && type === 'object';
  }
};