/******** 重加载标识 start ********/
// var ISReload = false;	//重加载标识
// document.addEventListener('deviceready', onDeviceReady, false);
// setTimeout(function () {
//     if (!ISReload && window.cordova) {
//         window.location.reload();//重加载
//     }
// }, 300);
// var onDeviceReady = function () {
//     ISReload = true;//更新重加载标识
//     app.receivedEvent('deviceready');
// }
// window.onerror = function (msg, url, line) {
//     var idx = url.lastIndexOf("/") || location.href.lastIndexOf("/");
//     if (idx > -1) {
//         url = url.substring(idx + 1);
//     }
//     console.log("ERROR in " + url + " (line #" + line + "): " + msg);
//     return false;
// };
/******** 重加载标识 end ********/

/******** QQ|微信打开到提示页 start ********/
setTimeout(function () {
    var ua = navigator.userAgent;
    var uaLow = navigator.userAgent.toLowerCase();
    var domIos = document.querySelector('.show-ios');
    var domAndroid = document.querySelector('.show-android');
    var domApp = document.querySelector('.ion-app');
    if (uaLow.match(/MicroMessenger\/[0-9]/i) || uaLow.match(/QQ\/[0-9]/i)) {
        domApp.style.display = 'none';
        if (ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1)
            domAndroid.style.display = 'block';
        if (!!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/))
            domIos.style.display = 'block';
    }
}, 400);
/******** QQ|微信打开到提示页 end ********/

/******** 加载 Kline start ********/
var kline = new Kline({
    element: "#kline_container",
    width: 1,
    height: 1,
    theme: 'light', // light/dark
    language: 'zh-cn', // zh-cn/en-us/zh-tw
    ranges: ["1d", "1h", "30m", "15m", "5m", "1m"],
    symbol: "",
    symbolName: "",
    type: "poll", // poll/socket
    limit: 1440,
    intervalTime: 200,
    debug: false,
    showTrade: false
});
kline.draw();
kline.pause();
/******** 加载 Kline end ********/

/******** un-comment this code to enable service worker start ********/
/*
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('service worker installed'))
        .catch(err => console.error('Error', err));
}
*/
/******** un-comment this code to enable service worker end ********/