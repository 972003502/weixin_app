import regeneratorRuntime from '../../module/regenerator-runtime/runtime.js';
import promisify from '../promisify/promisify.js';

class FileManager {
  constructor() {
    this._fileMgr = wx.getFileSystemManager();
    this._filesInfo = {
      list: [],
      paths: [],
      size: 0
    };
    this.getStorageInfoSync();
  }

  get fileMgr() {
    return this._fileMgr;
  }

  get filesInfo() {
    return this._filesInfo;
  }

  getStorageInfoSync() {
    this._filesInfo.paths = [];
    let res = wx.getStorageInfoSync();
    for (let key of res.keys) {
      let value = wx.getStorageSync(key);
      this._filesInfo.paths.push(value);
    }
  }

  async downloadSync(obj) {
    let callBack = {
      success: obj.success || function () { },
      fail: obj.fail || function () { },
      complete: obj.complete || function () { },
      completeAll: obj.completeAll || function () { }
    }
    for (let path of obj.tempFilePaths) {
      try {
        let res = await wx.cloud.downloadFile({
          fileID: path
        });
        callBack.success(res, path);
      } catch (err) {
        console.log(err);
        callBack.fail(err);
      } finally {
        callBack.complete();
      }
    }
    callBack.completeAll();
  }

  async saveFileSync(obj) {
    let saveFilePromise = promisify(this._fileMgr.saveFile);
    let callBack = {
      success: obj.success || function () { },
      fail: obj.fail || function () { },
      complete: obj.complete || function () { },
      completeAll: obj.completeAll || function () { }
    }
    for (let path of obj.tempFilePaths) {
      try {
        let res = await saveFilePromise({
          tempFilePath: path
        });
        callBack.success(res, path);
      } catch (err) {
        console.log(err);
        callBack.fail(err);
      } finally {
        callBack.complete();
      }
    }
    callBack.completeAll();
  }

  getSavedFileInfo(obj) {
    this._filesInfo = {
      list: [],
      paths: [],
      size: 0
    };
    let callBack = {
      success: obj.success || function () { },
      fail: obj.fail || function () { },
      complete: obj.complete || function () { }
    }
    this._fileMgr.getSavedFileList({
      success: (res) => {
        this._filesInfo.list = res.fileList;
        for (let file of res.fileList) {
          this._filesInfo.paths.push(file.filePath);
          this._filesInfo.size += file.size;
        }
        callBack.success(res);
      },
      fail: (e) => {
        console.log(e);
        callBack.fail(e);
      },
      complete: () => {
        console.log("缓存大小", `${this._filesInfo.size / 1000}KB`);
        console.log("缓存路径", this._filesInfo.paths);
        callBack.complete();
      }
    })
  }

  async clearFile(obj) {
    let removeFilePromise = promisify(this._fileMgr.removeSavedFile);
    let callBack = {
      success: obj.success || function () { },
      fail: obj.fail || function () { },
      complete: obj.complete || function () { },
      completeAll: obj.completeAll || function () { }
    }
    if (obj.fileKeys || false) {
      for (let fileKey of obj.fileKeys) {
        try {
          await removeFilePromise({
            filePath: wx.getStorageSync(fileKey)
          });
          callBack.success(path);
        } catch (err) {
          console.log(err);
          callBack.fail(err);
        } finally {
          callBack.complete();
        }
      }   
    } else {
      this.getStorageInfoSync();
      for (let path of this._filesInfo.paths) {
        try {
          await removeFilePromise({
            filePath: path
          });
          callBack.success(path);
        } catch (err) {
          console.log(err);
          callBack.fail(err);
        } finally {
          callBack.complete();
        }
      }
    }  
    callBack.completeAll();
  }

  // clearFile(obj) {
  //   let callBack = {
  //     success: obj.success || function () { },
  //     fail: obj.fail || function () { },
  //     complete: obj.complete || function () { }
  //   }
  //   if (obj.fileKeys || false) {
  //     for (let fileKey of obj.fileKeys) {
  //       this._fileMgr.removeSavedFile({
  //         filePath: wx.getStorageSync(fileKey),
  //         success: (res) => {
  //           wx.removeStorageSync(fileKey);
  //           console.log(`clear ${fileKey} success`);
  //           callBack.success(res);
  //         },
  //         fail: (e) => {
  //           console.log(e);
  //           callBack.fail(e);
  //         },
  //         complete: () => {
  //           callBack.complete();
  //         }
  //       })
  //     }
  //   } else {
  //     this._fileList = [];
  //     this._filePaths = [];
  //     this._createTime = [];
  //     wx.clearStorageSync();
  //     for (let path of this._filePaths) {
  //       this._fileMgr.removeSavedFile({
  //         filePath: path,
  //         success: (res) => {
  //           console.log("clear all success");
  //           callBack.success(res);
  //         },
  //         fail: (e) => {
  //           console.log(e);
  //           callBack.fail(e);
  //         },
  //         complete: () => {
  //           callBack.complete();
  //         }
  //       })
  //     }
  //   }
  // }
}

export default FileManager;