import http from "@/utils/request";

export default {
  // 获取角色列表
  getQrCode: (shop_id, room_no) => {
    return http.get(`/client/get_login_qrcode`, { shop_id, room_no });
  },

};