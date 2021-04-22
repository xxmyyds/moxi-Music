let startY = 0; // 手指起始的坐标
let moveY = 0; // 手指移动的坐标
let moveDistance = 0; // 手指移动的距离
import request from "../../utils/request";
import PubSub from "pubsub-js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: "translateY(0)",
    coverTransition: "",
    selectItemId: 0,// 下拉按钮的id
    trigger: true,
    userInfo: {}, // 用户信息
    userId: 0,// 用户id
    recentPlayList: [], // 用户的最近播放记录
    index: 0,// 最近播放音乐的下标
    myMusicList: [],// 我的音乐列表
    myCollectionList: [],// 我的收藏列表 
    myDjRadio: [],// 我的订阅播单
    sideUserInfoControl: "-640rpx",// 控制侧拉框的显示与隐藏
    maskControl: 'none'// 控制遮罩层的显示与隐藏
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
        userId: JSON.parse(userInfo).userId
      });
      // 获取用户的播放记录
      this.getUserPlayList(this.data.userId);
      // 获取个人音乐
      this.getPersonalSongList(this.data.userId)
      this.getPersonalRadio()
    }
    PubSub.subscribe("switchType", (msg, { type, mode }) => {
      let { recentPlayList, index } = this.data;
      if (type === "pre") {
        if (mode === 2) {
          let idx = Math.floor(Math.random() * recentPlayList.length)
          while (idx === index) {
            idx = Math.floor(Math.random() * recentPlayList.length)
          }
          index = idx
        } else {
          index === 0 && (index = recentPlayList.length);
          index--;
        }
      } else {
        if (mode === 2) {
          let idx = Math.floor(Math.random() * recentPlayList.length)
          while (idx === index) {
            idx = Math.floor(Math.random() * recentPlayList.length)
          }
          index = idx
        } else {
          index === recentPlayList.length - 1 && (index = -1);
          index++;
        }
      }
      // 更新下标
      this.setData({
        index,
      });
      let musicId = recentPlayList[index].song.id;
      // 将musicId回传给songList页面
      PubSub.publish("musicId", musicId);
    });

  },
  // 获取用户播放记录的函数
  async getUserPlayList(userId) {
    let recentPlayListData = await request("/user/record", {
      uid: userId,
      type: 1,
    });
    let index = 0;
    let recentPlayList = recentPlayListData.weekData.map((item) => {
      item.id = index++;
      return item;
    });
    this.setData({
      recentPlayList: recentPlayListData.weekData,
    });
  },
  handleStart(e) {
    this.setData({
      coverTransition: "",
    });
    // 获取手指起始坐标
    startY = e.touches[0].clientY;
  },
  handleMove(e) {
    moveY = e.touches[0].clientY;
    moveDistance = moveY - startY;
    if (moveDistance <= 0) {
      return;
    }
    if (moveDistance > 80) {
      moveDistance = 80;
    }
    // 动态更新coverTransform的值
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`,
    });
  },
  handleEnd() {
    this.setData({
      coverTransform: `translateY(0rpx)`,
      coverTransition: "transform .5s linear",
    });
  },
  // 点击按钮弹出下拉框
  changeSelect(e) {
    // this.setData({
    //   trigger: true,
    // })
    let selectItemId = e.currentTarget.dataset.id
    if (selectItemId === this.data.selectItemId) {
      this.setData({
        // trigger: false,
        selectItemId: 0
      })
      return
    }
    this.setData({
      selectItemId,
    })
  },
  // 跳转至登录login的回调
  toLogin() {
    // 未登录
    if (!wx.getStorageSync('userInfo')) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
    }
    // 已经登录
    else {
      this.setData({
        sideUserInfoControl: 0,
        maskControl: 'block'
      })
    }
  },
  // 跳转到songDetail页面
  toSongDetail(e) {
    let { song, index } = e.currentTarget.dataset;
    this.setData({
      index,
    });
    // 路由传参query参数
    wx.navigateTo({
      url: "/songPackage/pages/songDetail/songDetail?musicId=" + song.song.id,
    });
  },
  // 获取个人音乐的功能函数
  async getPersonalSongList(userId) {
    let personalSongListData = await request('/user/playlist', { uid: userId })
    let myMusicListArr = []
    let myCollectionListArr = []
    personalSongListData.playlist.forEach(item => {
      if (item.userId === this.data.userId) {
        myMusicListArr.push(item)
      } else {
        myCollectionListArr.push(item)
      }
    });
    this.setData({
      myMusicList: myMusicListArr,
      myCollectionList: myCollectionListArr
    })
  },
  // 获取个人收藏播单的功能函数
  async getPersonalRadio() {
    let personalRadioData = await request('/dj/sublist')
    // console.log(personalRadioData);
    this.setData({
      myDjRadio: personalRadioData.djRadios
    })
  },
  // 跳转到歌单页面
  toSongList(e) {
    let { songlist } = e.currentTarget.dataset;
    // 路由传参query参数
    wx.navigateTo({
      url: '/pages/songList/songList?songListId=' + songlist.id,
    })
  },
  // 跳转到播单页面
  toProgramList(e) {
    let { programlist } = e.currentTarget.dataset;
    // 路由传参query参数
    wx.navigateTo({
      url: '/pages/programList/programList?programId=' + programlist.id,
    })

  },
  // 控制遮罩层和侧拉框的显示与隐藏
  maskControl() {
    this.setData({
      sideUserInfoControl: '-640rpx',
      maskControl: 'none'
    })
  },
  // 退出登录的功能函数
  Exit() {
    wx.showModal({
      title: '摩西云音乐',
      content: '确定退出当前账号吗？',
      success(res) {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      }
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
