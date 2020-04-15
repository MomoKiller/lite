import { Component, ViewChild } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Platform, Slides, Navbar, IonicPage, NavController, NavParams, ModalController, LoadingController } from 'ionic-angular';
/* components */
import { AlertComponent } from '../../components/alert/alert';
/* pages */
import { MarketPage } from '../market/market';
import { TraderContractPage } from '../tradercontract/tradercontract';
import { OpenAccountPage } from '../openaccount/openaccount';
/* serve */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { SocketServeProvider } from "../../providers/socket-serve/socket-serve";
import { PresentProvider } from '../../providers/present/present';

declare var Window: any, $: any, indexLibrary, window, kline;

@Component({
  selector: 'page-productdetail',
  templateUrl: 'productdetail.html'
})
@IonicPage()
export class ProductdetailPage {
  @ViewChild(AlertComponent) child: AlertComponent;
  @ViewChild(Slides) slides: Slides;
  @ViewChild(Navbar) navBar: Navbar;

  private marginTop: any;
  private marginBottom: number;

  //判断平台是否支持native
  private supportNative: boolean = window.cordova ? true : false;

  /* 监听屏幕变化 */
  private screenChange: any;

  /* 图表全屏 */
  public isFullEcharts: boolean = false;
  public changeLoading: boolean = false;
  public currentContract: number;

  constructor(
    public loadingCtrl: LoadingController,
    public plt: Platform,
    public http: HttpServeProvider,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private screenOrientation: ScreenOrientation,
    private socket: SocketServeProvider,
    private present: PresentProvider
  ) { }

  public id: string = Window.nowProId;
  public unionMinPrices: number;

  //合约类型
  public commodityType: number = -1;

  private productList = [];
	/**
	 * tabStatus 状态
	 * 1:盘口 2:交易明细 3:分时 4:K线 
	 */
  public tabStatus: number = 3;

  /* 图表 */
  public chartsTime: number = 0;
  public isLoding: boolean = false;
  private connection;
  /* 买卖手数显示数量 */
  public traderBSnum: number;
  /* 获取是否完成 实名/开户 验证 */
  public userValidate: any = Window.userValidate;
  /* 保存进入前的列表 */
  public baseProductlist: any;

  /* K线时间选择 */
  public selectTimeChoose: number = 1;

  public CFDidentification = null; // 图表买卖线标识 0: 买 1: 卖

  backButtonClick = (e: UIEvent) => {
    this.navCtrl.setRoot(MarketPage, {}, { animate: true });

    // 指标参数打开状态则关闭
    document.getElementById('chart_parameter_settings').classList.remove('clicked');
    document.getElementById('kline-background').style.display = "none";
    document.getElementById('Kline-column').style.position = "absolute";
  }
  ionViewWillEnter() {
    const self = this;
    window.Control.switchIndic('off');
    this.productList = Window.productList;
    // 时间监听指针
    console.log('[当前显示的自选合约列表]', this.productList)
    this.chartsTime = 0;
    this.id = Window.nowProId;
    for (let i = 0, r = this.productList.length; i < r; i++) {
      if (this.productList[i].productId == this.id) {
        this.unionMinPrices = this.productList[i].unionMinPrices;
        this.commodityType = this.productList[i].commodityType;
        break;
      }
    }
    for (let i = 0, r = Window.allProductList.length; i < r; i++) {
      if (Window.allProductList[i].productId == this.id) {
        this.traderBSnum = Window.allProductList[i].priceGearsNum;
      }
    }
    // 判断当前是否是CFD合约
    if (this.commodityType === 4) {
      // 按钮默认定位在 买
      this.CFDidentification = 0;
      $('#chart_buy').show().addClass('selected');
      // $('#chart_sell').show();
      $('#chart_sell').show().removeClass('selected');
    }
    else {
      $('#chart_buy').hide().removeClass('selected');
      $('#chart_sell').hide();
    }
    $('.commodity_type').on('touchstart', function (e) {
      $('.commodity_type').removeClass('selected');
      $(this).addClass('selected');
      self.CFDidentification = $(this).attr('id') === 'chart_buy' ? 0 : 1;
      self.changeChartTime(self.tabStatus === 3 ? 0 : 1, self.selectTimeChoose);
    });
  }

