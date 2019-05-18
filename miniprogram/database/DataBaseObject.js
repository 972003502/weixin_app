class DataBaseObject {
  constructor(dbTable) {
    this._fieids = dbTable;
  }

  get fieids() {
    return this._fieids;
  }

  getValue(fieidName) {
    return this._fieids[fieidName];
  }

  setValue(fieidName, fieidValue) {
    if (fieidName in this._fieids) {
      this._fieids[fieidName] = fieidValue;
    } else {
      console.log('错误："class Product" 不包含字段' + "\"" + fieidName + "\"")
    }
  }

  clearValue() {
    for (let obj in this._fieids) {
      obj = null;
    }
  }

  isContainNull() {
    for (let key in this._fieids) {
      if (!this._fieids[key]) return false;
    }
    return true;
  }

  addInDB(obj) {
    const db = wx.cloud.database();
    db.collection(this._fieids[Object.getOwnPropertySymbols(this._fieids)[0]])
    .add({
      data: this._fieids,
      success: obj.success,
      fail: obj.fail,
      complete: obj.complete
    })
  }

  delInDB() {

  }

  updInDb() {

  }
};

export default DataBaseObject;