// pages/topList/topList.js
import request from "../../utils/request";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    spList: [],// 云音乐特色榜
    gmList: [],// 全球媒体榜
    background: ["bac1", "bac2", "bac3", "bac4"],// 云音乐背景颜色
    titleColor: ['t1', 't2', 't3', 't4']// 云音乐标题字体颜色
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 显示正在加载
    wx.showLoading({
      title: "加载中",
    });
    this.getTopList();
  },
  // 获取所有榜单的介绍
  async getTopList() {
    let topListData = await request('/toplist')
    let spList = topListData.list.slice(0, 4)
    for (const item of spList) {
      let playListData = await request('/playlist/detail', { id: item.id })
      let tracks = playListData.playlist.tracks.slice(0, 3)
      item.tracks = tracks
    }
    wx.hideLoading();
    this.setData({
      spList,
      gmList: topListData.list.slice(4, 29),
    })
  },
  randomRgb() {
    let R = Math.floor(Math.random() * 130 + 110);
    let G = Math.floor(Math.random() * 130 + 110);
    let B = Math.floor(Math.random() * 130 + 110);
    return {
      background: 'rgb(' + R + ',' + G + ',' + B + ')'
    };
  },
  // 跳转到歌单页面
  toSongList(e) {
    let { songlist } = e.currentTarget.dataset;
    // 路由传参query参数
    wx.navigateTo({
      url: '/pages/songList/songList?songListId=' + songlist.id,
    })
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