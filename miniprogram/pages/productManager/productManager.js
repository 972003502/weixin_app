import table_Projuct from '../../database/table/product.js';
import DataBaseObject from '../../database/DataBaseObject.js';
import FileManager from '../../module/fileManager/fileManager.js';

Page({
  /**
   * 页面的初始数据
   */
  //path: "pages/productManagement/productManagement",
  data: {
    products: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fileManager = new FileManager();
    this.product = new DataBaseObject(table_Projuct);
    this.onInit();
  },

  // 预加载
  // onPreload: function () {
  //   this.fileManager = new FileManager();
  //   this.product = new DataBaseObject(table_Projuct);
  //   this.onInit();
  //   console.log("已预加载");
  // },

  onInit: function () {
    let productStorage = this.fileManager.storageInfo.values;
    this.setData({
        products: this.groupBy(productStorage, 'classify')
    })
  },

  groupBy: function (data, fieidName) {
    let fieidValues = [];
    let result = [];
    for (let obj of data) {
      if (!fieidValues.includes(obj[fieidName])) {
        fieidValues.push(obj[fieidName]);
        result.push(data.filter(item => item[fieidName] == obj[fieidName]));
      }
    }  
    return result;
  },

  actionSheetTap: function (e) {
    const that = this;
    let productID = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['修改', '删除'],
      itemColor: '#FF3030',
      success(e) {
        if (e.tapIndex == 1) {
          let productInfo = that.fileManager.storageInfo.map.get(productID);
          that.product.delInDB({
            data: [productID],
            completeAll: () => {
              wx.removeSavedFile({
                filePath: that.fileManager.storageInfo.map.get(productID).icon,
                success: (res) => {
                  wx.removeStorageSync(productID);
                  that.fileManager.getStorageInfoSync();
                  that.onInit();
                  wx.showToast({
                    title: '操作成功',
                  })
                }
              })   
            }
          })
          wx.cloud.deleteFile({
            fileList: [productInfo.orgIcon]
          }).then(res => {
            console.log("云存储删除成功", res.fileList);
          })
        }
      }
    })
  },

  onAddProduct: function () {
    wx.navigateTo({
      url: '../addProduct/addProduct'
    })
  }

  // onQuery: function () {
  //   this.product.queryInDb({
  //     success: res => {
  //       for (let data of this.product.dataCollection) {
  //         // 内存包含
  //         if (this.fileManager.storageInfo.keys.indexOf(data._id) != -1) {
  //           data.icon = this.fileManager.storageInfo.map.get(data._id).icon;
  //         }
  //       }
  //       this.setData({
  //         products: this.product.innerQueryBy('classify')
  //       })
  //     },
  //     fail: (e) => {
  //       wx.showToast({
  //         icon: 'none',
  //         title: '加载失败'
  //       })
  //     },
  //     complete: () => {
  //       console.log("图片地址", that.product.dataCollection[0]);
  //     }
  //   })
  // },

  // onImageLoad: function () {
  // },

  // onShow: function () {
  // }
})