// pages/programList/programList.js
import PubSub from "pubsub-js";
import request from "../../utils/request";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    programId: 0,// 标识播单的id
    programListInfo: {},// 播单信息
    programListDetail: [],// 播单列表
    index: 0// 点击音乐的下标
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
    let programId = options.programId
    this.setData({
      programId,
    })
    this.getProgramListInfo(this.data.programId)
    this.getProgramListDetail(this.data.programId)
    // 订阅来自programDetail页面发布的数据
    PubSub.subscribe('switchType', (msg, { type, mode }) => {
      let { programListDetail, index } = this.data
      if (type === 'pre') {
        if (mode === 2) {
          let idx = Math.floor(Math.random() * programListDetail.length)
          while (idx === index) {
            idx = Math.floor(Math.random() * programListDetail.length)
          }
          index = idx
        } else {
          index === 0 && (index = programListDetail.length);
          index--;
        }
      } else {
        if (mode === 2) {
          let idx = Math.floor(Math.random() * programListDetail.length)
          while (idx === index) {
            idx = Math.floor(Math.random() * programListDetail.length)
          }
          index = idx
        } else {
          index === programListDetail.length - 1 && (index = -1);
          index++;
        }
      }
      this.setData({
        index
      })
      // 节目音频id
      let audioId = programListDetail[index].mainSong.id
      // 节目详情id
      let programDetailsId = programListDetail[index].id
      // 将音乐id回传给programDetail页面
      PubSub.publish('programId', { audioId, programDetailsId })
    })
  },
  // 返回上一级
  goBack() {
    wx.navigateBack({
      delta: 1,
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
  // 获取播单基本信息
  async getProgramListInfo(programId) {
    let programListInfoData = await request('/dj/detail', { rid: programId })
    programListInfoData.djRadio.subCount = this.numberFormat(programListInfoData.djRadio.subCount, 0)
    programListInfoData.djRadio.commentCount = this.numberFormat(programListInfoData.djRadio.commentCount, 0)
    programListInfoData.djRadio.shareCount = this.numberFormat(programListInfoData.djRadio.shareCount, 0)
    this.setData({
      programListInfo: programListInfoData.djRadio
    })
  },
  // 获取播单列表歌曲信息
  async getProgramListDetail(programId) {
    let programListDetailData = await request('/dj/program', { rid: programId })
    programListDetailData.programs.forEach(item => {
      item.listenerCount = this.numberFormat(item.listenerCount, 0)
    })
    this.setData({
      programListDetail: programListDetailData.programs
    })
  },
  // 跳转到播放器页面
  toSongDetail(e) {
    let { program, index } = e.currentTarget.dataset;
    this.setData({
      index,
    });
    // 路由传参query参数
    wx.navigateTo({
      url: "/pages/programDetail/programDetail?audioId=" + program.mainSong.id + '&programDetailsId=' + program.id,
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