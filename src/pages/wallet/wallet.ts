import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

@IonicPage()
@Component({
  selector: 'page-wallet',
  templateUrl: 'wallet.html',
})
export class WalletPage {

  public walletUrl: any = 'https://www.jin10.com/example/jin10.com.html?fontSize=14px&theme=white';

	constructor(public navCtrl: NavController, public navParams: NavParams, private sanitizer: DomSanitizer) {
		this.walletUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.walletUrl);
	}

}
