// miniprogram/pages/menu/menu.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    products: [],
    pageLoadComplete: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '页面加载中'
    })
    this.onQuery();
  },

  onQuery: function () {
    const db = wx.cloud.database()
    db.collection('product').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        for (let obj of res.data) {
          wx.cloud.getTempFileURL({
            fileList: [obj.product_icon],
            success: res => {
              obj.product_icon = res.fileList[0].tempFileURL;
            },
            fail: console.error
          })
        }
        this.setData({
          products: res.data
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '加载失败'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideLoading();
    this.setData({
      pageLoadComplete: true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //this.onQuery();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})