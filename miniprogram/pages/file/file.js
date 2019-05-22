import table_Projuct from '../../database/table/product.js';
import DataBaseObject from '../../database/DataBaseObject.js';

let icons = [];
let fileManager = wx.getFileSystemManager(); //创建文件管理器
Page({
  onLoad() {
    // this.setData({
    //   savedFilePath: wx.getStorageSync('savedFilePath')
    // })

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
    wx.showLoading({
      title: '下载中'
    })
    let savedFilePaths = [];  //存放文件数组
    for (let icon of icons) {
      wx.cloud.downloadFile({
        fileID: icon,
        success(res) {
          fileManager.saveFile({
            tempFilePath: res.tempFilePath,
            success(res) {
              let fileID = icon.slice(icon.indexOf('product_icon'));
              savedFilePaths.push(res.savedFilePath);
              wx.setStorageSync(`${fileID}`, res.savedFilePath);
            },
            complete: () => {
              if (savedFilePaths.length == icons.length) {
                let end = Date.now();
                wx.hideLoading();
                wx.showToast({
                  title: '下载成功',
                })
                console.log("耗时", `${end - start}ms`);
              }
            }
          })
        }
      })
    }
  },

  getSavedFileInfo: function() {
    let fileSize = 0;
    fileManager.getSavedFileList({
      success: (res) => {
        for (let file of res.fileList){
          fileSize += file.size
          console.log(file);
        }
        this.setData({
          savedFilePath: res.fileList[1].filePath
        });
        console.log("缓存大小", `${fileSize/1000}KB`);
      }
    })
  },

  clear() {
    wx.setStorageSync('savedFilePath', '')
    this.setData({
      tempFilePath: '',
      savedFilePath: ''
    })
  }
})