  private tmpProductListCloning: boolean = false;
  public scrollContentH: number;
  private KlineColumnH = null;
  private KlineColumnW = null;
  getFirstData(isFirst = false) {
    let self = this;
    /* 只获取对应的 currentIndex 1024 @wuwp */
    for (let i = 0, r = Window.productList.length; i < r; i++) {
      if (Window.productList[i].productId == self.id) {
        self.currentIndex = i;
        break;
      }
    }
    if (isFirst) {
      setTimeout(() => {
        self.slides.slideTo(self.currentIndex, 0);
        if (self.slides.getActiveIndex() == 0) {
          self.slideChanged();
        }
      }, 30);
    }
    self.productList = Window.productList;
  }
  ionViewDidEnter() {
    let self = this;
    this.KlineColumnH = $('#Kline-column').height();
    this.KlineColumnW = $('#Kline-column').width();
    // 放入K line
    const Dom = $('#kline_container');
    $('#Kline-column').append(Dom);
    $('#Kline-column').css('opacity', 0);
    $('#chart_toolbar_periods_vert').hide();
    $('#chart_dropdown_settings').hide();
    $('#chart_show_indicator').hide();
    $('#chart_show_tools').hide();
    const h = $('#Kline-column').height();
    const w = $('#Kline-column').width();
    kline.resize(w, h);
    kline.resend();

    this.navBar.backButtonClick = this.backButtonClick;
    Window.currentSocket = '合约详情页';
    this.socket.addSingleProListMb2Delay(this.id);
    /* 初始拉取产品数据 */
    this.getFirstData(true);
    window.Control.switchPeriod('line');
    this.scrollContentH = $('.product-detail-page > .scroll-content').height();
    this.getRealtimeData();
    //500毫秒同步一次数据
    Window.synchronization = setInterval(function () {
      self.productList = Window.productList;
    }, 500);

    if (this.supportNative) {
      this.screenOrientation.lock('any');
    }

    this.marginTop = $('.product-detail-page > .scroll-content').css('margin-top');
    this.marginBottom = $('.product-detail-page > .scroll-content').css('margin-bottom');

    if (this.supportNative) {
      this.screenChange = this.screenOrientation.onChange().subscribe(() => {
        if (this.tabStatus === 3 || this.tabStatus === 4) {
          this.present.presentLoading('WAP_43','正在缩放图表...');
          if (this.screenOrientation.type.indexOf('landscape') !== -1) {
            this.isFullEcharts = true;
          }
          else {
            this.isFullEcharts = false;
          }
          this.slides.lockSwipes(this.isFullEcharts);
          Window.isFullEcharts = this.isFullEcharts;
          if (Window.isFullEcharts) {
            console.log('[现在全屏]', self.screenOrientation);
            $('.product-detail-page > .scroll-content').css({ 'height': '100%', 'margin-top': '0px', 'margin-bottom': '0px' });
            $('.product-detail-page > .scroll-content').removeClass('un-full');
            $('#Kline-column').addClass('full');
            /* 全屏 */
            setTimeout(function () {
              const h = document.body.clientHeight;
              const w = document.body.clientWidth;
              kline.resize(w, h);
              window.Control.switchIndic('on');
              $('#chart_show_tools').show();
              $('#chart_toolbar').css('margin-top', '20px');
              self.present.dismissLoading();
            }, 200);
          }
          else if (!Window.isFullEcharts) {
            console.log('[现在竖屏]', self.screenOrientation);
            $('.product-detail-page > .scroll-content').css({ 'height': 'auto', 'margin-top': self.marginTop, 'margin-bottom': self.marginBottom });
            $('.product-detail-page > .scroll-content').addClass('un-full');
            $('#Kline-column').removeClass('full');
            setTimeout(function () {
              // kline.resize(self.KlineColumnW,self.KlineColumnH);
              window.Control.switchIndic('off');
              $('#chart_show_tools').hide();
              $('#chart_toolbar').css('margin-top', '0');
              // 关闭工具
              $('#chart_toolpanel').css('display', 'none');
              $('#chart_show_tools').removeClass('selected');
              kline.resize(self.KlineColumnW, self.KlineColumnH);
              self.present.dismissLoading();
            }, 200);
          }
        }
      });
    }
    else {
      window.addEventListener("orientationchange", this.browser, false);
    }
    // kline图表时间切换
    $('#chart_toolbar_periods_vert ul a').on('touchstart', function (e) {
      console.log(e, $(this).parent().attr('name'));
      window.Control.switchPeriod($(this).parent().attr('name'));
      if (e.currentTarget.className.indexOf('chart_str_period_line') !== -1) {
        self.changeTime(1, 'line');
        console.log('分时');
      }
      else if (e.currentTarget.className.indexOf('chart_str_period_1m') !== -1) {
        self.changeTime(1, 'candel');
        self.selectTimeChoose = 1;
        console.log('1分钟K线');
      }
      else if (e.currentTarget.className.indexOf('chart_str_period_5m') !== -1) {
        self.changeTime(5, 'candel');
        self.selectTimeChoose = 5;
        console.log('5分钟K线');
      }
      else if (e.currentTarget.className.indexOf('chart_str_period_15m') !== -1) {
        self.changeTime(15, 'candel');
        self.selectTimeChoose = 15;
        console.log('15分钟K线');
      }
      else if (e.currentTarget.className.indexOf('chart_str_period_30m') !== -1) {
        self.changeTime(30, 'candel');
        self.selectTimeChoose = 30;
        console.log('30分钟K线');
      }
      else if (e.currentTarget.className.indexOf('chart_str_period_1h') !== -1) {
        self.changeTime(60, 'candel');
        self.selectTimeChoose = 60;
        console.log('1小时K线');
      }
      else if (e.currentTarget.className.indexOf('chart_str_period_1d') !== -1) {
        self.changeTime(1440, 'candel');
        self.selectTimeChoose = 1440;
        console.log('日K线');
      }
    });

    // 191220  禁用右滑返回
    this.navCtrl.swipeBackEnabled = false;
  }
  ionViewWillLeave() {
    const Dom = $('#kline_container');
    $('.commodity_type').off('touchstart');
    $('#chart_toolbar_periods_vert ul a').off('touchstart');
    $('body').append(Dom);
    kline.resize(1, 1);
    this.socket.destoryAll();
    this.connection.unsubscribe();
    this.historyTraderList = [];
    if (this.supportNative) {
      this.screenOrientation.lock('portrait');
    }
    if (this.screenChange) {
      this.screenChange.unsubscribe();
    }
    else {
      window.removeEventListener('orientationchange', this.browser, false);
    }
    clearInterval(Window.synchronization);
    kline.pause();
  }
  // 浏览器旋转屏幕处理
  browser = () => {
    const self = this;
    if (self.tabStatus === 3 || self.tabStatus === 4) {
      this.present.presentLoading('WAP_43','正在缩放图表...');
      if (window.orientation === -90 || window.orientation === 90) {
        self.isFullEcharts = true;
      }
      else {
        self.isFullEcharts = false;
      }
      Window.isFullEcharts = self.isFullEcharts;
      if (Window.isFullEcharts) {
        $('.product-detail-page > .scroll-content').css({ 'height': '100%', 'margin-top': '0px', 'margin-bottom': '0px' });
        $('.product-detail-page > .scroll-content').removeClass('un-full');
        $('#Kline-column').addClass('full');
        /* 全屏 */
        setTimeout(() => {
          const h = document.body.clientHeight;
          const w = document.body.clientWidth;
          window.Control.switchIndic('on');
          $('#chart_show_tools').show();
          $('#chart_toolbar').css('margin-top', '20px');
          kline.resize(w, h);
          self.present.dismissLoading();
        }, 200);
      }
      else if (!Window.isFullEcharts) {
        $('.product-detail-page > .scroll-content').css({ 'height': 'auto', 'margin-top': self.marginTop, 'margin-bottom': self.marginBottom });
        $('.product-detail-page > .scroll-content').addClass('un-full');
        $('#Kline-column').removeClass('full');
        setTimeout(() => {
          // kline.resize(self.KlineColumnW,self.KlineColumnH);
          window.Control.switchIndic('off');
          $('#chart_show_tools').hide();
          $('#chart_toolbar').css('margin-top', '0');
          // 关闭工具
          $('#chart_toolpanel').css('display', 'none');
          $('#chart_show_tools').removeClass('selected');
          kline.resize(self.KlineColumnW, self.KlineColumnH);
          self.present.dismissLoading();
        }, 200);
      }
    }
  }
  // kline时间切换
  changeTime(time, type) {
    // const num = (type === 'candel')? time: 0;
    const num = (type === 'candel') ? time : 1;
    this.changeChartTime(num, time);
  }
  // 获取实时行情
  getRealtimeData() {
    this.connection = this.socket.getPriceMb2().subscribe(res => {
      const data = JSON.parse(JSON.stringify(res));
      if (this.tmpProductListCloning) {
        return;
      }
      if (this.isLoding) {
        return;
      }

      if (data[0] === this.id) {
        if (!Window.productList[this.currentIndex]) {
          return;
        }
        let tmpProduct = Window.productList[this.currentIndex];
        tmpProduct.QLastPrice = Number(data[2]);
        tmpProduct.QChangeRate = Number(data[22]);
        tmpProduct.QChangeValue = Number(data[23]);
        tmpProduct.QAveragePrice = Number(data[21]);
        tmpProduct.QHighPrice = Number(data[12]);
        tmpProduct.QPreClosingPrice = Number(data[8]);
        tmpProduct.QLowPrice = Number(data[13]);
        tmpProduct.QPositionQty = Number(data[20]);
        tmpProduct.QOpeningPrice = Number(data[11]);
        tmpProduct.QAskQty = Number(data[7][0]);
        tmpProduct.QBidQty = Number(data[5][0]);
        tmpProduct.QTotalQty = Number(data[18]);
        tmpProduct.Stamp = Number(data[48]);
        tmpProduct.DateTimeStamp = data[1];
        tmpProduct.DayLineStamp = Number(data[49]);
        tmpProduct.QLastQty = Number(data[3]);

        tmpProduct._QAskPrice = [+data[6][4], +data[6][3], +data[6][2], +data[6][1], +data[6][0]];
        tmpProduct._QAskQty = [+data[7][4], +data[7][3], +data[7][2], +data[7][1], +data[7][0]];
        tmpProduct._QBidPrice = [+data[4][0], +data[4][1], +data[4][2], +data[4][3], +data[4][4]];
        tmpProduct._QBidQty = [+data[5][0], +data[5][1], +data[5][2], +data[5][3], +data[5][4]];

        tmpProduct.SignType = Number(data[29]);
        tmpProduct.SignPriceOpen = Number(data[31]);
        tmpProduct.SignPriceClose = Number(data[34]);
        tmpProduct.SignPriceMin = Number(data[33]);
        tmpProduct.SignPriceMax = Number(data[32]);
        tmpProduct.SignQty = Number(data[39]);

        tmpProduct.BidPriceClose = Number(data[4][0]);
        tmpProduct.AskPriceClose = Number(data[6][0]);

        if (this.tabStatus === 3 || this.tabStatus === 4) {
          this.regreshEcharts();
        }
        if (this.historyTraderList.length > 16 && this.tabStatus === 2) {
          if (tmpProduct.QLastQty > 0 && tmpProduct.SignType == 0) {
            this.historyTraderList.pop();
            this.historyTraderList.unshift({ "DataTimeStamp": tmpProduct.DateTimeStamp.substr(11, 12), "QLastPrice": tmpProduct.QLastPrice, "QLastQty": tmpProduct.QLastQty });
          }
        }
        Window.productList[this.currentIndex] = tmpProduct;
        // kline绘图效果展现
        let last = window.klineData.data.lines[window.klineData.data.lines.length - 1]; // 最后一条数据

        if (!last) return;
        /* 最后一点增长 */
        if (tmpProduct.SignType === 0) {
          if (this.commodityType !== 4) {
            last[4] = tmpProduct.QLastPrice;
            // last[5] += tmpProduct.QLastQty;
          }
          else {
            if (this.CFDidentification === 0) {
              last[4] = tmpProduct.BidPriceClose;
              // last[5] += tmpProduct.QBidQty;
            }
            else if (this.CFDidentification === 1) {
              last[4] = tmpProduct.AskPriceClose;
              // last[5] += tmpProduct.QAskQty;
            }
          }
          // 设置last[5] 的值 200107
          last[5] += tmpProduct.QLastQty;
          window.klineData.data.lines[window.klineData.data.lines.length - 1] = last;
        }
        /* 画点 */
        else if (tmpProduct.SignType === this.selectTimeChoose) {
          if (this.commodityType !== 4) {
            last[1] = tmpProduct.SignPriceOpen;
            last[2] = tmpProduct.SignPriceMax;
            last[3] = tmpProduct.SignPriceMin;
            last[4] = tmpProduct.SignPriceClose;
            last[5] = tmpProduct.SignQty;
            window.klineData.data.lines[window.klineData.data.lines.length - 1] = last;
            // window.klineData.data.lines.shift();
            window.klineData.data.lines.push([
              (tmpProduct.Stamp + this.selectTimeChoose * 60) * 1000,
              tmpProduct.SignPriceClose,
              tmpProduct.SignPriceClose,
              tmpProduct.SignPriceClose,
              tmpProduct.SignPriceClose,
              0
            ]);
          }
          else {
            if (this.CFDidentification === 0) {
              last[4] = tmpProduct.BidPriceClose;
              last[5] += tmpProduct.QBidQty;
              window.klineData.data.lines[window.klineData.data.lines.length - 1] = last;
              window.klineData.data.lines.push([
                (tmpProduct.Stamp + this.selectTimeChoose * 60) * 1000,
                tmpProduct.BidPriceClose,
                tmpProduct.BidPriceClose,
                tmpProduct.BidPriceClose,
                tmpProduct.BidPriceClose,
                0
              ]);
            }
            else if (this.CFDidentification === 1) {
              last[4] = tmpProduct.AskPriceClose;
              last[5] += tmpProduct.QAskQty;
              window.klineData.data.lines[window.klineData.data.lines.length - 1] = last;
              // 不去掉第一个点
              window.klineData.data.lines.push([
                (tmpProduct.Stamp + this.selectTimeChoose * 60) * 1000,
                tmpProduct.AskPriceClose,
                tmpProduct.AskPriceClose,
                tmpProduct.AskPriceClose,
                tmpProduct.AskPriceClose,
                0
              ]);
            }
          }

        }
      }
      // 调试
      // kline.setSymbol(new Date().getTime(), new Date().getTime());

    });
  }
  //切换行情订阅延迟
  changeSubscribe(type: number) {
    if (type === this.tabStatus) {
      return;
    }
    // 关闭弹框
    if (type !== 4) {
      document.getElementById('chart_parameter_settings').classList.remove('clicked');
      document.getElementById('kline-background').style.display = "none";
      document.getElementById('Kline-column').style.position = "absolute";
    }
    this.tabStatus = type;
    if (this.tabStatus === 3 || this.tabStatus === 4) {
      $('#Kline-column').css({
        'z-index': 2,
        'opacity': 1
      });
      if (this.supportNative) {
        this.screenOrientation.lock('any');
      }
      // 判断KLINE类型
      if (this.tabStatus === 3) {
        window.Control.switchPeriod('line');
        $('#chart_toolbar_periods_vert').hide();
        $('#chart_dropdown_settings').hide();
      }
      else if (this.tabStatus === 4) {
        window.Control.switchPeriod('1m');
        $('#chart_toolbar_periods_vert').show();
        $('#chart_dropdown_settings').show();
      }
    }
    else {
      this.showRetry = false;
      $('#Kline-column').css({
        'z-index': 0,
        'opacity': 0
      });
      if (this.supportNative) {
        this.screenOrientation.lock('portrait');
      }
    }
    if (this.tabStatus === 2) {
      this.socket.rejuceSingleProListMb2Delay(this.id);
      this.socket.addSingleProListMb2(this.id);
      this.getHistoryTrader();
      return;
    }
    else if (this.tabStatus === 3) {
      this.changeChartTime(0, 0);

    }
    else if (this.tabStatus === 4) {
      this.changeChartTime(1, 1);
    }
    this.socket.rejuceSingleProListMb2(this.id);
    this.socket.addSingleProListMb2Delay(this.id);

  }
  //刷新图表
  regreshEcharts() {

  }

