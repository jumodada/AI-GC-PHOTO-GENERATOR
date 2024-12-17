// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const readConfig = () => {
  // const settings = require('electron-settings');
  // let defaultConfigValue = settings.getSync('yourConfigKey', 'defaultValue');
  // console.log('>>>>>>>>>>>', defaultConfigValue);
  const path = require('path');
  const fs = require('fs');
  const configFilePath = path.join(process.cwd(), 'app-config.json');
  // console.log(process.cwd(), configFilePath);
  // 确保配置文件存在
  if (!fs.existsSync(configFilePath)) {
    console.error('not found config', configFilePath);
    process.exit(1);
  }

  // 读取并解析配置文件
  const externalConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

  console.log("系统配置：", externalConfig); // 使用配置文件中的数据
  return externalConfig;
};

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('pool', {
  cfg: readConfig()
});
