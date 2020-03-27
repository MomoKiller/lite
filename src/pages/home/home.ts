import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
@IonicPage()
export class HomePage {
	public homeUrl: any = 'http://news.tradeqq.cn/Appquote/news?l=zh-cn';

	constructor(public navCtrl: NavController, public navParams: NavParams, private sanitizer: DomSanitizer) {
		this.homeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.homeUrl);
	}
}