  /* 获取UUID - 200110 */
  guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /* 交易明细 */
  public historyTraderList: Array<any> = [];
  getHistoryTrader() {
    let self = this;
    this.historyTraderList = [];
    this.http.postJson('trade/price/cur/quote/detail/qry', { symbol: this.id, count: 18 }, function (data) {
      for (let i = 0, r = data.list.length; i < r; i++) {
        let result = JSON.parse(data.list[i]);
        result.DataTimeStamp = result.DataTimeStamp.substr(11, 12);
        self.historyTraderList.push(result);
      }
    });
  }
  /* 产品更换 */
  public productName: string = '';
  public productCode: string = '';
  public currentIndex: number = 0;
  // 200303 commodityCode 合约编码
  public commodityCode: string = '';

  slideChanged() {
    let nowIndex = this.slides.getActiveIndex();
    if (!this.productList[nowIndex]) {
      return;
    }
    this.currentIndex = nowIndex;
    this.id = this.productList[this.currentIndex].productId;
    for (let i = 0, r = Window.allProductList.length; i < r; i++) {
      if (Window.allProductList[i].productId == this.id) {
        this.traderBSnum = Window.allProductList[i].priceGearsNum;
      }
    }
    Window.nowProId = this.id;
    this.socket.destoryAll();
    this.socket.addSingleProListMb2Delay(this.id);
    this.productName = this.productList[this.currentIndex].productName;
    this.productCode = this.productList[this.currentIndex].productCode;
    // 200303 commodityCode 合约编码
    this.commodityCode = this.productList[this.currentIndex].commodityCode;
    //判断当前显示的图表
    if (this.chartsTime == 0) {
      this.changeChartTime(0, 1);
    }
    else {
      this.changeChartTime(this.selectTimeChoose, this.selectTimeChoose);
    }

    if (this.tabStatus === 2) {
      this.getHistoryTrader();
    }


  }
  /* 清空Kline数据 */
  clearKlineData() {
    kline.setSymbol('', '');
    window.klineData.data.depths.asks = [];
    window.klineData.data.depths.bids = [];
    window.klineData.data.lines = [];
    kline.pause();
  }

