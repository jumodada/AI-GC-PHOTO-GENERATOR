const ScreenState = {
  Ad: 0,//广告
  Notice: 1,//准备告知页面
  Ready: 2,//准备好了，可以拍摄
  WaitingForUpload: 3,//拍摄好了，可以上传
};

const PhotoType = {
  None: 0,
  Face: 1,
  Photo: 2,
};

export { ScreenState, PhotoType };
