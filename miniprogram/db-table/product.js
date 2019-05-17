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
  get fieids() {
    return this._fieids;
  }
};

export default Product;