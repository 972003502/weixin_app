Page({
  data: {
    src: '',
    width: 300,//宽度
    height: 170//高度
  },

  onLoad: function (options) {
    this.cropper = this.selectComponent("#image-cropper");
    this.setData({
      src: options.src
    });
  },

  cropperload(e) {
    console.log('cropper加载完成');
  },

  loadimage(e) {
  },

  getImgSrc() {
    this.cropper.getImg((imageObj) => {
      let pages = getCurrentPages();
      let addProductPage = pages[pages.length - 2];
      addProductPage.product.setValue('icon', imageObj.url);
      addProductPage.setData({
        imgList: [imageObj.url]
      }, wx.navigateBack({})
      )
    });

    // if (wx.canIUse('compressImage')) {
    //   this.cropper.getImg((imageObj) => {
    //     wx.compressImage({
    //       src: imageObj.url, // 图片路径
    //       quality: 10, // 压缩质量
    //       success: (res) => {
    //         let pages = getCurrentPages();
    //         let addProductPage = pages[pages.length - 2];
    //         addProductPage.product.setValue('icon', res.tempFilePath);
    //         addProductPage.setData({
    //           imgList: [res.tempFilePath]
    //         }
    //         )
    //       },
    //       fail: e => {
    //         console.log("压缩图片失败")
    //       },
    //       complete: () => {
    //         wx.navigateBack();
    //       }
    //     })
    //   });
    // } else {
    //   this.cropper.getImg((imageObj) => {
    //     let pages = getCurrentPages();
    //     let addProductPage = pages[pages.length - 2];
    //     addProductPage.product.setFieidValue('icon', imageObj.url);
    //     addProductPage.setData({
    //       imgList: [imageObj.url]
    //     }, wx.navigateBack({})
    //     )
    //   });
    // }
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
