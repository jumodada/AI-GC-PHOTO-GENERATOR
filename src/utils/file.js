import axios from 'axios';
import pic from '../assets/example/x.png';

export default {
  fetchPic(importedImage, success = null) {
    axios({
      url: importedImage,
      method: 'GET',
      responseType: 'blob', // 重要：设置响应类型为blob
    })
      .then((response) => {
        // response.data是一个Blob对象
        const blob = response.data;
        console.log('Blob:', blob);
        success(blob);
        // 在这里你可以使用Blob对象，例如将其转换为URL
        const imageUrl = URL.createObjectURL(blob);
        console.log('Blob URL:', imageUrl);
      })
      .catch((error) => {
        console.error('Error converting image to Blob:', error);
      });
  },
  fetchExample(success = null) {
    this.fetchPic(pic, success);
  },
  // 转换网络图片为File对象
  async convertImageToFile(imageUrl, success = null, errorFunc = null) {
    let error = '转换失败';
    try {
      // 通过fetch获取图片的Blob数据
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      // 使用File构造函数创建File对象
      const file = new File([blob], imageUrl, { type: 'image/png' });
      console.log(file); // 这里可以打印出File对象
      success && success(file);
      return;
      // 如果需要，可以在这里进行后续处理，例如上传File对象
    } catch (error) {
      console.error('转换失败:', error);
    }
    errorFunc && errorFunc(error);
  },

  fetchAssetAsBlob() {
    // 创建一个指向图片的Blob对象
    const blob = new Blob([pic], { type: 'image/png' });

    // 创建FileReader实例
    const reader = new FileReader();

    // 当读取操作完成时触发
    reader.onload = (event) => {
      // event.target.result 包含了读取到的DataURL
      console.log('DataURL:', event.target.result);
    };

    // 当读取操作发生错误时触发
    reader.onerror = (error) => {
      console.error('读取图片时发生错误:', error);
    };
    // 以DataURL的形式读取Blob
    reader.readAsDataURL(blob);
    return blob;
  },
  readExample() {
    return this.fetchAssetAsBlob();
  },
};



