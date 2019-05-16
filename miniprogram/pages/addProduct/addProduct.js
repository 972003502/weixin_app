// miniprogram/pages/addProduct/addProduct.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    index: null,
    imgList: [],
    picker: ['Coffee', 'Tea', 'Soda'],
    product_classify: null,
    product_name: null,
    product_describe: null,
    product_price: null,
    product_icon: null,
    nameInput: null,
    describeInput: null,
    priceInput: null,
    isComplete: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
  },

  isFillComplete() {
    if (this.data.product_name && this.data.product_classify
      && this.data.product_price && this.data.product_describe
      && this.data.product_icon) {
      this.setData({
        isComplete: true
      })
    }
    else {
      this.setData({
        isComplete: false
      })
    }
  },

  pickerChange(e) {
    this.setData({
      index: e.detail.value,
      product_classify: this.data.picker[e.detail.value]
    })
    this.isFillComplete();
  },

  bindProductNameInput(e) {
    this.setData({
      product_name: e.detail.value
    })
    this.isFillComplete();
  },

  bindProductDescribeInput(e) {
    this.setData({
      product_describe: e.detail.value
    })
    this.isFillComplete();
  },

  bindProductPriceInput(e) {
    this.setData({
      product_price: e.detail.value
    })
    this.isFillComplete();
  },

  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        let str = 'aaa.jpg';
        str.slice(-3,0);
        console.log(str);
        if (res.tempFilePaths[0] == 'jpg') {
          wx.navigateTo({
            url: '../cropper/cropper?src=' + res.tempFilePaths[0]
          })
        } else {

        }
      },
      fail: e => { },
      complete: () => { }
    });
  },

  viewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },

  delImg(e) {
    wx.showModal({
      title: '提示',
      content: '是否删除这张图片？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList,
            product_icon: null
          })
          this.isFillComplete();
        }
      }
    })
  },

  cloudUploadFile() {
    wx.showLoading({
      title: '提交中'
    })
    const filePath = this.data.product_icon;
    const cloudPath = 'product_icon_' + Date.now() + filePath.match(/\.[^.]+?$/)[0];
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        this.setData({
          product_icon: res.fileID
        })
      },
      fail: e => {
        wx.showToast({
          icon: 'none',
          title: '图片上传失败',
        })
      },
      complete: () => {
        this.addProductInDB();
      }
    })
  },

  addProductInDB() {
    const db = wx.cloud.database()
    db.collection('product').add({
      data: {
        product_classify: this.data.product_classify,
        product_icon: this.data.product_icon,
        product_name: this.data.product_name,
        product_describe: this.data.product_describe,
        product_price: this.data.product_price,
        sales_status: 1,
        product_sort: 1
      },
      success: res => {
        wx.hideLoading();
        wx.showToast({
          title: '提交成功',
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '提交失败'
        })
      },
      complete: () => {
        this.setData({
          product_classify: null,
          product_icon: null,
          product_name: null,
          product_describe: null,
          product_price: null,
          nameInput: null,
          describeInput: null,
          priceInput: null,
          index: null,
          imgList: [],
          isComplete: false
        })
      }
    })
  },

  onSubmit() {
    this.cloudUploadFile();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.isFillComplete();
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