  /* 图表设置 */
  operationType: number = 0;

  // reqId 标识唯一性
  public reqId: string = '';

  /*图表时间切换 */
  changeChartTime(num, time, isclick = false) {
    const self = this;
    if (this.tabStatus == 3 || this.tabStatus == 4) {
      if (this.chartsTime == num && isclick) {
        return;
      }
      // 200228
      kline.setSymbol(new Date().getTime(), new Date().getTime());
      $('#Kline-column').css('opacity', 0);
      this.chartsTime = num;
      let symbol = this.id;
      /* 蜡烛图 */
      if (num != 0) {
        // 获取GUID
        self.reqId = self.guid();
        let body = { symbol: symbol, unit: time, count: 500, endStamp: 0, reqId: self.reqId };
        /* 获取历史行情 */
        self.getCandleData(body, symbol, num, time);
      }
      /* 分时图 */
      else {
        self.reqId = self.guid();
        let body = { symbol: symbol, unit: 1, startStamp: 0, endStamp: 0, reqId: self.reqId };
        /* 获取历史行情 */
        self.getTimeData(body, symbol, num, time);
      }
    }
  }

  public klineTimer = null;
  public kStatus = false;
  public showRetry = false;

  /* 获取蜡烛图 */
  getCandleData(body, symbol, num, time) {
    let self = this;
    self.isLoding = true;
    self.kStatus = true;
    self.http.postJson("client/price/candle", body, function (res) {
      if (self.reqId != res.content.reqId) {
        return;
      }
      // 回调数据组装前清除数据
      self.clearKlineData();
      self.kStatus = false;
      if (res.code === 0) {
        // 展示重试-200110
        self.showRetry = false;
        const tmp_arr = res.content.list.reverse();
        kline.setSymbol(symbol + num + time, symbol + num + time);
        tmp_arr.forEach(x => {
          if (self.commodityType !== 4) {
            if (x.SignPriceOpen && x.SignPriceMax && x.SignPriceMin && x.SignPriceClose) {	// 数据过滤
              window.klineData.data.lines.push([
                x.Stamp * 1000,
                x.SignPriceOpen,
                x.SignPriceMax,
                x.SignPriceMin,
                x.SignPriceClose,
                x.SignQty
              ]);
            }
          }
          else {
            if (self.CFDidentification === 0) {
              if (x.BidPriceOpen && x.BidPriceMax && x.BidPriceMin && x.BidPriceClose) {	// 数据过滤
                window.klineData.data.lines.push([
                  x.Stamp * 1000,
                  x.BidPriceOpen,
                  x.BidPriceMax,
                  x.BidPriceMin,
                  x.BidPriceClose,
                  x.SignQty
                ]);
              }
            }
            else if (self.CFDidentification === 1) {
              if (x.AskPriceOpen && x.AskPriceMax && x.AskPriceMin && x.AskPriceClose) {  	// 数据过滤
                window.klineData.data.lines.push([
                  x.Stamp * 1000,
                  x.AskPriceOpen,
                  x.AskPriceMax,
                  x.AskPriceMin,
                  x.AskPriceClose,
                  x.SignQty
                ]);
              }
            }
          }
        });

        // 倒数第一个点的值
        let dataLen = window.klineData.data.lines.length;
        let condition = self.selectTimeChoose * 60 * 1000;
        if (window.klineData.data.lines[dataLen - 1][0] % condition > 0) {
          window.klineData.data.lines[dataLen - 1][0] = Math.ceil(window.klineData.data.lines[dataLen - 1][0] / condition) * condition;
        } else {
          window.klineData.data.lines[dataLen - 1][0] = Math.ceil(window.klineData.data.lines[dataLen - 1][0] / condition + 1) * condition;
        }

        console.log(window.klineData.data.lines[dataLen - 1]);
        $('#Kline-column').animate({ 'opacity': 1 });
        kline.resend();
        self.isLoding = false;
      }
    }, false);

    clearTimeout(self.klineTimer);
    self.klineTimer = setTimeout(() => {
      if (self.kStatus) {
        self.kStatus = false;
        self.isLoding = false;
        self.klineTimer = true;
        self.showRetry = true;
      }
    }, 5000);
  }
  /* 获取分时图 */
  getTimeData(body, symbol, num, time) {
    let self = this;
    self.isLoding = true;
    self.kStatus = true;

    self.http.postJson("client/price/time", body, (res) => {
      if (self.reqId != res.content.reqId) {
        return;
      }
      // 回调数据组装前清除数据
      self.clearKlineData();
      self.kStatus = false;
      if (res.code === 0) {
        // 展示重试-200110
        self.showRetry = false;
        kline.setSymbol(symbol + num + time, symbol + num + time);
        res.content.list.forEach(x => {
          if (self.commodityType !== 4) {
            window.klineData.data.lines.push([
              x.Stamp * 1000,
              x.SignPriceOpen,
              x.SignPriceMax,
              x.SignPriceMin,
              x.SignPriceClose,
              x.SignQty
            ]);
          }
          else {
            if (self.CFDidentification === 0) {
              // 买
              window.klineData.data.lines.push([
                x.Stamp * 1000,
                x.BidPriceOpen,
                x.BidPriceMax,
                x.BidPriceMin,
                x.BidPriceClose,
                x.SignQty
              ]);
            }
            else if (self.CFDidentification === 1) {
              // 卖
              window.klineData.data.lines.push([
                x.Stamp * 1000,
                x.AskPriceOpen,
                x.AskPriceMax,
                x.AskPriceMin,
                x.AskPriceClose,
                x.SignQty
              ]);
            }
          }
        });

        // 修改最后一点时间戳
        let dataLen = window.klineData.data.lines.length;
        if (dataLen > 0) {
          window.klineData.data.lines[dataLen - 1][0] += 60 * 1000;
        }
        $('#Kline-column').animate({ 'opacity': 1 });

        kline.resend();
        self.isLoding = false;
      }
    }, false);
    clearTimeout(self.klineTimer);
    self.klineTimer = setTimeout(() => {
      if (self.kStatus) {
        self.kStatus = false;
        self.isLoding = false;
        self.klineTimer = true;
        self.showRetry = true;
      }
    }, 5000);
  }

