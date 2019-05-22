<<<<<<< HEAD
// miniprogram/pages/menu/menu.js
import table_Projuct from '../../database/table/product.js';
import DataBaseObject from '../../database/DataBaseObject.js';

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
    this.product = new DataBaseObject(table_Projuct);
    this.onQuery();
  },

  onQuery: function () {
    this.product.queryInDb({
      success: res => {
        this.setData({
          products: this.product.dataCollection
        })
      },
      fail: (e) => {
        wx.showToast({
          icon: 'none',
          title: '加载失败'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onQuery();
  }
=======
// miniprogram/pages/menu/menu.js
import table_Projuct from '../../database/table/product.js';
import DataBaseObject from '../../database/DataBaseObject.js';

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
    this.product = new DataBaseObject(table_Projuct);
    this.onQuery();
  },

  onQuery: function () {
    this.product.queryInDb({
      success: res => {
        this.setData({
          products: this.product.dataCollection
        })
      },
      fail: (e) => {
        wx.showToast({
          icon: 'none',
          title: '加载失败'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onQuery();
  }
>>>>>>> master
})