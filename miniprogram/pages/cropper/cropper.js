Page({
  data: {
    src: '',
    width: 300,//宽度
    height: 250//高度
  },

  onLoad: function (options) {
    this.cropper = this.selectComponent("#image-cropper");
    this.cropper.imgReset();
    this.setData({
      src: options.src
    });
  },

  onReady: function () {

  },
  cropperload(e) {
    console.log('cropper加载完成');
  },
  loadimage(e) {
    wx.hideLoading();
    this.cropper.imgReset();
  },

  getImgSrc() {
    this.cropper.getImg((imageObj) => {
      let pages = getCurrentPages();
      let addProductPage = pages[pages.length - 2];
      addProductPage.setData({
        imgList: [imageObj.url],
        product_icon: imageObj.url
      }, wx.navigateBack({})
      )
    });
  },

  chooseImage() {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success(res) {
        const tempFilePaths = res.tempFilePaths[0];
        //重置图片角度、缩放、位置
        that.cropper.imgReset();
        that.setData({
          src: tempFilePaths
        });
      }
    })
  },

  rotate() {
    //在用户旋转的基础上旋转90°
    this.cropper.setAngle(this.cropper.data.angle += 90);
  },
})
