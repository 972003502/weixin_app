// 将callback转化为promise风格
function promisify(fn) {
  return function (obj) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res);
      }
      obj.fail = function (res) {
        reject(res)
      }
      obj.complete = function () { }
      fn(obj);
    });
  };
};

export default promisify;