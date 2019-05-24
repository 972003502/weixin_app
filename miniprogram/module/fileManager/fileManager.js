class FileManager {
  constructor() {
    this._fileMgr = wx.getFileSystemManager();
    this._fileSize = 0;
    this._filePaths = [];
    this._createTime = [];
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

  saveFile(obj) {
    for (let path of obj.tempFilePaths) {
      _fileMgr.saveFile({
        tempFilePath: path,
        success: (res) => {
          _filePaths.push(res.savedFilePath);
          wx.setStorageSync(`${path}`, res.savedFilePath);
          obj.success();
        },
        fail: (e) => {
          console.log(e);
          obj.fail(e);
        },
        complete: () => {
          if (obj.times == "single") {
            console.log(obj.tempFilePaths, "save single success");
            obj.complete();
          }
          else {
            if (_filePaths.length == obj.completeFreq) {
              console.log(obj.tempFilePaths, "save all success");
              obj.complete();
            }
          }
        }
      })
    }
  }

  downloadFile() {
    wx.cloud.downloadFile({

    })
  }

  getSavedFileInfo(obj) {
    _fileMgr.getSavedFileList({
      success: (res) => {
        if (obj.range == 'all') {
          for (let file of res.fileList) {
            this._fileSize += file.size;
            this._createTime.push(file.createTime);
          }
        }
        else if (obj.range == 'single') {

        }
      },
      fail: (e) => {
        console.log(e);
        obj.fail(e);
      },
      complete: () => {
        console.log("缓存大小", `${this._fileSize / 1000}KB`);
        console.log("缓存路径", this._filePaths);
        obj.complete();
      }
    })
  }

  clearFile() {

  }
}