import table_Projuct from '../../database/table/product.js';
import DataBaseObject from '../../database/DataBaseObject.js';
import FileManager from '../../module/fileManager/fileManager.js';

let icons = [];
let tempFilePaths = [];
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
    let imageList = [];
    this.product.queryInDb({
      success: res => {
        for (let obj of res.data) {
          imageList.push(obj.icon);
        }
        icons = imageList
        //console.log("云链接", icons);
      },
      fail: (e) => {
        wx.showToast({
          icon: 'none',
          title: '加载失败'
        })
      },
      complete: () => {
        //this.downloadImage();
      }
    })
  },

  downloadImage: function () {
    let start = Date.now();
    wx.showLoading({
      title: '下载中'
    })
    this.fileManager.downloadSync({
      tempFilePaths: icons,
      success: (res, path) => {
        tempFilePaths.push(res.tempFilePath);
        console.log("执行", icons.indexOf(path), res.tempFilePath);
      },
      completeAll: () => {
        let end = Date.now();
        console.log("耗时", `${end - start}ms`);
        wx.hideLoading();
        wx.showToast({
          title: '下载成功',
        })
      }
    });
  },

  cacheImage: function () {
    this.fileManager.saveFileSync({
      tempFilePaths: tempFilePaths,
      success: (res, path) => {
        let tempUrl = icons[tempFilePaths.indexOf(path)];
        let fileID = tempUrl.slice(tempUrl.indexOf('product_icon'));
        wx.setStorageSync(`${fileID}`, res.savedFilePath);
        console.log(fileID);
      }
    })
  },

  getSavedFile: function () {
    this.fileManager.getSavedFileInfo({});
    console.log(wx.getStorageInfoSync());
    // this.setData({
    //   product_icon: wx.getStorageSync('product_icon_1558513044004.jpg')
    // })
  },

  clear: function () {
    this.fileManager.clearFile({
      completeAll: () => {
        wx.clearStorageSync();
        console.log("clear all success");
      }
    });
  }

  // downloadImage: function () {
  //   let start = Date.now();
  //   wx.showLoading({
  //     title: '下载中'
  //   })
  //   let savedFilePaths = [];  //存放文件数组
  //   for (let icon of icons) {
  //     console.log("for循环",icons.indexOf(icon));
  //     wx.cloud.downloadFile({
  //       fileID: icon,
  //       success(res) {
  //         fileManager.saveFile({
  //           tempFilePath: res.tempFilePath,
  //           success(res) {
  //             let fileID = icon.slice(icon.indexOf('product_icon'));
  //             savedFilePaths.push(res.savedFilePath);
  //             wx.setStorageSync(`${fileID}`, res.savedFilePath);
  //             console.log("success回调",icons.indexOf(icon));
  //           },
  //           complete: () => {
  //             if (savedFilePaths.length == icons.length) {
  //               let end = Date.now();
  //               wx.hideLoading();
  //               wx.showToast({
  //                 title: '下载成功',
  //               })
  //               console.log("耗时", `${end - start}ms`);
  //             }
  //           }
  //         })
  //       }
  //     })
  //   }
  // },
})
