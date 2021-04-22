// pages/songList/songList.js

import PubSub from "pubsub-js";
import request from "../../utils/request";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    songListId: 0,// 标识歌单的id
    playList: [],// 歌单数据
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
    let songListId = options.songListId;
    this.setData({
      songListId,
    });
    this.getMusicList(songListId)
    // 订阅来自songDetial页面发布的消息
    PubSub.subscribe("switchType", (msg, { type, mode }) => {
      let { playList, index } = this.data;
      if (type === "pre") {
        if (mode === 2) {
          let idx = Math.floor(Math.random() * playList.tracks.length)
          while (idx === index) {
            idx = Math.floor(Math.random() * playList.tracks.length)
          }
          index = idx
        } else {
          index === 0 && (index = playList.tracks.length);
          index--;
        }
      } else {
        if (mode === 2) {
          let idx = Math.floor(Math.random() * playList.tracks.length)
          while (idx === index) {
            idx = Math.floor(Math.random() * playList.tracks.length)
          }
          index = idx
        } else {
          index === playList.tracks.length - 1 && (index = -1);
          index++;
        }
      }
      // 更新下标
      this.setData({
        index,
      });
      let musicId = playList.tracks[index].id;
      // 将musicId回传给songList页面
      PubSub.publish("musicId", musicId);
    });
  },
  async getMusicList(songListId) {
    let playListData = await request('/playlist/detail', { id: songListId })
    playListData.playlist.playCount = this.numberFormat(playListData.playlist.playCount, 0)
    playListData.playlist.subscribedCount = this.numberFormat(playListData.playlist.subscribedCount, 0)
    playListData.playlist.shareCount = this.numberFormat(playListData.playlist.shareCount, 0)
    playListData.playlist.commentCount = this.numberFormat(playListData.playlist.commentCount, 0)
    this.setData({
      playList: playListData.playlist
    })
  },
  // 处理大数的功能函数，可以将大数转化为万或亿
  numberFormat(num, point) {
    let numStr = num + '';
    // 十万以内直接返回 
    if (numStr.length < 6) {
      return numStr;
    }
    //大于8位数是亿
    else if (numStr.length > 8) {
      let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point);
      return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿';
    }
    //大于6位数是十万 (以10W分割 10W以下全部显示)
    else if (numStr.length > 5) {
      let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point)
      return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万';
    }
  },
  // 返回上一级
  goBack() {
    wx.navigateBack({
      delta: 1,
    })
  },
  // 跳转到songDetail页面
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
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    PubSub.unsubscribe('switchType')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})