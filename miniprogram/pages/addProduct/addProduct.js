// miniprogram/pages/addProduct/addProduct.js
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

  onPickerChange(e) {
    this.product.setValue('classify', this.data.picker[e.detail.value]);
    this.setData({
      index: e.detail.value,
      isComplete: this.product.isContainNull()
    })
  },

  onNameInput(e) {
    this.product.setValue('name', e.detail.value);
    this.setData({
      isComplete: this.product.isContainNull()
    })
  },

  onDescribeInput(e) {
    this.product.setValue('describe', e.detail.value);
    this.setData({
      isComplete: this.product.isContainNull()
    })
  },

  onPriceInput(e) {
    this.product.setValue('price', e.detail.value);
    this.setData({
      isComplete: this.product.isContainNull()
    })
  },

  onChooseImage() {
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

  onViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },

  onDelImg(e) {
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

  onSubmit() {
    this.cloudUploadFile();
  },

  cloudUploadFile() {
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
  }
})