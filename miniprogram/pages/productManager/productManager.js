import table_Projuct from '../../database/table/product.js';
import DataBaseObject from '../../database/DataBaseObject.js';
import FileManager from '../../module/fileManager/fileManager.js';

Page({
  /**
   * 页面的初始数据
   */
  path: "pages/productManagement/productManagement",
  data: {
    products: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function (options) {
  //   this.product = new DataBaseObject(table_Projuct);
  //   this.onQuery();
  // },

  onPreload: function () {
    this.fileManager = new FileManager();
    this.product = new DataBaseObject(table_Projuct);
    //this.onQuery();
    this.onInit();
    console.log("已预加载");
  },

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

  onQuery: function () {
    this.product.queryInDb({
      success: res => {
        for (let data of this.product.dataCollection) {
          // 内存包含
          if (this.fileManager.storageInfo.keys.indexOf(data._id) != -1) {
            data.icon = this.fileManager.storageInfo.map.get(data._id).icon;
          }
        }
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

  onImageLoad: function () {
    console.log("图片已加载");
  },

  onShow: function () {
  },

  onAddProduct() {
    wx.navigateTo({
      url: '../addProduct/addProduct'
    })
  }
})