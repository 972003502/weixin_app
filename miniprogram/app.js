//app.js
import extend from './module/mp-extend/extend-config.js';
import table_Projuct from './database/table/product.js';
import DataBaseObject from './database/DataBaseObject.js';
import FileManager from './module/fileManager/fileManager.js';

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

  slieStr: function (str1, str2) {
    return str1.slice(str1.indexOf(str2));
  },

  onInit: function () {
    wx.showLoading({
      title: '加载中'
    })
    this.start = Date.now();
    this.newMap = new Map();
    this.product.queryInDb({
      success: res => {
        for (let obj of res.data) {
          this.newMap.set(obj._id, obj);
        }
      },
      complete: () => {
        let downloadfileList = [];
        for (let entry of this.newMap) {
          if (this.fileManager.storageInfo.keys.indexOf(entry[0]) == -1) {
            downloadfileList.push(entry[1].icon);
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '加载完成',
            })
            console.log("重复值");
          }
        }
        if (downloadfileList.length != 0) {
          this.downloadImage(downloadfileList);
        }
      }
    })
  },

  downloadImage: function (fileList) {
    this.fileManager.download({
      tempFilePaths: fileList,
      completeAll: () => {
        this.cacheImage();
      }
    });
  },

  cacheImage: function () {
    let newObj;
    this.fileManager.saveFileSync({
      setKey: (value) => {
        for (let entry of this.newMap) {
          if (entry[1].icon == value) {
            newObj = entry[1];
            newObj.orgIcon = value;
            return entry[0];
          }
        }
      },
      setValue: (value) => {
        newObj.icon = value;
        return newObj;
      },
      completeAll: () => {
        this.fileManager.syncToGlobalStorage();
        for (let map of this.fileManager.storageInfo.map) {
          console.log(map);
        }
        let end = Date.now();
        wx.hideLoading();
        wx.showToast({
          title: '加载完成',
        })
        console.log("耗时", `${end - this.start}ms`);
      }
    })
  }
})