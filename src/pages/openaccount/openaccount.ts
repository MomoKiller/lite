import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
declare var Window;
@IonicPage()
@Component({
	selector: 'page-openaccount',
	templateUrl: 'openaccount.html',
})
export class OpenAccountPage {
	constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public modalCtrl: ModalController, private sanitizer: DomSanitizer) {

	}
	public domesticUrl: any = null;
	ionViewDidLoad() {
		const time = Date.parse(new Date().toString());
		this.domesticUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${Window.config.line.webUrl.replace('trade/', '')}${Window.config.viewRealInfoUrl}?params={time:${time}}`);
	}
	dismiss() {
		this.viewCtrl.dismiss();
	}
}
