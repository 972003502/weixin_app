import table_Projuct from '../../database/table/product.js';
import DataBaseObject from '../../database/DataBaseObject.js';
import FileManager from '../../module/fileManager/fileManager.js';

let icons = [];
let start;
Page({
  onLoad() {
    this.fileManager = new FileManager();
    this.product = new DataBaseObject(table_Projuct);
    this.onQuery();
  },
  data: {
    product_icons: [],
    product_icon: null,
    tempFilePath: '',
    savedFilePath: ''
  },

  onQuery: function () {
    start = Date.now();
    wx.showLoading({
      title: '下载中'
    })
    let imageList = [];
    this.product.queryInDb({
      success: res => {
        for (let obj of res.data) {
          imageList.push(obj.icon);
        }
        icons = imageList
      },
      fail: (e) => {
        wx.showToast({
          icon: 'none',
          title: '加载失败'
        })
      },
      complete: () => {
        this.downloadImage();
      }
    })
  },

  downloadImage: function () {
    this.fileManager.downloadSync({
      tempFilePaths: icons,
      completeAll: () => {
        this.cacheImage();
      }
    });
  },

  cacheImage: function () {
    let fileID;
    this.fileManager.saveFileSync({
      setKey: (value) => {
        fileID = value.slice(value.indexOf('product_icon'));
        return fileID;
      },
      success: (res) => {
        console.log(fileID);
      },
      completeAll: () => {
        this.fileManager.syncToGlobalStorage();
        let end = Date.now();
        console.log("耗时", `${end - start}ms`);
        wx.hideLoading();
        wx.showToast({
          title: '下载成功',
        })
      }
    })
  },

  getSavedFile: function () {
    this.fileManager.getSavedFileInfo({
      complete: () => {
        console.log("缓存大小", `${this.fileManager.filesInfo.size / 1000}KB`);
        console.log("缓存路径", this.fileManager.filesInfo.paths);
      }
    });
    console.log(wx.getStorageInfoSync());
    // this.setData({
    //   product_icon: wx.getStorageSync('product_icon_1558513044004.jpg')
    // })
  },

  clear: function () {
    this.fileManager.clearFile({
      completeAll: () => {
        this.fileManager.syncToGlobalStorage();
        console.log("clear all success");
      }
    });
  }
})
