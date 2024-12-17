<template>
  <div class="view-container">
    <div class="video-page" v-show="state >= ScreenState.Ready">
      <div class="video-content" ref="videoBoxRef">
        <img :src="modelPic" class="video-item" v-show="!showVideo && modelPic">
        <img ref="videoRef" class="stream-viewer" :src="streamVideoSrc" v-show="showVideo">
        <div class="left-number" v-show="leftNumber > 0">
          {{ leftNumber }}
        </div>
      </div>
      <div class="video-button" v-show="isConfirming">
        <el-button color="#FFCA0E" @click="uploadPic" class="btn capture">◯ 完成！ </el-button>
        <el-button color="#FFCA0E" @click="redo" class="btn submit">⨉ 重拍 </el-button>
      </div>
    </div>
    <div v-if="state == ScreenState.Ad" class="ad">
      <img :src="adPic" class="ad-pic pic">
    </div>
    <div v-else-if="state == ScreenState.Notice" class="notice-box">
      <img :src="modelCoverPic" class="model-pic  pic">
      <div class="model-txt">
        <div class="title">
          {{ modelTitle }}
        </div>
        <div class="notice">
          <div class="notice-title">提示</div>
          <div> 与图示姿势越接近，生成图片效果越优质 </div>
          <div> 第一步：根据提示在指定区域摆出自己喜欢的姿势 </div>
          <div> 第二部：按下按钮，将在5秒钟倒计时后自动拍摄 </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import kit from '@/utils/kit';
// import Camera from '@/utils/camera';
import sender from '@/utils/sender';
import file from '@/utils/file';
import oss from '@/api/oss';
import task from '@/api/task';
import AdPng from '@/assets/imgs/ad.png';

import { ScreenState, PhotoType } from './action';
import { useEvents } from '../../hooks/event';
import store from '../../../utils/store';
// import http from '@/utils/request';
import stream from '@/api2/stream';

const videoRef = ref();
const videoBoxRef = ref();
const showVideo = ref(true);
const leftNumber = ref(-1);
const isConfirming = ref(false);
const state = ref(ScreenState.Ad);

// 广告
const adPic = ref(AdPng);

// 拍摄模板信息
const modelPic = ref('');//模板图片（透明）
const modelCoverPic = ref(AdPng);
const modelTitle = ref('');

const photoParam = {
  modelId: '',
  faceId: 0,
  waitId: 0,
};

let curType = PhotoType.None;// 0-空闲 1-头像档案 2-拍艺术照

// 头像档案
let curFaceIndex = -1; //档案第几张(0-4)

let intervalId = null; // 定时器id
let captureLock = true; // 拍照锁，给图像出现预留时间

let isDev = false; //是否开发


const device = {};
const streamVideoSrc = ref('');

const checkStatus = () => {
  setTimeout(() => {
    getStatus();
  }, 3000); // 3s后再次检查
};

const getStatus = async () => {
  try {
    let response = await stream.deviceStatus();

    device.index = response.index;
    device.camWidth = response.width;
    device.camHeight = response.height;
    device.fps = response.fps;
    device.camMode = response.stream_mode;

    if (streamVideoSrc.value == '') {
      streamVideoSrc.value = stream.getCamStream(device.fps);
    }
    // kit.debug('device info:', device);
    // kit.debug('streamVideoSrc:', streamVideoSrc);

  } catch (error) {
    console.error(error);
  }
  checkStatus();
};

// 拍照
const capture = () => {
  kit.debug("拍照!", curType);
  doPic();
  showVideo.value = false;
  isConfirming.value = true;
};

// 拍照前准备
const startPreparing = () => {
  kit.debug("退出模型介绍，进入拍照", curType);
  captureLock = true;//每次拍摄还要强制准备一段时间才可以拍照
  state.value = ScreenState.Ready;
  if (curType == PhotoType.Face && curFaceIndex < 0) {
    curFaceIndex = 1;
    kit.debug('--------------------ID<0');
  }

  // cam.display(videoRef.value);
  showVideo.value = true;
  kit.debug('start showVideo', showVideo.value);

  setTimeout(() => {
    captureLock = false;
  }, 1000);
};

