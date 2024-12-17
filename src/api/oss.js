

import http from "../utils/request";
import kit from "../utils/kit";
import axios from "axios";

export default {

  getOssSign: () => {
    return http.post('/file/oss_sign_url_get', {
      file_name: kit.guid(),
    });
  },
  getPostObject: () => {
    return http.post('/file/oss_sign_url_post', {
      file_name: kit.guid() + '.png',
    });
  },
  getPutObject: () => {
    return http.post('/file/oss_sign_url_put', {
      file_name: kit.guid() + '.png',
    });
  },

  putUpload(url, blob, callback = { success: null, fail: null }) {
    let data = blob;
    axios.put(url, data,
      {
        headers: {
          'Content-Type': 'image/png',
        },
      }).then((resp) => {
        // If multiple files are uploaded, append upload status on the next line.
        console.log("上传成功", resp);
        if (callback && callback.success) {
          callback.success(resp);
        }
      }).catch((e) => {
        console.log("上传失败", e);
        if (callback && callback.fail) {
          callback.fail(e);
        }
      });
  },
  postUpload(url, blob, fileName, formParams = {}, callback = { success: null, fail: null }) {
    const fileType = 'image/png'; // 文件的MIME类型

    // 设置MinIO上传所需的headers
    let headers = {
      'Content-Type': fileType,
    };

    // 创建一个FormData对象来处理文件上传
    let formData = new FormData();
    formData.append('file', blob, fileName);

    for (let key in formParams) {
      formData.append(key, formParams[key]);
    }

    // 使用axios发送请求上传文件到MinIO
    axios.post(url, formData, { headers }).then(
      resp => {
        kit.log('File uploaded successfully:', resp);
        callback.success(resp);
      }
    ).catch(error => {
      kit.error('Error uploading file:', error);
      if (callback && callback.fail) {
        callback.fail(error);
      }
    });
  },
  postObject(bolb, callback = { success: null, fail: null }) {
    this.getPostObject().then(v => {
      kit.debug(v.code, v.data);

      let data = v.data;
      let fileName = data.new_filename;

      this.postUpload(data.post_url, bolb, fileName, data.form_params, callback);
    }).catch(e => {
      if (callback && callback.fail) {
        callback.fail(e);
      }
    });
  },
  putObject(bolb, callback = { success: null, fail: null }) {
    this.getPutObject().then(v => {
      kit.debug(v.code, v.data);

      this.putUpload(data.put_url, bolb, callback);
    }).catch(e => {
      if (callback && callback.fail) {
        callback.fail(e);
      }
    });
  }
};