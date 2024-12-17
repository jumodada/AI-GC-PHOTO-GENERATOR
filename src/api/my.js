

import http from "@/utils/request";

export default {
  // 获取个人档案
  getMyFaceList: () => {
    return http.get(`/client/get_client_file`, {});
  },
  createMyFace: (height, weight, sex, imgs, name, cover = '') => {
    return http.post(`/client/create_client_file`, {
      name,
      cover,
      height,
      weight,
      sex,
      imgs,
    });
  },
};