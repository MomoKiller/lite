import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Platform} from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
/* http request */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from "@ngx-translate/core";
/****/

declare var Window,window;
@IonicPage()
@Component({
	selector: 'page-realname',
	templateUrl: 'realname.html',
})
export class RealnamePage {
	constructor(
			public loadingCtrl: LoadingController,
			public toastCtrl: ToastController,
			public navCtrl: NavController,
			public navParams: NavParams,
			public platform: Platform,
			public http: HttpServeProvider,
			private sanitizer: DomSanitizer,
			public translate: TranslateService
		) {

	}

	public config = null;
	public data = null;
	private loader:any;
	// public groupImg = {
	// 	certificateA: `${Window.currentLine.webUrl}api/v1/crm/tmpdownload/${window.openAccountId}/1?time=${new Date().getTime()}`,
	// 	certificateB: `${Window.currentLine.webUrl}api/v1/crm/tmpdownload/${window.openAccountId}/2?time=${new Date().getTime()}`,
	// 	certificateC: `${Window.currentLine.webUrl}api/v1/crm/tmpdownload/${window.openAccountId}/3?time=${new Date().getTime()}`,
	// 	certificateD: `${Window.currentLine.webUrl}api/v1/crm/tmpdownload/${window.openAccountId}/5?time=${new Date().getTime()}`
	// }
	// 获取图片新街口 --191015
	public groupImg = {
		certificateA: '',
		certificateB: '',
		certificateC: '',
		certificateD: ''
	}
	ionViewDidLoad() {
		/* 实名信息 iframe 加载
		this.presentLoading('正在加载注册页面 ...');
		this.config = {
			certificateA: Window.config.contactChannel.certificateA,
			certificateB: Window.config.contactChannel.certificateB,
			certificateC: Window.config.contactChannel.certificateC,
			certificateD: Window.config.contactChannel.certificateD
		};
		// 获取实名数据
		this.http.get('api/v1/crm/personalInfo',(res) => {
			this.data = res.content;
			console.log(this.data);
			this.dismissLoading();
		});
		// 获取图片信息 --191015
		this.http.get('api/v1/crm/download/file/1?time=' + (new Date().getTime()), res => {
			this.groupImg.certificateA = "data:image/png;base64," + res.content;
		});
		this.http.get('api/v1/crm/download/file/2?time=' + (new Date().getTime()), res => {
			this.groupImg.certificateB = "data:image/png;base64," + res.content;
		});
		this.http.get('api/v1/crm/download/file/3?time=' + (new Date().getTime()), res => {
			this.groupImg.certificateC = "data:image/png;base64," + res.content;
		});
		this.http.get('api/v1/crm/download/file/5?time=' + (new Date().getTime()), res => {
			this.groupImg.certificateD = "data:image/png;base64," + res.content;
		});
		*/
		this.presentLoading('正在加载实名信息 ...');
		const time = Date.parse(new Date().toString());
		let params = null;
		const res = {
			time: time,
			id: Window.config.pcId,
			token: Window.token
		};
		const _res = encodeURI(JSON.stringify(res));
		params = _res;
		this.loadIframe(params);	
	}
	presentLoading(text) {
		this.loader = this.loadingCtrl.create({
			content: text,
			showBackdrop: true,
			duration: 5000
		});
		this.loader.present();
	}
	dismissLoading() {
		this.loader.dismiss();
	}
	// 弹框
	presentToast(text,color = '') {
		let toast = this.toastCtrl.create({
			message: text,
			position: 'top',
			duration: 5000,
			showCloseButton: true,
			cssClass:color,
			closeButtonText: this.translateText('确定')
		});
		toast.present();
	}
	//翻译
	translateText(text){
		let result:any;
		console.log(text);
		this.translate.get(text).subscribe((res: string) => {
			result = res;
		});
		return result;
	}
	// iframe 实名信息iframe 加载
	public iframe = null;
	public ifloaded = false;
	public requireTime = 0;
	public timeoutIfra = null;
	private reback = (e) =>{
		if(e.data == 'close'){
			this.navCtrl.pop();
		}
		if(e.data == 'open'){
			this.ifloaded = true;
			this.dismissLoading();
		}
	}
	// 加载 iframe
	loadIframe(params){
		let self = this;
		this.iframe = this.sanitizer.bypassSecurityTrustResourceUrl(`${Window.currentLine.webUrl.replace('trade/','')}${Window.config.viewRealNameInfo}?params=${params}`);
		self.requireTime++;
		clearTimeout(this.timeoutIfra);
		this.timeoutIfra = setTimeout(() => {
			if(!self.ifloaded){
				if(self.requireTime >5){
					this.presentToast('请求超时，请稍后重试','toast-red');
					setTimeout(()=>{this.navCtrl.pop();}, 1000);
				}else{
					this.presentLoading('正在重新请求数据 ...');
					self.loadIframe(params);
				}
			}
		},5000);
		window.addEventListener("message",this.reback,false);
	}
}
