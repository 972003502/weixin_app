import table_Projuct from '../../database/table/product.js';
import DataBaseObject from '../../database/DataBaseObject.js';

let icons = [];
let files = [];
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
        console.log("云链接", icons.length);
      },
      fail: (e) => {
        wx.showToast({
          icon: 'none',
          title: '加载失败'
        })
      }
    })
  },

  download() {
    let start = Date.now();
    wx.showLoading({
      title: '下载中'
    })
    const that = this
    wx.cloud.getTempFileURL({
      fileList: icons,
      success: res => {
        files = res.fileList;
      },
      fail: console.error,
      complete: () => {
        let savedFilePaths = [];
        let newImage;
        let fileNums = 0;
        for (let file of files) {
          wx.downloadFile({
            url: file.tempFileURL,
            success(res) {
              wx.saveFile({
                tempFilePath: res.tempFilePath,
                success(res) {
                  savedFilePaths.push(res.savedFilePath);
                  console.log("ok");
                  wx.setStorageSync(`savedFilePath${fileNums}`, res.savedFilePath);
                  fileNums += 1;
                },
                complete: () => {
                  if (savedFilePaths.length == files.length) {
                    let end = Date.now();
                    wx.hideLoading();
                    wx.showToast({
                      title: '下载成功',
                    })
                    console.log("成功", `${end - start}ms`);
                  }
                }
              })
            }
          })
        }
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