import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
@IonicPage()
export class HomePage {
	public homeUrl: any = 'https://www.jin10.com/example/jin10.com.html?fontSize=14px&theme=white';

	constructor(public navCtrl: NavController, public navParams: NavParams, private sanitizer: DomSanitizer) {
		this.homeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.homeUrl);
	}
}