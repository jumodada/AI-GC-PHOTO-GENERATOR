import kit from "./kit";


export default class Camera {
  display(videoElement) {
    let cameraMedia = window.navigator.mediaDevices;
    cameraMedia.enumerateDevices().then(
      devies => {
        if (!!devies) {
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
              kit.log('videoElement success');
              this.success(videoElement, stream);
            })
            .catch(err => {
              this.error(err);
            });
        }
      }
    ).catch(e => {
      console.error('设备异常,请检查', e);
    });
  }
  success(videoElement, stream) {
    videoElement.srcObject = stream;
    videoElement.play();
  }
  error(err) {
    kit.error(err);
  }
  /**
    *  关闭摄像头
    *  获取到video中的流，并将流中的轨道关闭
    */
  stopVideo(videoElement) {
    kit.debug("stopVideo");
    if (videoElement) {
      // 获取video中的流
      const stream = videoElement.srcObject;
      // 判断stream 是否为空
      if (stream == null) {
        return;
      }
      // 获取流中的所有轨道
      const tracks = stream.getTracks();
      tracks.forEach(function(track) {
        track.stop();
      });
      videoElement.srcObject = null;
    }
  }
}