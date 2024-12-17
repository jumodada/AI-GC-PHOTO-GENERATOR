import http from "@/utils/request";
import axios from "axios";
import sysConfig from "../utils/config";
import kit from "@/utils/kit";

export default {
  MODE_MATTING: 'matting',//背景分割
  MODE_RAW: 'raw',//原始流
  prefix: () => {
    return sysConfig.STREAM_URL;
  },
  getUrl(uri) {
    if (uri.indexOf('http') > -1) return uri;
    return this.prefix() + uri;
  },
  get(uri, params = {}) {
    return http.get(this.getUrl(uri), params);
  },
  postForm(uri, data = {}) {
    return new Promise((resolve, reject) => {
      axios.post(this.getUrl(uri), data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((response) => {
        resolve(response.data);
      }).catch((error) => {
        reject(error);
      });
    });
  },
  // 获取个人档案
  deviceStatus() {
    return this.get("/api/camera/status");
  },
  setMode(mode, file = null, x = 0.5, y = 0.5) {
    let formdata = new FormData();
    formdata.append('mode', mode);
    if (mode == this.MODE_MATTING) {
      if (file) {
        // let fileDOM = document.getElementById(fileId);
        formdata.append('background', file);
      }
    }
    formdata.append('x', x);
    formdata.append('y', y);
    return this.postForm("/api/camera/mode/form", formdata);
  },

  async getFace(largest, padding, gap) {
    const url = this.getFaceUri(largest, padding, gap);
    return await this.getBlobByImage(url);
    // return URL.createObjectURL(blob);
  },

  getFaceUri(largest, padding, gap) {
    const uri = `/api/camera/face?padding=${padding}&largest=${largest}&gap=${gap}`;
    return this.getUrl(uri);
  },

  getCamImageUrl(isForceRaw = false) {
    let forceRaw = isForceRaw ? 'on' : "off";
    const uri = `/api/camera/capture?force_raw=${forceRaw}&t=${new Date().getTime()}`;
    return this.getUrl(uri);
  },
  getCamStream(fps) {
    let uri = `/api/camera/stream?fps=${fps}&t=${new Date().getTime()}`;
    return this.getUrl(uri);
  },
  getBlobByImage(url) {
    return new Promise((resolve, reject) => {
      axios.get(url, { responseType: 'blob' }).then((response) => {
        kit.debug("getBlobByImage", response);
        resolve(response.data);
      }).catch((error) => {
        reject(error);
      });
    });
  }
};