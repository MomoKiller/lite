import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

declare var Window, base64;

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
@IonicPage()
export class HomePage {
	public homeUrl: any = '';

	constructor(public navCtrl: NavController, public navParams: NavParams, private sanitizer: DomSanitizer) {

		const historyLanguage = localStorage.getItem('language');
		const curTime = new Date().getTime();
		let params = {
			"loginName": Window.userInfo.loginName,
			"userId": Window.userInfo.userId,
			"pw": localStorage.getItem('j_password')
		};
		let pageUrl = 'http://154.218.25.112:9002/api/' + historyLanguage + '/home/' + base64.encode(JSON.stringify(params)) + '?time=' + curTime;
		this.homeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pageUrl);

	}
}