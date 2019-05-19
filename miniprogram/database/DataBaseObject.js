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
    // 过滤无效字段
    let newWhere = {};
    for (let where in obj.where) {
      if (where in this._fieids) {
        newWhere[where] = obj.where[where];
      }
    }
    newWhere._openid = getApp().globalData.openid;
    this._db.collection(this._tableName).where(newWhere).get({
      success: (res) => {
        this._dataCollection = res.data;
        obj.success(res);
      },
      fail: (e) => {
        obj.fail(e);
      },
      complete: () => {
        obj.complete();
      }
    })
  }

  addInDB(callBackObj) {
    this._db.collection(this._tableName)
      .add({
        data: this._fieids,
        success: (res) => {
          callBackObj.success(res);
        },
        fail: (e) => {
          callBackObj.fail(e);
        },
        complete: () => {
          callBackObj.complete();
        }
      })
  }

  delInDB() {

  }

  updInDb() {

  }
};

export default DataBaseObject;