import axios from 'axios';
import { ElNotification, ElMessageBox } from 'element-plus';
import sysConfig from "./config";
import tool from '@/utils/tool';
import router from '@/router';
import kit from './kit';
import store from './store';

axios.defaults.baseURL = '';

axios.defaults.timeout = sysConfig.TIMEOUT;

// HTTP request 拦截器
axios.interceptors.request.use(
	(config) => {
		// let token = tool.cookie.get("TOKEN");
		let token = store.get("TOKEN");
		if (token) {
			config.headers[sysConfig.TOKEN_NAME] = sysConfig.TOKEN_PREFIX + token;
		}
		if (config.method == 'get') {
			config.params = config.params || {};
			config.params['_'] = new Date().getTime();
		}
		Object.assign(config.headers, sysConfig.HEADERS);
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

//FIX 多个API同时401时疯狂弹窗BUG
let MessageBox_401_show = false;

// HTTP response 拦截器
axios.interceptors.response.use(
	(response) => {
		let respData = response.data;
		if (response.status == 204) {
			return response;
		}
		if (respData) {
			if (kit.hasKeyInObject('code', respData)) {
				if (respData.code == 200) {
					return response;
				} else {
					ElNotification.error({
						title: '请求错误',
						message: respData.message || `Status:${respData.code}，未知错误！`
					});
				}
			}
		}
		return response;
	},
	(error) => {
		if (error && error.response) {
			if (error.response.status == 404) {
				ElNotification.error({
					title: '请求错误',
					message: "Status:404，正在请求不存在的服务器记录！"
				});
			} else if (error.response.status == 500) {
				ElNotification.error({
					title: '请求错误',
					message: error.response.data.message || "Status:500，服务器发生错误！"
				});
			} else if (error.response.status == 401) {
				if (!MessageBox_401_show) {
					MessageBox_401_show = true;
					ElMessageBox.confirm('当前用户已被登出或无权限访问当前资源，请尝试重新登录后再操作。', '无权限访问', {
						type: 'error',
						closeOnClickModal: false,
						center: true,
						confirmButtonText: '重新登录',
						beforeClose: (action, instance, done) => {
							MessageBox_401_show = false;
							done();
						}
					}).then(() => {
						router.replace({ path: '/login' });
					}).catch(() => { });
				}
			} else {
				ElNotification.error({
					title: '请求错误',
					message: error.message || `Status:${error.response.status}，未知错误！`
				});
			}
		} else {
			ElNotification.error({
				title: '请求错误',
				message: "请求服务器无响应！"
			});
		}

		console.log('request error:', error);
		return Promise.reject(error.response || '未知错误');
	}
);

var http = {
	domain: '',
	prefix: () => { return sysConfig.API_URL; },
	setDomain(domain) {
		return this.domain = domain;
	},
	getUrl(uri) {
		if (uri.indexOf('http') > -1) return uri;
		return this.prefix() + uri;
	},

	apiUrl(uri) {
		// console.log('request URI: ', uri)
		if (uri.indexOf('http') > -1) return uri;
		let url = this.getUrl(uri);
		// console.log('request url: ', url)
		return url;
	},

	/** get 请求
	 * @param  {string} uri 接口地址
	 * @param  {object} params 请求参数
	 * @param  {object} config 参数
	 */
	get: function(uri, params = {}, config = {}) {
		return new Promise((resolve, reject) => {
			axios({
				method: 'get',
				url: this.apiUrl(uri),
				params: params,
				...config
			}).then((response) => {
				resolve(response.data);
			}).catch((error) => {
				reject(error);
			});
		});
	},

	/** post 请求
	 * @param  {string} uri 接口地址
	 * @param  {object} data 请求参数
	 * @param  {object} config 参数
	 */
	post: function(uri, data = {}, config = {}) {
		return new Promise((resolve, reject) => {
			axios({
				method: 'post',
				url: this.apiUrl(uri),
				data: data,
				...config
			}).then((response) => {
				resolve(response.data);
			}).catch((error) => {
				reject(error);
			});
		});
	},

	/** put 请求
	 * @param  {string} uri 接口地址
	 * @param  {object} data 请求参数
	 * @param  {object} config 参数
	 */
	put: function(uri, data = {}, config = {}) {
		return new Promise((resolve, reject) => {
			axios({
				method: 'put',
				url: this.apiUrl(uri),
				data: data,
				...config
			}).then((response) => {
				resolve(response.data);
			}).catch((error) => {
				reject(error);
			});
		});
	},

	/** patch 请求
	 * @param  {string} uri 接口地址
	 * @param  {object} data 请求参数
	 * @param  {object} config 参数
	 */
	patch: function(uri, data = {}, config = {}) {
		return new Promise((resolve, reject) => {
			axios({
				method: 'patch',
				url: this.apiUrl(uri),
				data: data,
				...config
			}).then((response) => {
				resolve(response.data);
			}).catch((error) => {
				reject(error);
			});
		});
	},

	/** delete 请求
	 * @param  {string} uri 接口地址
	 * @param  {object} data 请求参数
	 * @param  {object} config 参数
	 */
	delete: function(uri, data = {}, config = {}) {
		return new Promise((resolve, reject) => {
			axios({
				method: 'delete',
				url: this.apiUrl(uri),
				data: data,
				...config
			}).then((response) => {
				resolve(response.data);
			}).catch((error) => {
				reject(error);
			});
		});
	},

	/** jsonp 请求
	 * @param  {string} uri 接口地址
	 * @param  {string} name JSONP回调函数名称
	 */
	jsonp: function(uri, name = 'jsonp') {
		return new Promise((resolve) => {
			var script = document.createElement('script');
			var _id = `jsonp${Math.ceil(Math.random() * 1000000)}`;
			script.id = _id;
			script.type = 'text/javascript';
			script.src = this.apiUrl(uri),
				window[name] = (response) => {
					resolve(response);
					document.getElementsByTagName('head')[0].removeChild(script);
					try {
						delete window[name];
					} catch (e) {
						window[name] = undefined;
					}
				};
			document.getElementsByTagName('head')[0].appendChild(script);
		});
	},
	// request: async () => {
	// 	return await
	// }
};

export default http;
