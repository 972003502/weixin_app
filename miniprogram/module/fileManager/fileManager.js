class FileManager {
  constructor() {
    this._fileMgr = wx.getFileSystemManager();
    this._fileList = [];
    this._fileSize = 0;
    this._filePaths = [];
    this._createTime = []
  }

  get fileSize() {
    return this._fileSize;
  }

  get filePaths() {
    return this._filePaths;
  }

  get createTime() {
    return this._createTime;
  }

  get storageKeys() {
    return this._storageKeys;
  }

  // download() {
  //   wx.cloud.downloadFile({
  //     fileID: icon
  //   }).then(res => {
  //     tempFilePaths.push(res.tempFilePath);
  //     console.log(icons.indexOf(icon), res.tempFilePath)
  //   })
  // }

  saveFile(obj) {
    let callBack = {
      success: obj.success || function () { },
      fail: obj.fail || function () { },
      complete: obj.complete || function () { }
    }
    for (let path of obj.tempFilePaths) {
      this._fileMgr.saveFile({
        tempFilePath: path,
        success: (res) => {
          this._filePaths.push(res.savedFilePath);
          wx.setStorageSync(`${obj.fileKey(path)}`, res.savedFilePath);
          callBack.success(res);
        },
        fail: (e) => {
          console.log(e);
          callBack.fail(e);
        },
        complete: () => {
          if (obj.times == "single") {
            console.log(obj.tempFilePaths, "save single success");
            callBack.complete();
          }
          else {
            if (this._filePaths.length == obj.tempFilePaths.length) {
              console.log(obj.tempFilePaths, "save all success");
              callBack.complete();
            }
          }
        }
      })
    }
  }

  getSavedFileInfo(obj) {
    let callBack = {
      success: obj.success || function () { },
      fail: obj.fail || function () { },
      complete: obj.complete || function () { }
    }
    this._fileMgr.getSavedFileList({
      success: (res) => {
        this._fileList = res.fileList
        for (let file of res.fileList) {
          this._fileSize += file.size;
          this._createTime.push(file.createTime);
        }
        callBack.success(res);
      },
      fail: (e) => {
        console.log(e);
        callBack.fail(e);
      },
      complete: () => {
        console.log("缓存大小", `${this._fileSize / 1000}KB`);
        console.log("缓存路径", this._filePaths);
        callBack.complete();
      }
    })
  }

  clearFile(obj) {
    let callBack = {
      success: obj.success || function () { },
      fail: obj.fail || function () { },
      complete: obj.complete || function () { }
    }
    if (obj.fileKeys || false) {
      for (let fileKey of obj.fileKeys) {
        this._fileMgr.removeSavedFile({
          filePath: wx.getStorageSync(fileKey),
          success: (res) => {
            wx.removeStorageSync(fileKey);
            console.log(`clear ${fileKey} success`);
            callBack.success(res);
          },
          fail: (e) => {
            console.log(e);
            callBack.fail(e);
          },
          complete: () => {
            callBack.complete();
          }
        })
      }
    } else {
      for (let path of this._filePaths) {
        this._fileMgr.removeSavedFile({
          filePath: path,
          success: (res) => {
            console.log("clear all success");
            callBack.success(res);
          },
          fail: (e) => {
            console.log(e);
            callBack.fail(e);
          },
          complete: () => {
            callBack.complete();
          }
        })
        wx.clearStorageSync();
      }
    }
  }
}

export default FileManager;