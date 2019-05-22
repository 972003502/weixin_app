//app.js
import extend from './components/mp-extend/extend-config.js';
App = extend.App
Page = extend.Page
Component = extend.Component

App({
  onLaunch: function () {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {}
  },

  onShow() {

  },
})
