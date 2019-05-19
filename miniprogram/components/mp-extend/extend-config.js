import mpExtend from './mp-extend.js'

// 以mpExtend(...)的形式引入多个扩展
// 如果不需要某一个混入项的功能，直接注释掉即可
import extendPage from './extend-page.js'
import extendPreload from './extend-preload.js'

// mpExtend(extendTest); // 这是一个比较完整的测试用例
mpExtend(extendPage);
mpExtend(extendPreload);

// 暴露App、Page、Component构造函数
export default {
  App: mpExtend.App,
  Page: mpExtend.Page,
  Component: mpExtend.Component,
};