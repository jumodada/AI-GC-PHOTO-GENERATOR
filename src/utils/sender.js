import WSClient from "./client";

export default {
  getWSInstance() {
    return WSClient.getInstance();
  },
  postFace(id, pic) {
    return this.getWSInstance().sendMsgObj('face', { id, pic });
  }
};