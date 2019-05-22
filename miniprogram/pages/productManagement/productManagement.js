import table_Projuct from '../../database/table/product.js';
import DataBaseObject from '../../database/DataBaseObject.js';

Page({
  /**
   * 页面的初始数据
   */
  path: "pages/productManagement/productManagement",
  data: {
    products: [],
    display: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function (options) {
  //   this.product = new DataBaseObject(table_Projuct);
  //   this.onQuery();
  // },

  onPreload: function () {
    this.product = new DataBaseObject(table_Projuct);
    this.onQuery();
    console.log("已预加载");
  },

  onQuery: function () {
    this.product.queryInDb({
      success: res => {
        this.setData({
          products: this.product.innerQueryBy('classify')
        })
      },
      fail: (e) => {
        wx.showToast({
          icon: 'none',
          title: '加载失败'
        })
      },
      complete: () => {
        console.log("图片地址", that.product.dataCollection[0]);
      }
    })
  },

  onLoad: function() {
    console.log("图片已加载");
  },

  onShow: function() {
  },

  onAddProduct() {
    wx.navigateTo({
      url: '../addProduct/addProduct'
    })
  }
})