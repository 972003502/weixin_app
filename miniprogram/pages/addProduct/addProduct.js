import table_Projuct from '../../database/table/product.js';
import DataBaseObject from '../../database/DataBaseObject.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgList: [],
    picker: ['Coffee', 'Tea', 'Soda'],
    isComplete: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.product = new DataBaseObject(table_Projuct);
  },

  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    this.setData({
      isComplete: this.product.isContainNull()
    })
  },

  onPickerChange: function (e) {
    this.product.setValue('classify', this.data.picker[e.detail.value]);
    this.setData({
      index: e.detail.value,
      isComplete: this.product.isContainNull()
    })
  },

  onNameInput: function (e) {
    this.product.setValue('name', e.detail.value);
    this.setData({
      isComplete: this.product.isContainNull()
    })
  },

  onDescribeInput: function (e) {
    this.product.setValue('describe', e.detail.value);
    this.setData({
      isComplete: this.product.isContainNull()
    })
  },

  onPriceInput: function (e) {
    this.product.setValue('price', e.detail.value);
    this.setData({
      isComplete: this.product.isContainNull()
    })
  },

  onChooseImage: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        wx.navigateTo({
          url: '../cropper/cropper?src=' + res.tempFilePaths[0]
        })
      },
      fail: e => { },
      complete: () => { }
    });
  },

  onViewImage: function (e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },

  onDelImg: function (e) {
    wx.showModal({
      title: '提示',
      content: '是否删除这张图片？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
          this.product.setValue('icon', null);
          this.setData({
            isComplete: this.product.isContainNull()
          })
        }
      }
    })
  },

  onSubmit: function () {
    this.cloudUploadFile();
  },

  cloudUploadFile: function () {
    wx.showLoading({
      title: '提交中'
    })
    const filePath = this.product.getValue('icon');
    const cloudPath = 'product_icon_' + Date.now() + filePath.match(/\.[^.]+?$/)[0];
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        this.product.setValue('icon', res.fileID);
      },
      fail: e => {
        wx.showToast({
          icon: 'none',
          title: '图片上传失败',
        })
      },
      complete: () => {
        this.product.addInDB({
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
            this.product.clearValue();
            this.setData({
              nameInput: null,
              describeInput: null,
              priceInput: null,
              index: null,
              imgList: [],
              isComplete: false
            })
          }
        });
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

>>>>>>> Stashed changes
  }
})