// 拍照倒计时
const startCapture = () => {
  // 如果锁住，则不让拍照
  if (captureLock) {
    return;
  }
  kit.debug("准备好了，开始拍照", curType);
  if (intervalId) {
    stopTimer(intervalId);
  }

  leftNumber.value = 5;//倒数 5 s

  intervalId = setInterval(() => {
    leftNumber.value--;
    kit.debug('leftNumber=', leftNumber.value);
    if (leftNumber.value < 1) {
      if (leftNumber.value == 0) {
        capture();
      }
      stopTimer(intervalId);
    }
  }, 1000);
};

// 停止定时器
const stopTimer = (intervalId) => {
  clearInterval(intervalId);
  leftNumber.value = -1;
};

// 重新拍照
const redo = () => {
  kit.debug("redo...............");

  // if (showVideo.value) {
  //   cam.stopVideo(videoRef.value);
  // }
  isConfirming.value = false;
  showVideo.value = true;
  streamVideoSrc.value = stream.getCamStream(device.fps);
  startPreparing();
};

// 创建档案
const startFacePhotoCmd = (data) => {
  curType = PhotoType.Face;
  // 如果一样就不处理
  if (curFaceIndex == data) {
    return;
  }

  curFaceIndex = data;
  ElMessage.info('创建第' + (curFaceIndex + 1) + '张档案');
  stream.setMode(stream.MODE_RAW);
  startPreparing();
};

// 来自ws的准备事件
const noticeCmd = (data) => {
  kit.debug('noticeCmd', data);
  goNextPhotograph(data);
};

// 准备拍摄
const playPhotoNotice = (id, modelId, faceId, name, cover = '', background = '', obscuration = '') => {
  curType = PhotoType.Photo;
  state.value = ScreenState.Ad;

  kit.debug('background', background);
  if (!background) {
    beginPhotoNotice(id, modelId, faceId, name, cover, obscuration);
    return;
  }
  file.convertImageToFile(background, (fileData) => {
    beginPhotoNotice(id, modelId, faceId, name, cover, obscuration, fileData);
  }, err => {
    ElMessage.error('获取模板图片失败，请检查网络或联系管理员');
    goNextPhotograph();
  });
};

const beginPhotoNotice = (id, modelId, faceId, name, cover = '', obscuration = '', fileData = null) => {
  photoParam.waitId = id;
  photoParam.faceId = faceId;
  photoParam.modelId = modelId;
  stream.setMode(stream.MODE_MATTING, fileData);
  // 修改图层信息
  modelTitle.value = name;
  modelCoverPic.value = cover;
  //TODO 样式蒙层
  modelPic.value = obscuration;
  state.value = ScreenState.Notice; // 需要首先显示模型首图及介绍
};

// 主动检查下一个
const checkNextPhoto = async () => {
  if (state.value != ScreenState.Ad) {
    return;
  }
  if (!store.get('TOKEN')) {
    return;
  }

  const { data, code } = await task.getNextWaitId();

  if (code != 200 || data.has_next != 1) {
    kit.debug('没有待拍摄任务');
    return;
  }
  kit.debug('next---->', data.model_params.environment);

  playPhotoNotice(data.id, data.model_id, data.client_file_id, data.model_info.name, data.model_info.cover, data.model_params.environment);
};

// 拍摄艺术照片
const goNextPhotograph = async (nextId = 0) => {
  // 没有拍摄任务，则进入广告
  if (!nextId) {
    startAdTime();
    return;
  }

  // 继续下一张拍照
  const { data } = await task.getWaitInfo(nextId);

  playPhotoNotice(data.id, data.model_id, data.client_file_id, data.model_info.name, data.model_info.cover, data.model_params.environment);

};

