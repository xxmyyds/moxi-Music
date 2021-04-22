// 发送ajax请求
import config from "./config";
export default (url, data = {}, method = "GET") => {
  return new Promise((resolve, reject) => {
    // new Promise初始化promise实例的状态为pending
    wx.request({
      url: config.host + url,
      data,
      method,
      header: {
        cookie: wx.getStorageSync("cookies")
          ? wx
              .getStorageSync("cookies")
              .find((item) => item.indexOf("MUSIC_U") !== -1)
          : "",
      },
      success: (res) => {
        // console.log(res);
        // 判断是否为登陆成功的请求，来存储获得的cookies
        if (data.isLogin) {
          console.log(res);
          // 将cookies存入本地
          wx.setStorage({
            data: res.cookies,
            key: "cookies",
          });
        }
        // 修改promise的状态为成功状态
        resolve(res.data);
      },
      fail: (err) => {
        // console.log(err);
        // 修改promise的状态为失败状态
        reject(err);
      },
    });
  });
};
