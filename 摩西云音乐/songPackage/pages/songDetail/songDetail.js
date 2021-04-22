// pages/songDetail/songDetail.js
import PubSub from "pubsub-js";
import moment from "moment";
import request from "../../../utils/request";
const appInstance = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, // 标识音乐是否在播放
    musicId: 0, // 音乐的id
    song: {}, // 歌曲详情对象
    musicLink: "", // 播放的音乐链接
    currentTime: "00:00", // 实时时间
    durationTime: "00:00", // 总时长
    currentWidth: 0, // 实时时间的进度条
    currentTimeChanging: '',// 变化的实时时间
    currentTimeChangingShow: false,// 标识变化的实时时间的显示与隐藏
    playMode: {
      sequence: 0,
      loop: 1,
      random: 2
    },// 所有播放模式
    mode: 0// 播放模式的下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 用于接收路由跳转的query参数
    // 原生小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉
    let musicId = options.musicId;
    this.setData({
      musicId,
    });
    this.getMusicInfo(musicId);
    // 创建控制音乐播放的实例
    /*
     问题：如果用户通过操作系统的控制/播放按钮去控制，页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
     解决问题的方案：
      1、通过控制音频的实例backgroundAudioManager去监听音乐的播放/暂停/停止
      */
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    // 判断当前页面是否有音乐在播放
    if (
      appInstance.globalData.isMusicPlay &&
      appInstance.globalData.musicId === musicId
    ) {
      // 修改当前页面播放状态为true
      this.setData({
        isPlay: true,
      });
    } else {
      this.backgroundAudioManager.pause();
    }
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true);
      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false);
    });
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false);
    });
    // 监听音乐自然播放结束
    this.backgroundAudioManager.onEnded(() => {
      if (this.data.mode === 1) {
        // 继续播放当前音乐
        this.musicControl(true, this.data.musicId);
        this.setData({
          currentWidth: 0,
          currentTime: "00:00",
        });
      } else {
        // 自动切换至下一首歌曲，自动播放，将实时进度条还原成0
        PubSub.publish("switchType", "next");
        // 订阅recommendSong页面传过来的数据
        PubSub.subscribe("musicId", (msg, musicId) => {
          // 获取音乐详情信息
          this.getMusicInfo(musicId);
          // 自动播放当前音乐
          this.musicControl(true, musicId);
          this.setData({
            currentWidth: 0,
            currentTime: "00:00",
          });
          // 取消订阅
          PubSub.unsubscribe("musicId");
        });
      }


    });
    // 监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      let currentTime = moment(
        this.backgroundAudioManager.currentTime * 1000
      ).format("mm:ss");
      let currentWidth =
        (this.backgroundAudioManager.currentTime /
          this.backgroundAudioManager.duration) *
        100;
      this.setData({
        currentTime,
        currentWidth,
      });
    });
  },
  // 修改播放状态的功能函数
  changePlayState(isPlay) {
    this.setData({
      isPlay,
    });
    // 修改全局的音乐状态
    appInstance.globalData.isMusicPlay = isPlay;
  },
  // 获取音乐详情的功能函数
  async getMusicInfo(musicId) {
    let songData = await request("/song/detail", { ids: musicId });
    // console.log(songData);
    let durationTime = moment(songData.songs[0].dt).format("mm:ss");
    this.setData({
      song: songData,
      durationTime,
    });
    // 动态修改页面的标题
    wx.setNavigationBarTitle({
      title: this.data.song.songs[0].name,
    });
  },
  // 点击播放/暂停的回调
  handleMusicPlay() {
    let isPlay = !this.data.isPlay;
    let { musicId, musicLink } = this.data;
    // 修改是否播放的回调
    this.musicControl(isPlay, musicId, musicLink);
  },
  // 控制音乐播放/暂停的控制函数
  async musicControl(isPlay, musicId, musicLink) {
    if (isPlay) {
      // 音乐播放
      // 获取音乐播放的链接
      this.setData({
        musicId,
      });
      if (!musicLink) {
        // 获取音乐播放链接
        let musicLinkData = await request("/song/url", { id: musicId });
        musicLink = musicLinkData.data[0].url;
        if (!musicLink) {
          wx.showToast({
            title: '当前为VIP歌曲！',
            icon: 'error'
          })
          return
        }
        this.setData({
          musicLink,
        });
      }
      this.backgroundAudioManager.src = musicLink;
      this.backgroundAudioManager.title = this.data.song.songs[0].name;
    } else {
      this.backgroundAudioManager.pause();
    }
  },
  // 点击切歌的回调
  handleSwitch(e) {
    // 获取切歌的类型
    let type = e.currentTarget.id;
    // 获取播放模式
    let mode = this.data.mode
    this.backgroundAudioManager.stop();
    // 发布消息数据给列表页面
    PubSub.publish("switchType", { type, mode });
    // 订阅列表页面传过来的数据
    PubSub.subscribe("musicId", (msg, musicId) => {
      // console.log(musicId);
      // 获取音乐详情信息
      this.getMusicInfo(musicId);
      // 自动播放当前音乐
      this.musicControl(true, musicId);
      // 取消订阅
      PubSub.unsubscribe("musicId");
    });
  },
  // 进度条拖动/跳转过程中触发的函数
  musicChanging(e) {
    let currentTimeChanging = moment(this.data.song.songs[0].dt * e.detail.value / 100).format("mm:ss")
    this.setData({
      currentTimeChanging,
      currentTimeChangingShow: true
    })
  },
  // 进度条拖动/跳转完成后触发的函数
  musicChange(e) {
    let currentTime = this.data.song.songs[0].dt / 1000 * e.detail.value / 100
    this.backgroundAudioManager.seek(currentTime)
    this.setData({
      currentTimeChangingShow: false
    })
  },
  // 点击按钮改变播放模式
  changePlayMode() {
    this.setData({
      mode: (this.data.mode + 1) % 3
    })
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
  onHide: function () { },

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
