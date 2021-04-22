// pages/video/video.js
import request from "../../utils/request";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], // 导航标签数据
    navId: "", // 导航的标识Id
    videoList: [], // 视频列表数据
    videoId: "", // 视频id标识
    videoUpdateTime: [], // 记录video播放的时长
    isTriggered: false, // 控制下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取导航数据
    this.getVideoGroupListData();
  },
  // 获取导航数据
  async getVideoGroupListData() {
    let videoGroupListData = await request("/video/group/list");
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 14),
      navId: videoGroupListData.data[0].id,
    });
    // 获取视频列表数据
    this.getVideoList(this.data.navId);
  },
  // 获取视频列表数据
  async getVideoList(navId) {
    let videoListData = await request("/video/group", { id: navId });
    wx.hideLoading();
    let index = 0;
    let videoList = videoListData.datas.map((item) => {
      item.id = index++;
      return item;
    });
    this.setData({
      videoList,
      isTriggered: false,
    });
  },
  // 点击切换导航的回调
  changeNav(e) {
    let navId = e.currentTarget.id;
    this.setData({
      navId: navId * 1,
      videoList: [],
    });
    // 显示正在加载
    wx.showLoading({
      title: "加载中",
    });
    // 动态获取当前导航的视频数据
    this.getVideoList(this.data.navId);
  },
  // 点击播放触发的回调
  handlePlay(e) {
    // 解决多个视频播放的视频
    // 在点击播放的事件中需要找到上一个播放的视频
    // 在播放新的视频之前关闭上一个播放的视频
    // 如何找到上一个视频的实例对象
    // 如何确认点击播放的视频和正在播放的视频不是同一个视频
    // 单例模式：需要创建多个对象的场景下，通过一个变量接收，实在保持只有一个对象，节省内存空间
    let vid = e.currentTarget.id;
    // this.vid !== vid && this.videoContext && this.videoContext.stop();
    // this.vid = vid;
    this.setData({
      videoId: vid,
    });
    // let videoContext = wx.createVideoContext(vid);
    this.videoContext = wx.createVideoContext(vid);
    // 跳转到之前播放过的记录中
    let { videoUpdateTime } = this.data;
    let videoItem = videoUpdateTime.find((item) => item.vid === vid);
    if (videoItem) {
      this.videoContext.seek(videoItem.time);
    }
    this.videoContext.play();
  },
  // 监听视频播放进度的回调
  handleTime(e) {
    let videoTimeObj = { vid: e.currentTarget.id, time: e.detail.currentTime };
    let { videoUpdateTime } = this.data;
    /*
      判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
      1、如果有，在原有的数组上修改播放时间即可
      2、如果没有，则在数组中添加一个当前视频的播放对象
    */
    let videoItem = videoUpdateTime.find(
      (item) => item.vid === e.currentTarget.id
    );
    if (videoItem) {
      // 之前有
      videoItem.time = e.detail.currentTime;
    } else {
      // 之前没有
      videoUpdateTime.push(videoTimeObj);
    }

    this.setData({
      videoUpdateTime,
    });
  },
  // 视频结束调用的回调
  handleEnded(e) {
    // 移除记录播放时长数组中当前视频的对象
    let { videoUpdateTime } = this.data;
    let index = videoUpdateTime.findIndex(
      (item) => item.vid === e.currentTarget.id
    );
    videoUpdateTime.splice(index, 1);
    this.setData({
      videoUpdateTime,
    });
  },
  // 自定义下拉刷新的对调：scroll-view
  handleRefresher() {
    // console.log("xxm");
    this.getVideoList(this.data.navId);
  },
  // 自定义上拉处理回调：scorll-view
  async handleToLower() {
    // 网易云音乐没有提供分页的接口
    // 这里是将原有的视频数据在添加一份到数据列表中
    let videoList = this.data.videoList;
    let newVideoListData = await request("/video/group", {
      id: this.data.navId,
    });
    // console.log(newVideoListData);
    videoList.push(...newVideoListData.datas);
    this.setData({
      videoList,
    });
  },
  // 跳转至搜索界面
  toSearch(){
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("下拉刷新");
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("上拉触底");
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function ({ from }) {
    console.log(from);
    if (from === "button") {
      return {
        title: "来自button的转发",
        path: "/pages/video/video",
        imageUrl: "/static/images/logo.png",
      };
    } else if (from === "menu") {
      return {
        title: "来自menu的转发",
        path: "/pages/video/video",
        imageUrl: "/static/images/logo.png",
      };
    }
  },
});