// 结束切换场景
const startAdTime = (isAdVal = true) => {
  kit.debug("当前拍摄完成", isAdVal ? "进入广告" : "进入下一组拍照");
  ElMessage.success(isAdVal ? "拍摄完成，进入广告" : "拍摄完成，进入下一组拍照");
  state.value = isAdVal ? ScreenState.Ad : ScreenState.Notice;
};

// 确认照片，上传
const uploadPic = () => {
  kit.debug("拍照完成，确认上传");
  isConfirming.value = false;
  // const canvas = canvasRef.value;
  if (isDev) {
    // 测试样例
    file.fetchExample((blobData) => {
      kit.debug(blobData);
      postPic(blobData);
    });
    return;
  }

  const url = doPic();
  kit.debug('doPic url', url);
  stream.getBlobByImage(url).then(blob => {
    kit.debug('blob', blob);
    // 正式
    postPic(blob);
  });
};

const doPic = (isForceRaw = false) => {
  modelPic.value = curType == PhotoType.Face ? stream.getFaceUri('off', 0.35, 5) : stream.getCamImageUrl(isForceRaw);
  return modelPic.value;
};

// 同步照片
const postPic = (blob) => {
  oss.postObject(blob, {
    success: (a) => {
      kit.debug("图片上传成功！！！", a.headers.location);
      const picUrl = a.headers.location;
      if (curType == PhotoType.Face) {
        postFace(picUrl);
      } else if (curType == PhotoType.Photo) {
        // 同步
        task.createTask(photoParam.modelId, photoParam.faceId, photoParam.waitId, [picUrl]).then(res => {
          kit.debug('success to createTask', res);
          goNextPhotograph(res.data.next);
        });
      }
    },
    fail: (e) => {
      kit.debug("失败！！！", e);
      ElMessage.error("上传图片失败");
      isConfirming.value = true;
    }
  });
};

const postFace = (picUrl) => {
  sender.postFace(curFaceIndex, picUrl); // 同步给控制台
  if (curFaceIndex == 4) { // 最后一个就回到AD
    startAdTime();
  }
};

const { registerKeyboard, registerWsEvent } = useEvents();

registerWsEvent({
  takeFacePhoto: startFacePhotoCmd,// 提示可以进行拍档案了
  next: noticeCmd,//提示可以进行拍照了
}, checkNextPhoto);

let keyEvents = new Map();
keyEvents.set(ScreenState.Notice, startPreparing);
keyEvents.set(ScreenState.Ready, startCapture);
keyEvents.set(ScreenState.WaitingForUpload, uploadPic);
registerKeyboard(keyEvents, state, 'Enter');

onMounted(() => {
  checkStatus();
  isConfirming.value = false;
  checkNextPhoto();
});
onUnmounted(() => {
  // cam.stopVideo(videoRef.value);
  if (intervalId) {
    stopTimer(intervalId);
  }
});
</script>

<style lang="scss" scoped>
.view-container {
  .video-page {
    color: #fff;
    height: 100vh;
    width: 100vw;

    .video-content {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      justify-items: center;

      .video-item {
        height: 100%;
        width: 100%;
        object-fit: fill;
      }

      .stream-viewer {
        height: auto;
        max-width: 100%;
        margin-left: auto;
        margin-right: auto;
        background-color: transparent;
        display: block;
      }

      .left-number {
        position: absolute;
        left: calc(100vw / 2);
        top: calc(100vh / 2);
        font-size: 200px;
        font-weight: 700;
      }
    }

    .video-button {
      display: flex;
      width: 100%;
      justify-content: center;
      justify-items: center;
      position: fixed;
      bottom: 10px;
    }
  }

  .pic {
    width: 100%;
    max-height: 100%;
  }

  .notice-box {
    .model-txt {
      position: absolute;
      top: calc(100vh * 0.55);
      color: #FFFFFF;
      z-index: 1000;

      .title {
        width: 717px;
        height: 70px;
        font-weight: bold;
        font-size: 55px;
        line-height: 64px;
        text-align: center;
      }

      .notice {
        padding: 33px 134px;
      }
    }
  }

  .ad {}
}
</style>