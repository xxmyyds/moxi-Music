// pages/recommendSong/recommendSong.js
import PubSub from "pubsub-js";
import request from "../../../utils/request";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    day: "", // 日期天数
    month: "", // 日期月份
    year: "", // 日期年份
    recommendList: [], // 推荐列表数据
    index: 0, // 音乐的下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    PubSub.unsubscribe('switchType')
    // 判断用户是否登录
    let userInfo = wx.getStorageSync("userInfo");
    if (!userInfo) {
      wx.showToast({
        title: "请先登录",
        icon: "none",
        success: () => {
          // 跳转至登录界面
          wx.reLaunch({
            url: "/pages/login/login",
          });
        },
      });
    }
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    // 显示正在加载
    wx.showLoading({
      title: "加载中",
    });
    this.getRecommendList();
    // 订阅来自songDetial页面发布的消息
    PubSub.subscribe("switchType", (msg, { type, mode }) => {
      let { recommendList, index } = this.data;
      if (type === "pre") {
        if (mode === 2) {
          let idx = Math.floor(Math.random() * recommendList.length)
          while (idx === index) {
            idx = Math.floor(Math.random() * recommendList.length)
          }
          index = idx
        } else {
          index === 0 && (index = recommendList.length);
          index--;
        }
      } else {
        if (mode === 2) {
          let idx = Math.floor(Math.random() * recommendList.length)
          while (idx === index) {
            idx = Math.floor(Math.random() * recommendList.length)
          }
          index = idx
        } else {
          index === recommendList.length - 1 && (index = -1);
          index++;
        }
      }
      // 更新下标
      this.setData({
        index,
      });
      let musicId = recommendList[index].id;
      // 将musicId回传给recommendSong页面
      PubSub.publish("musicId", musicId);
    });
  },
  // 获取用户每日推荐的数据
  async getRecommendList() {
    // 获取每日推荐的数据
    let recommendListData = await request("/recommend/songs");
    wx.hideLoading();
    this.setData({
      recommendList: recommendListData.recommend,
    });
  },
  // 跳转至songDetail页面
  toSongDetail(e) {
    let { song, index } = e.currentTarget.dataset;
    this.setData({
      index,
    });
    // 路由传参query参数
    wx.navigateTo({
      url: "/songPackage/pages/songDetail/songDetail?musicId=" + song.id,
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },
});
