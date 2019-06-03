// miniprogram/pages/menu/menu.js
import table_Projuct from '../../database/table/product.js';
import DataBaseObject from '../../database/DataBaseObject.js';
import FileManager from '../../module/fileManager/fileManager.js';

const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    products: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fileManager = new FileManager();
    this.product = new DataBaseObject(table_Projuct);
    this.onQuery();
  },

  onQuery: function () {
    this.product.queryInDb({
      success: res => {
        for (let data of this.product.dataCollection) {
          let iconID = data.icon.slice(data.icon.indexOf('product_icon'));
          // 内存包含
          if (this.fileManager.storageInfo.keys.indexOf(iconID) != -1) {
            data.icon = this.fileManager.storageInfo.map.get(iconID);
          }
        }
        this.setData({
          products: this.product.dataCollection
        })
      },
      fail: (e) => {
        wx.showToast({
          icon: 'none',
          title: '加载失败'
        })
      },
      complete: () => {

      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onQuery();
  }
})