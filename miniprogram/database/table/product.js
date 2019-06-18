class Product {
  constructor() {
    this[Symbol("tableName")] = 'product';
    this.classify = null;
    this.icon = null;
    this.name = null;
    this.describe = null;
    this.price = null;
    this.status = null;
    this.sort = 'not use';
  }
}

export default Product;