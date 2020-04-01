import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

declare var Window;

@IonicPage()
@Component({
  selector: 'page-myaccount',
  templateUrl: 'myaccount.html',
})
export class MyaccountPage {

  public myaccountUrl: any = 'https://www.jin10.com/example/jin10.com.html?fontSize=14px&theme=white';

	constructor(public navCtrl: NavController, public navParams: NavParams, private sanitizer: DomSanitizer) {
		this.myaccountUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.myaccountUrl);
	}


  logout(){
    Window.currentClassifyA = undefined;
    Window.currentClassifyB = undefined;
    Window.changeUser = false;
    Window.loginout();
  }
}
