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
    this._storageInfo = {
      keys: [],
      values: [],
      currentSize: 0,
      limitSize: 0
    };
    this.getStorageInfoSync();
  }

  get fileMgr() {
    return this._fileMgr;
  }

  get filesInfo() {
    return this._filesInfo;
  }

  get storageInfo() {
    return this._storageInfo;
  }

  getStorageInfoSync() {
    let res = wx.getStorageInfoSync();
    this._storageInfo.values = [];
    this._storageInfo.keys = res.keys;
    this._storageInfo.currentSize = res.currentSize;
    this._storageInfo.limitSize = res.limitSize;
    for (let key of res.keys) {
      let value = wx.getStorageSync(key);
      this._storageInfo.values.push(value);
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
          let path = wx.getStorageSync(fileKey);
          await removeFilePromise({
            filePath: path
          });
          wx.removeStorageSync(fileKey);
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
      for (let path of this._storageInfo.values) {
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
      wx.clearStorageSync();
    }
    this.getSavedFileInfo({});
    this.getStorageInfoSync();
    callBack.completeAll();
  }
}

export default FileManager;