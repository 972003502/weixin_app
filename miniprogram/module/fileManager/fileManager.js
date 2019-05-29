import regeneratorRuntime from '../../module/regenerator-runtime/runtime.js';
import promisify from '../promisify/promisify.js';

class FileManager {
  constructor() {
    this._fileMgr = wx.getFileSystemManager();
    this._innerStorageAdd = new Map();
    this._innerStorageRemove = new Map();
    this._filesInfo = {
      list: [],
      paths: [],
      size: 0
    };
    this._storageInfo = {
      keys: [],
      values: [],
      map: new Map(),
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

  syncToGlobalStorage() {
    for (let innerStorage of this._innerStorageAdd) {
      wx.setStorageSync(innerStorage[0], innerStorage[1]);
    }
    for (let innerStorage of this._innerStorageRemove) {
      wx.removeStorageSync(innerStorage[0]);
    }
    this._innerStorageAdd.clear();
    this._innerStorageRemove.clear();
    this.getStorageInfoSync();
  }

  getStorageInfoSync() {
    let res = wx.getStorageInfoSync();
    this._storageInfo.values = [];
    this._storageInfo.map.clear();
    this._storageInfo.keys = res.keys;
    this._storageInfo.currentSize = res.currentSize;
    this._storageInfo.limitSize = res.limitSize;
    for (let key of res.keys) {
      let value = wx.getStorageSync(key);
      this._storageInfo.values.push(value);
      this._storageInfo.map.set(key, value);
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
        this._innerStorageAdd.set(path, res.tempFilePath);
        callBack.success(res);
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
    if (obj.tempFilePaths || false) {
      for (let path of obj.tempFilePaths) {
        try {
          let newPath = path;
          let res = await saveFilePromise({
            tempFilePath: path
          });
          this._innerStorageAdd.set(newPath, res.savedFilePath);
          callBack.success(res);
        } catch (err) {
          console.log(err);
          callBack.fail(err);
        } finally {
          callBack.complete();
        }
      }
    } else {
      for (let innerStorage of this._innerStorageAdd) {
        try {
          let res = await saveFilePromise({
            tempFilePath: innerStorage[1]
          });
          this._innerStorageAdd.set(innerStorage[0], res.savedFilePath);
          callBack.success(res);
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
          let path = this._innerStorageAdd.get(fileKey) || this._storageInfo.map.get(fileKey);
          await removeFilePromise({
            filePath: path
          });
          this._innerStorageAdd.delete(fileKey);
          this._innerStorageRemove.set(fileKey, path);
          callBack.success();
        } catch (err) {
          console.log(err);
          callBack.fail(err);
        } finally {
          callBack.complete();
        }
      }
    } else {
      for (let storageMap of this._storageInfo.map) {
        try {
          await removeFilePromise({
            filePath: storageMap[1]
          });
          this._innerStorageRemove.set(storageMap[0], storageMap[1]);
          callBack.success();
        } catch (err) {
          console.log(err);
          callBack.fail(err);
        } finally {
          callBack.complete();
        }
      }
      this._innerStorageAdd.clear();
    }
    this.getSavedFileInfo({});
    callBack.completeAll();
  }
}

export default FileManager;