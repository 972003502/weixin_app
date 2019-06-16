import table_Projuct from '../../database/table/product.js';
import DataBaseObject from '../../database/DataBaseObject.js';
import FileManager from '../../module/fileManager/fileManager.js';

Page({
  /**
   * 页面的初始数据
   */
  //path: "pages/productManagement/productManagement",
  data: {
    products: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fileManager = new FileManager();
    this.product = new DataBaseObject(table_Projuct);
  },

  // 预加载
  // onPreload: function () {
  //   this.fileManager = new FileManager();
  //   this.product = new DataBaseObject(table_Projuct);
  //   this.onInit();
  //   console.log("已预加载");
  // },

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

  actionSheetTap: function (e) {
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

  onAddProduct: function () {
    wx.navigateTo({
      url: '../addProduct/addProduct'
    })
  },

  onPullDownRefresh: function () {
    wx.showLoading({
      title: '加载中'
    })
    this.onRefresh();
  },

  onShow: function () {
    this.onInit();
  },

  onRefresh: function () {
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
        for (let entry of this.newMap) {
          if (!this.fileManager.storageInfo.keys.includes(entry[0])) {
            newList.push(entry[1].icon);
          } else {
            console.log("重复值");
          }
        }
        if (newList.length != 0) {
          this.downloadImage(newList);
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
  }

  // onImageLoad: function () {
  // },
})