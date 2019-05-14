
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
    this.onQuery();
    console.log("onLoad已执行");
  },

  onQuery: function () {
    const db = wx.cloud.database()
    db.collection('product').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        let classifys = [];
        let productByClassify = [];
        for (let obj of res.data) {
          wx.cloud.getTempFileURL({
            fileList: [obj.product_icon],
            success: res => {
              obj.product_icon = res.fileList[0].tempFileURL;
            },
            fail: console.error
          })
          if (!classifys.includes(obj.product_classify)) {
            classifys.push(obj.product_classify);
            productByClassify.push(res.data.filter(item => item.product_classify == obj.product_classify));
          }
        }
        this.setData({
          products: productByClassify
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '加载失败'
        })
      },
      complete: () => { }
    })
  },

  onAddProduct() {
    wx.navigateTo({
      url: '../addProduct/addProduct'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("onReady已执行");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onShow已执行");
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("onHide已执行");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("onUnload已执行");
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