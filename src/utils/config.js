export default {
	name: "客户大屏",
	productName: "aiCAM",
	version: "1.0.0",
	build: 1,
	TIMEOUT: 3000,
	TOKEN_NAME: 'Token',
	TOKEN_PREFIX: "",
	API_URL: "https://testmt.huajianjiyi.com/api",
	STREAM_URL: 'http://192.168.127.128:8000',
	HEADERS: {}, //附加头
	setApiUrl(url) {
		this.API_URL = url;
	},
	setStreamUrl(url) {
		this.STREAM_URL = url;
	}
};