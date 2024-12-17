import http from "@/utils/request";

export default {
  createTask: (modelId, faceId, waitId, imgs = []) => {
    return http.post(`/client/create_task`, { model_id: modelId, client_file_id: faceId, wait_id: waitId, imgs });
  },
  // 获取拍摄详情，根据拍摄列表id
  getWaitInfo: (id) => {
    return http.get(`/client/get_wait_info`, { id });
  },
  // /api/client/get_next_wait 获取下一个待拍摄id
  getNextWaitId: () => {
    return http.get(`/client/get_next_wait`, {});
  },
};