class DataBaseObject {
  constructor(dbTable) {
    this._fieids = dbTable;
    this._tableName = this._fieids[Object.getOwnPropertySymbols(this._fieids)[0]];
    this._db = wx.cloud.database();
    this._dataCollection = [];
  }

  get fieids() {
    return this._fieids;
  }

  get dataCollection() {
    return this._dataCollection;
  }

  getValue(fieidName) {
    return this._fieids[fieidName];
  }

  setValue(fieidName, fieidValue) {
    if (fieidName in this._fieids) {
      this._fieids[fieidName] = fieidValue;
    } else {
      console.log(`错误：table: "${this._tableName}" 不包含字段 "${fieidName}"`)
    }
  }

  clearValue() {
    for (let fieid in this._fieids) {
      if (fieid != "not use") {
        fieid = null;
      }
    }
  }

  isContainNull() {
    for (let key in this._fieids) {
      if (!this._fieids[key]) return false;
    }
    return true;
  }

  innerQueryBy(fieidName) {
    if (fieidName in this._fieids) {
      let fieidValues = [];
      let result = [];
      for (let obj of this._dataCollection) {
        if (!fieidValues.includes(obj[fieidName])) {
          fieidValues.push(obj[fieidName]);
          result.push(this._dataCollection.filter(item => item[fieidName] == obj[fieidName]));
        }
      }
      return result;
    } else {
      console.log(`错误：table: "${this._tableName}" 不包含字段 "${fieidName}"`)
    }
  }

  queryInDb(obj) {
    let callBack = {
      success: obj.success || function () { },
      fail: obj.fail || function () { },
      complete: obj.complete || function () { }
    }
    if (obj.where || false) {
      // 过滤无效字段
      let newWhere = {};
      for (let where in obj.where) {
        if (where in this._fieids) {
          newWhere[where] = obj.where[where];
        }
      }
      this._db.collection(this._tableName).where(newWhere).get({
        success: (res) => {
          this._dataCollection = res.data;
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
    } else {
      this._db.collection(this._tableName).get({
        success: (res) => {
          this._dataCollection = res.data;
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
  }

  addInDB(obj) {
    let callBack = {
      success: obj.success || function () { },
      fail: obj.fail || function () { },
      complete: obj.complete || function () { }
    }
    this._db.collection(this._tableName)
      .add({
        data: obj.data || this._fieids,
        success: (res) => {
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

  delInDB(obj) {
    let callBack = {
      success: obj.success || function () { },
      fail: obj.fail || function () { },
      complete: obj.complete || function () { },
      completeAll: obj.completeAll || function () { }
    }
    for (let data of obj.data) {
      try {
        let res = this._db.collection(this._tableName).doc(data).remove();
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

  updInDb() {

  }
};

export default DataBaseObject;