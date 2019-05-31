//app.js
import table_Projuct from './database/table/product.js';
import DataBaseObject from './database/DataBaseObject.js';
import FileManager from './module/fileManager/fileManager.js';
import extend from './module/mp-extend/extend-config.js';

App = extend.App
Page = extend.Page
Component = extend.Component

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    this.globalData = {};
    this.fileManager = new FileManager();
    this.product = new DataBaseObject(table_Projuct);
    this.onInit();
  },

  onInit: function () {
    this.start = Date.now();
    let fileList = [];
    this.product.queryInDb({
      success: res => {
        for (let obj of res.data) {
          fileList.push(obj.icon);
        }
      },
      complete: () => {
        let downloadfileList = [];
        for (let file of fileList) {
          let fileID = file.slice(file.indexOf('product_icon'));
          if (this.fileManager.storageInfo.keys.indexOf(fileID) == -1) {
            downloadfileList.push(file);
          } else console.log("重复值");
        }
        if (downloadfileList.length != 0) {
          this.downloadImage(downloadfileList);
        }
      }
    })
  },

  downloadImage: function (fileList) {
    this.fileManager.downloadSync({
      tempFilePaths: fileList,
      completeAll: () => {
        this.cacheImage();
      }
    });
  },

  cacheImage: function () {
    this.fileManager.saveFileSync({
      setKey: (value) => {
        let fileID = value.slice(value.indexOf('product_icon'));
        return fileID;
      },
      completeAll: () => {
        this.fileManager.syncToGlobalStorage();
        let end = Date.now();
        console.log("耗时", `${end - this.start}ms`);
      }
    })
  },

  onShow() {

  },
})
