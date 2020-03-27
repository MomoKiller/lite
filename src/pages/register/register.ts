import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Navbar, LoadingController, Platform, ToastController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from "@ngx-translate/core";
import { PresentProvider } from '../../providers/present/present';

declare var Window,window;
@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
	@ViewChild(Navbar) navbar: Navbar;
	iframeUrl: any = null;
	constructor(
		public toastCtrl: ToastController, 
		public loadingCtrl: LoadingController, 
		public platform: Platform, 
		public translate: TranslateService, 
		public navCtrl: NavController, 
		public navParams: NavParams, 
		private sanitizer: DomSanitizer,
		private present: PresentProvider
	) { }
	public ifloaded = false;
	public reback = (e) =>{
		if(e.data == 'close'){
			this.navCtrl.pop();
		}
		if(e.data == 'open'){
			this.ifloaded = true;
			this.present.dismissLoading();
		}
	}
	ionViewDidEnter() {
		this.present.presentLoading('正在加载注册页面 ...', true, 5000);
		let info = this.navParams.get('info');
		const time = Date.parse(new Date().toString());
		let params = null;
		if(info) {
			info.time = time;
			info.id = Window.config.pcId,
			info.token = Window.token;
			info = encodeURI(JSON.stringify(info));
			params = info;
		}
		else{
			Window.token = null;
			const res = {
				time: time,
				id: Window.config.pcId,
				token: Window.token
			};
			const _res = encodeURI(JSON.stringify(res));
			params = _res;
		}
		this.loadIframe(params);
	}
	// 加载IFRAME
	public timeoutIfra = null;
	public requireTime = 0;	// 请求次数
	loadIframe(params) {
		let self = this;
		self.requireTime ++;
		clearTimeout(self.timeoutIfra);
		if(Window.currentLine) {
			self.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${Window.currentLine.webUrl.replace('trade/','')}${Window.config.registerUrl}?params=${params}`);
			self.timeoutIfra = setTimeout(()=>{
				if(!self.ifloaded){
					if(self.requireTime >5){
						this.present.presentToast('请求超时，请稍后重试','toast-red');
						setTimeout(()=>{this.navCtrl.pop();}, 1000);
					}else{
						this.present.presentLoading('正在重新请求数据 ...', true, 5000);
						self.loadIframe(params);
					}
				}
			}, 5000);
			window.addEventListener("message",this.reback,false);
		} else {
			self.timeoutIfra = setTimeout(() => {
				this.loadIframe(params);
			}, 300);
		}
	}
	ionViewWillUnload() {
		this.iframeUrl = null;
		window.removeEventListener("message",this.reback,false);
	}
}
