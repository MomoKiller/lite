import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { PresentProvider } from '../../providers/present/present';
import { AlertComponent } from '../../components/alert/alert';


@IonicPage()
@Component({
  selector: 'page-documentary',
  templateUrl: 'documentary.html',
})
export class DocumentaryPage {
  @ViewChild(AlertComponent) child: AlertComponent;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpServeProvider,
    public present: PresentProvider
  ) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DocumentaryPage');
  }

  ionViewDidEnter(){
    this.traderRequest();
  }

  public traderPage = 1;
  public traderRows = 5;
  public traderTotal = 0;
  public traderList = [];

  /* 模拟数据 */
  traderRequest(callback=function(){}, pager = false) {
    let _that = this;
    if (pager) this.traderPage++;
    let d = {
      page: this.traderPage,
      rows: this.traderRows,
      order: 'desc',
      sort: 'createTime'
    };
    let url = "client/fsr/trade/match/page";
    this.http.postForm(url, d, function (data) {
      if (data.code == '000000') {
        var res = JSON.parse(data.content);
        if (_that.traderList.length == 0) {
          _that.traderList = res.content;
          _that.traderTotal = res.totalElements;
        }
        else {
          if (_that.traderList.length === res.totalElements) {
            _that.traderPage--;
            _that.child.alertMsg(_that.present.translateText('已加载至最后一页'));
          }
          else {
            _that.traderList = _that.traderList.concat(res.content);
          }
        }
        callback();
      }
    });
  }

  /* 上拉加载数据 */
  public infiniteScroll:any = null;
  appendData(infiniteScroll){
    this.infiniteScroll = infiniteScroll;
		this.traderRequest(function(){
      infiniteScroll.complete();
    },true);
    
  }
  /* 刷新数据 */ 
  doRefresh(refresher){
    this.traderPage = 1;
    this.traderList = [];
    this.traderRequest();
    setTimeout(() => {
			refresher.complete();
		}, 1000);
  }

  /* 详情 */
  toDetail(item) {

  }
  /* 跟买 */
  toBuy(item) {

  }
}
