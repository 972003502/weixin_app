import table_Projuct from '../../database/table/Product.js';
import DataBaseObject from '../../database/DataBaseObject.js'

Page({
  data: {
    imgList: [],
    picker: ['Coffee', 'Tea', 'Soda'],
    isComplete: false
  },

  onLoad: function () {
    this.newProduct = new DataBaseObject(table_Projuct);
    this.newProduct.setValue('status', 1); // status值 0：无变化 1：新增 2：更新 3：删除
  },

  onShow: function () {
    this.setData({
      isComplete: this.newProduct.isContainNull()
    })
  },

  onPickerChange: function (e) {
    this.newProduct.setValue('classify', this.data.picker[e.detail.value]);
    this.setData({
      index: e.detail.value,
      isComplete: this.newProduct.isContainNull()
    })
  },

  onNameInput: function (e) {
    this.newProduct.setValue('name', e.detail.value);
    this.setData({
      isComplete: this.newProduct.isContainNull()
    })
  },

  onDescribeInput: function (e) {
    this.newProduct.setValue('describe', e.detail.value);
    this.setData({
      isComplete: this.newProduct.isContainNull()
    })
  },

  onPriceInput: function (e) {
    this.newProduct.setValue('price', e.detail.value);
    this.setData({
      isComplete: this.newProduct.isContainNull()
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
      }
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
          this.newProduct.setValue('icon', null);
          this.setData({
            isComplete: this.newProduct.isContainNull()
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
    const filePath = this.newProduct.getValue('icon');
    const cloudPath = 'product_icon_' + Date.now() + filePath.match(/\.[^.]+?$/)[0];
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        this.newProduct.setValue('icon', res.fileID);
      },
      fail: e => {
        wx.showToast({
          icon: 'none',
          title: '图片上传失败',
        })
      },
      complete: () => {
        this.newProduct.addInDB({
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
            this.newProduct.clearValue();
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