class Product {
  _fieids = {
    classify: null,
    icon: null,
    name: null,
    describe: null,
    price: null,
    status: null,
    sort: null
  }
  get fieids() {
    return this._fieids;
  }
  setFieidValue(fieidName, fieidValue) {
    if (fieidName in this._fieids) {
      this._fieids[fieidName] = fieidValue;
    } else {
      console.log('错误："class Product" 不包含字段' + "\"" + fieidName + "\"")
    }
  }
  getFieidValue(fieidName) {
    return this._fieids[fieidName];
  }
  clear() {
    for(let obj in this._fieids) {
      obj = null;
    }
  }
};

export default Product;