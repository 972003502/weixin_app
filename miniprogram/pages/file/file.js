import table_Projuct from '../../database/table/product.js';
import DataBaseObject from '../../database/DataBaseObject.js';
import FileManager from '../../module/fileManager/fileManager.js';

let icons = [];
//let fileManager = wx.getFileSystemManager(); //创建文件管理器
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
        console.log("云链接", icons);
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
    // wx.showLoading({
    //   title: '下载中'
    // })
    for (let icon of icons) {
      // wx.cloud.downloadFile({
      //   fileID: icon,
      //   success(res) {
      //     tempFilePaths.push(res.tempFilePath);
      //   }
      // })
      wx.cloud.downloadFile({
        fileID: icon
      }).then(res => {
        tempFilePaths.push(res.tempFilePath);
        console.log(res.tempFilePath)
      }).catch(error => {
        // handle error
      })
    }
    console.log("下载完成", tempFilePaths);
  },

  cacheImage: function () {
    let start = Date.now();
    wx.showLoading({
      title: '缓存中'
    })
    this.fileManager.saveFile({
      tempFilePaths: tempFilePaths,
      fileKey: (item) => {
        let tempUrl = icons[tempFilePaths.indexOf(item)];
        return tempUrl.slice(tempUrl.indexOf('product_icon'));
      },
      complete: () => {
        let end = Date.now();
        console.log("耗时", `${end - start}ms`);
        wx.hideLoading();
        // this.setData({
        //   product_icon: wx.getStorageSync('product_icon_1558513044004.jpg')
        // })
      }
    })
  },

  clear: function() {
    this.fileManager.clearFile({});
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

  // getSavedFileInfo: function () {
  //   let fileSize = 0;
  //   fileManager.getSavedFileList({
  //     success: (res) => {
  //       for (let file of res.fileList) {
  //         fileSize += file.size
  //         console.log(file);
  //       }
  //       this.setData({
  //         savedFilePath: res.fileList[1].filePath
  //       });
  //       console.log("缓存大小", `${fileSize / 1000}KB`);
  //     }
  //   })
  // }
})
