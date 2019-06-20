import table_Projuct from '../../database/table/Product.js';
import DataBaseObject from '../../database/DataBaseObject.js';
import FileManager from '../../module/fileManager/fileManager.js';

Page({
  data: {
    products: []
  },

  onLoad: function (options) {
    this.fileManager = new FileManager();
    this.product = new DataBaseObject(table_Projuct);
  },

  onShow: function () {
    this.onInit();
  },

  onInit: function () {
    let productStorage = this.fileManager.storageInfo.values;
    this.setData({
      products: this.groupBy(productStorage, 'classify')
    })
  },

  onAddProduct: function () {
    wx.navigateTo({
      url: '../addProduct/addProduct'
    })
  },

  onActionSheetTap: function (e) {
    const that = this;
    let productID = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['修改', '删除'],
      itemColor: '#FF3030',
      success(e) {
        if (e.tapIndex == 1) {
          wx.showModal({
            content: '是否删除产品',
            confirmText: '确定',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                that.onDelProduct(productID);
              }
            }
          })
        } else if (e.tapIndex == 0) {
          wx.navigateTo({
            url: '../updProduct/updProduct?id=' + productID
          })
        }
      }
    })
  },

  onDelProduct: function (productID) {
    let productInfo = this.fileManager.storageInfo.map.get(productID);
    this.product.delInDB({
      data: [productID],
      completeAll: () => {
        wx.removeSavedFile({
          filePath: this.fileManager.storageInfo.map.get(productID).icon,
          success: (res) => {
            wx.removeStorageSync(productID);
            this.fileManager.getStorageInfoSync();
            this.onInit();
            wx.showToast({
              title: '操作成功',
            })
          }
        })
      }
    })
    wx.cloud.deleteFile({
      fileList: [productInfo.orgIcon]
    }).then(res => {
      console.log("云存储删除成功", res.fileList);
    })
  },

  onPullDownRefresh: function () {
    wx.showLoading({
      title: '加载中'
    })
    this.refreshPage();
  },

  refreshPage: function () {
    this.start = Date.now();
    this.newMap = new Map();
    this.product.queryInDb({
      success: res => {
        for (let obj of res.data) {
          this.newMap.set(obj._id, obj);
        }
      },
      complete: () => {
        let newList = [];
        let updList = [];
        let delList = [];
        for (let entry of this.newMap) {
          if (entry[1].status == 1) { // 新增
            newList.push(entry[1].icon);
          } else if (entry[1].status == 2) { // 更新
            updList.push(entry[0]);
          } else if (entry[1].status == 3) { // 删除
            delList.push(entry[0]);
          } else {
            console.log("产品已存在且无变更");
          }

          // if (!this.fileManager.storageInfo.keys.includes(entry[0])) {
          //   newList.push(entry[1].icon);
          // } else {
          //   console.log("重复值");
          // }
        }

        if (!newList.length || !updList.length || !delList.length) {
          if (!newList.length) {
            this.downloadImage(newList);
          }
          if (!updList.length) {
            this.updProduct(updList);
          }
          if (!delList.length) {
            this.delProduct(delList);
          }
        } else {
          wx.stopPullDownRefresh({
            complete() {
              wx.hideLoading();
            }
          })
        }
      }
    })
  },

  downloadImage: function (fileList) {
    this.fileManager.download({
      tempFilePaths: fileList,
      completeAll: () => {
        this.cacheImage();
      }
    });
  },

  updProduct: function () {

  },

  delProduct: function () {

  },

  cacheImage: function () {
    let newObj;
    this.fileManager.saveFileSync({
      setKey: (value) => {
        for (let entry of this.newMap) {
          if (entry[1].icon == value) {
            newObj = entry[1];
            newObj.orgIcon = value;
            return entry[0];
          }
        }
      },
      setValue: (value) => {
        newObj.icon = value;
        return newObj;
      },
      completeAll: () => {
        this.fileManager.syncToGlobalStorage();
        this.onInit();
        wx.stopPullDownRefresh({
          complete() {
            wx.hideLoading();
          }
        })
        let end = Date.now();
        console.log("耗时", `${end - this.start}ms`);
      }
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
  }
})