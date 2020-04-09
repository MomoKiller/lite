import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

declare var Window, base64;

@IonicPage()
@Component({
  selector: 'page-myaccount',
  templateUrl: 'myaccount.html',
})
export class MyaccountPage {

  public myaccountUrl: any = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, private sanitizer: DomSanitizer) {
    const historyLanguage = localStorage.getItem('language');
    let params = {
      "loginName": Window.userInfo.loginName,
      "userId": Window.userInfo.userId,
      "pw": localStorage.getItem('j_password')
    };
    let pageUrl = 'http://154.218.25.112:9002/api/' + historyLanguage + '/my/' + base64.encode(JSON.stringify(params));
    this.myaccountUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pageUrl);
  }


  /* 登出 */
  logout() {
    Window.currentClassifyA = undefined;
    Window.currentClassifyB = undefined;
    Window.changeUser = false;
    Window.loginout();
  }
}
