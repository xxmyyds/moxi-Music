// pages/songSquare/songSquare.js
import request from "../../utils/request";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}, // 用户的信息
    songList: [],// 所有歌单数据
    recommendSonglist: [],// 6个推荐歌单
    HQSongList: [],// 6个优质歌单 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 读取用户信息
    let userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      // 更新userInfo的状态
      this.setData({
        userInfo: JSON.parse(userInfo),
      });
    }
    // 显示正在加载
    wx.showLoading({
      title: "加载中",
    });
    this.getSongList()
  },
  // 获取所有歌单数据
  async getSongList() {
    let songListData = await request('/recommend/resource');
    wx.hideLoading();
    let recommendSonglist = songListData.recommend.slice(0, 6);
    let HQSongList = songListData.recommend.slice(6, 12);
    let songList = songListData.recommend.map(item => {
      item.playcount = this.numberFormat(item.playcount, 0);
      // item.playcount = item.playcount + 1;
      return item
    })

    this.setData({
      songList,
      recommendSonglist,
      HQSongList
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