  /* 手动刷新 Kline  191128 */
  reflashKline() {
    this.showRetry = false;
    this.changeChartTime(this.tabStatus === 3 ? 0 : 1, this.selectTimeChoose);
  }
  presentModal() {
    let modal;
    if (Window.userInfo.userState != -2) {
      if (this.supportNative) {
        this.screenOrientation.lock('portrait');
      }
      this.connection.unsubscribe();
      console.log('[当前交易合约类型]', this.commodityType);
			/**
			 * commodityType 
			 * 0:期货 1:连续 2:股配 3:股权期货 4:差价 5:股票
			 */
      modal = this.modalCtrl.create(TraderContractPage, { 'id': this.id });
      modal.onDidDismiss(data => {
        if (this.tabStatus === 3 || this.tabStatus === 4) {
          if (this.supportNative) {
            this.screenOrientation.lock('any');
          }
        } else {
          if (this.supportNative) {
            this.screenOrientation.lock('portrait');
          }
        }
        this.socket.addSingleProListMb2Delay(this.id);
        Window.nowProId = this.id;
        this.getRealtimeData();
      });
    }
    else {
      this.present.presentToast('','请先开户', 'toast-red');
      modal = this.modalCtrl.create(OpenAccountPage, {});
      modal.onDidDismiss();
    }
    modal.present();
  }
  public bP: number = 0;
  public sP: number = 0;
  /* 计算买卖比例 */
  calcBS() {
    if (this.productList[this.currentIndex]._QAskQty.length > 0 && this.productList[this.currentIndex]._QBidQty.length > 0) {
      let bTotal = indexLibrary.sum(this.productList[this.currentIndex]._QAskQty);
      let sTotal = indexLibrary.sum(this.productList[this.currentIndex]._QBidQty);
      let totle = bTotal + sTotal;
      this.bP = bTotal / (totle) * 100;
      this.sP = sTotal / (totle) * 100;
    }
  }
}

