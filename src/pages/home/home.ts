import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

declare var Window, base64, store;

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
@IonicPage()
export class HomePage {
	public homeUrl: any = '';
	public ifConsUse = false;

	constructor(public navCtrl: NavController, public navParams: NavParams, private sanitizer: DomSanitizer) {
		this.loadIframe();
		this.ifConsUse = true;
	}

	ionViewWillEnter(){
		if(!this.ifConsUse){
			this.loadIframe();
		}
	}
	ionViewDidEnter() {
		this.ifConsUse = false;
	}

	loadIframe(){
		const historyLanguage = localStorage.getItem('currentLanguage') || 'zh_CN';
		const curTime = new Date().getTime();
		let params = {
			"loginName": Window.userInfo.loginName,
			"userId": Window.userInfo.userId,
			"pw": store.get('pw')+'df8IO7jD^d'
		};
		let pageUrl = 'http://154.218.25.112:9002/api/' + historyLanguage + '/home/' + base64.encode(JSON.stringify(params)) + '?time=' + curTime;
		this.homeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pageUrl);
	}

}