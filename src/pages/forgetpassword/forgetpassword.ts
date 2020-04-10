import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams, Nav } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { PresentProvider } from '../../providers/present/present';

@Component({
	selector: 'page-forgetpassword',
	templateUrl: 'forgetpassword.html',
})
export class ForgetPasswordPage {
	@ViewChild(Nav) nav: Nav;
	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams, 
		private sanitizer: DomSanitizer,
		private present: PresentProvider
	) { }

	public iframeUrl: any = null;			// 页面链接
	private ifloaded = false;
	private requireTime = 0;				// 页面请求次数
	private iframeTimeout = null;			// 

	private reback = (e) =>{
		if(e.data == 'close'){
			this.navCtrl.pop();
		}
		if(e.data == 'open'){
			this.ifloaded = true;
			this.present.dismissLoading();
		}
	}

	ionViewDidEnter(){
		this.present.presentLoading('正在加载页面 ...');
		this.loadIframe();
	}

	ionViewWillUnload(){
		this.iframeUrl = null;
		window.removeEventListener('message', this.reback, false);
	}

	loadIframe(){
		let self = this;
		self.requireTime ++;
		clearTimeout(self.iframeTimeout);
		const historyLanguage = localStorage.getItem('language') || 'zh';
		const curTime = new Date().getTime();
		let pageUrl = 'http://154.218.25.112:9002/api/' + historyLanguage + '/forgetpassword?time='+curTime;
		self.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pageUrl);
		self.iframeTimeout = setTimeout(() =>{
			if(!self.ifloaded){
				if(self.requireTime > 5){
					self.present.presentToast('请求超时，请稍后重试', 'toast-red');
					setTimeout(()=>{self.navCtrl.pop();}, 1000);
				}else{
					self.present.presentLoading('正在重新请求页面 ...');
					self.loadIframe();
				}
			}
		}, 5000);
		window.addEventListener('message', self.reback, false);
	}
}
