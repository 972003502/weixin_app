import table_Projuct from '../../database/table/Product.js';
import DataBaseObject from '../../database/DataBaseObject.js';
import FileManager from '../../module/fileManager/fileManager.js';

Page({
  data: {
    imgList: [],
    picker: ['Coffee', 'Tea', 'Soda'],
    isComplete: true
  },

  onLoad: function (options) {
    this.fileManager = new FileManager();
    this.oldProduct = this.fileManager.storageInfo.map.get(options.id);
    this.newProduct = new DataBaseObject(table_Projuct);
    this.setData({
      nameInput: this.oldProduct.name,
      describeInput: this.oldProduct.describe,
      priceInput: this.oldProduct.price,
      index: this.data.picker.indexOf(this.oldProduct.classify),
      imgList: [this.oldProduct.icon],
      isComplete: true
    })
    this.updFlageList = [];
    this.newProduct.setValue('status', 2); // status值 0：无变化 1：新增 2：更新 3：删除
    this.newProduct.setValue('classify', this.oldProduct.classify);
    this.newProduct.setValue('name', this.oldProduct.name);
    this.newProduct.setValue('describe', this.oldProduct.describe);
    this.newProduct.setValue('price', this.oldProduct.price);
    this.newProduct.setValue('icon', this.oldProduct.orgIcon);
  },

  onShow: function () {
    this.setData({
      isComplete: this.newProduct.isContainNull()
    })
  },

  isUpdate: function (fieid, value) {
    if (this.oldProduct[fieid] == value) {
      return false;
    }
    return true;
  },

  onPickerChange: function (e) {
    this.newProduct.setValue('classify', this.data.picker[e.detail.value]);
    this.updFlageList[0] = this.isUpdate('classify', this.data.picker[e.detail.value]);
    this.setData({
      index: e.detail.value,
      isComplete: this.newProduct.isContainNull()
    })
  },

  onNameInput: function (e) {
    this.newProduct.setValue('name', e.detail.value);
    this.updFlageList[1] = this.isUpdate('name', e.detail.value);
    this.setData({
      isComplete: this.newProduct.isContainNull()
    })
  },

  onDescribeInput: function (e) {
    this.newProduct.setValue('describe', e.detail.value);
    this.updFlageList[2] = this.isUpdate('describe', e.detail.value);
    this.setData({
      isComplete: this.newProduct.isContainNull()
    })
  },

  onPriceInput: function (e) {
    this.newProduct.setValue('price', e.detail.value);
    this.updFlageList[3] = this.isUpdate('price', e.detail.value);
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
        this.updFlageList[4] = this.isUpdate('icon', res.tempFilePaths[0]);
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
    let updFlage = this.updFlageList.includes(true);
    console.log(this.updFlageList);
    if (updFlage) {
      this.cloudUploadFile();
    } else {
      wx.showModal({
        title: '提示',
        content: '并未做出任何修改，无需保存',
        showCancel: false,
        confirmText: '确定'
      })
    }
  },

  cloudUploadFile: function () {
    wx.showLoading({
      title: '提交中'
    })
    if (this.updFlageList[4]) {
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
          wx.hideLoading();
          this.updProduct();
        }
      })
    } else {
      wx.hideLoading();
      this.updProduct();
    }
  },

  updProduct: function () {
    this.newProduct.updInDb({
      dataID: this.oldProduct._id,
      success: res => {
        wx.showToast({
          title: '提交成功',
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '提交失败'
        })
      }
    });
  }
})