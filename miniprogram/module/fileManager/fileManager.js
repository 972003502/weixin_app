import regeneratorRuntime from '../../module/regenerator-runtime/runtime.js';
import promisify from '../promisify/promisify.js';

class FileManager {
  constructor() {
    this._fileMgr = wx.getFileSystemManager();
    this._storageAdd = new Map();
    this._storageRemove = new Map();
    this._downloadMap = new Map();
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
    this.getSavedFileInfo({});
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
    for (let storage of this._storageAdd) {
      wx.setStorageSync(storage[0], storage[1]);
    }
    for (let storage of this._storageRemove) {
      wx.removeStorageSync(storage[0]);
    }
    //this._storageAdd.clear();
    this._storageRemove.clear();
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
        this._downloadMap.set(path, res.tempFilePath);
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
          let newKey = obj.setKey(path);
          if (this._storageAdd.has(newKey) || this._storageInfo.map.has(newKey)) {
            console.log("缓存key值重复", newKey);
            return;
          }
          let res = await saveFilePromise({
            tempFilePath: path
          });
          this._storageAdd.set(newKey, res.savedFilePath);
          callBack.success(res);
        } catch (err) {
          console.log(err);
          callBack.fail(err);
        } finally {
          callBack.complete();
        }
      }
    } else {
      for (let entry of this._downloadMap) {
        try {
          let newKey = obj.setKey(entry[0]);
          if (this._storageAdd.has(newKey) || this._storageInfo.map.has(newKey)) {
            console.log("缓存key值重复", newKey);
            return;
          }
          let res = await saveFilePromise({
            tempFilePath: entry[1]
          });
          this._storageAdd.set(newKey, res.savedFilePath);
          callBack.success(res);
        } catch (err) {
          console.log(err);
          callBack.fail(err);
        } finally {
          callBack.complete();
        }
      }
    }
    this._downloadMap.clear();
    this.getSavedFileInfo({});
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
          let path = this._storageAdd.get(fileKey) || this._storageInfo.map.get(fileKey);
          await removeFilePromise({
            filePath: path
          });
          this._storageAdd.delete(fileKey);
          this._storageRemove.set(fileKey, path);
          callBack.success();
        } catch (err) {
          console.log(err);
          callBack.fail(err);
        } finally {
          callBack.complete();
        }
      }
    } else {
      // let removeMap = this._storageInfo.map;
      // for (let entry of this._storageAdd) {
      //   removeMap.set(entry[0], entry[1]);
      // }
      // if (removeMap.size != 0) {
      //   for (let entry of removeMap) {
      //     try {
      //       await removeFilePromise({
      //         filePath: entry[1]
      //       });
      //       this._storageRemove.set(entry[0], entry[1]);
      //       callBack.success();
      //     } catch (err) {
      //       console.log(err);
      //       callBack.fail(err);
      //     } finally {
      //       callBack.complete();
      //     }
      //   }
      //   this._storageAdd.clear();
      // } else {
      //   for (let path of this._filesInfo.paths) {
      //     try {
      //       await removeFilePromise({
      //         filePath: path
      //       });
      //       callBack.success();
      //     } catch (err) {
      //       console.log(err);
      //       callBack.fail(err);
      //     } finally {
      //       callBack.complete();
      //     }
      //   }
      // }

      for (let path of this._filesInfo.paths) {
        try {
          await removeFilePromise({
            filePath: path
          });
          for (let entry of this._storageInfo.map) {
            if (entry[1] == path) {
              this._storageRemove.set(entry[0], entry[1]);
            }
          }
          callBack.success();
        } catch (err) {
          console.log(err);
          callBack.fail(err);
        } finally {
          callBack.complete();
        }
      }
      this._storageAdd.clear();
    }
    this.getSavedFileInfo({});
    callBack.completeAll();
  }
}

export default FileManager;