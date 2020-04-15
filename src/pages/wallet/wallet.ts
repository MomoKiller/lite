import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

declare var Window, base64, store;

@IonicPage()
@Component({
  selector: 'page-wallet',
  templateUrl: 'wallet.html',
})
export class WalletPage {

  public walletUrl: any = '';
  public ifConsUse = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private sanitizer: DomSanitizer) {
    // this.walletUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.walletUrl);
    this.loadIframe();
		this.ifConsUse = true;
  }

  ionViewWillEnter() {
    if (!this.ifConsUse) {
      this.loadIframe();
    }
  }
  ionViewDidEnter() {
    this.ifConsUse = false;
  }

  loadIframe() {
    const historyLanguage = localStorage.getItem('currentLanguage') || 'zh_CN';
    const curTime = new Date().getTime();
    let params = {
      "loginName": Window.userInfo.loginName,
      "userId": Window.userInfo.userId,
      "pw": store.get('pw')+'df8IO7jD^d'
    };
    let pageUrl = 'http://154.218.25.112:9002/api/' + historyLanguage + '/wallet/' + base64.encode(JSON.stringify(params)) + '?time=' + curTime;
    this.walletUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pageUrl);
  }

}
