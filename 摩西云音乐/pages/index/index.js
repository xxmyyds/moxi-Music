// pages/index/index.js
import request from "../../utils/request";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 轮播图数据
    bannerList: [],
    // 推荐歌单数据
    recommendList: [],
    // 排行榜数据
    topList: [],
    // 原排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 获取轮播图数据
    let bannerListData = await request("/banner", { type: 2 });
    this.setData({
      bannerList: bannerListData.banners,
    });
    // 获取推荐歌单数据
    let recommendListData = await request("/personalized", { limit: 10 });
    this.setData({
      recommendList: recommendListData.result,
    });
    // 获取排行榜数据
    // 1、需要根据idx的值获取对应的数据
    // 2、idx的取值范围是0-20，我们需要0-4
    // 3、需求需要发五次
    let index = 0;
    let resultArr = [];
    while (index < 5) {
      let topListData = await request("/top/list", { idx: index++ });
      // splice(会修改原数组，可以对指定数组进行增删改查操作) slice(不会修改原数组)
      let topListItem = {
        id:topListData.playlist.id,
        name: topListData.playlist.name,
        tracks: topListData.playlist.tracks.slice(0, 3),
      };
      resultArr.push(topListItem);
      // 更新toplist的状态值,不需要等待五次请求全部结束，用户体验好，但是渲染次数会多一些
      this.setData({
        topList: resultArr,
      });
    }
  },
  // 跳转到排行榜页面
  toTopList(){
    wx.navigateTo({
      url: '/pages/topList/topList',
    })
  },
  // 跳转到榜单歌单页面
  toSongList(e){
    let { songlist } = e.currentTarget.dataset;
    // 路由传参query参数
    wx.navigateTo({
      url: '/pages/songList/songList?songListId=' + songlist.id,
    })
  },
  // 跳转到歌单广场
  toSongSquare(){
    wx.navigateTo({
      url: '/pages/songSquare/songSquare',
    })
  },
  // 跳转到今日推荐界面
  toRecommendSong(){
    wx.navigateTo({
      url: '/songPackage/pages/recommendSong/recommendSong',
    })
  },
  // 跳转到搜索页面
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
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
