import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController, LoadingController, AlertController, ModalController } from 'ionic-angular';
/* serves */
import { LanguageProvider } from '../../providers/language/language';

@Injectable()
export class PresentProvider {

	private loader: any;    // 加载

	constructor(
		public http: HttpClient,
		public toastCtrl: ToastController,
		public alertCtrl: AlertController,
		public modalCtrl: ModalController,
		public loadingCtrl: LoadingController,
		private language: LanguageProvider
	) { }

	/* 自定义弹框 */
	presentToast(text?,defaultText?,color = '') {
		this.language.get(text,defaultText, value => {
            let toast = this.toastCtrl.create({
				message: value,
				position: 'top',
				duration: 3000,
				showCloseButton: true,
				cssClass:color,
				closeButtonText: String(this.translateText('WAP_110','确定'))
			});
			toast.present();
        })
	}

	/* 确认 */
	presentConfirm(text, callback) {
		let alert = this.alertCtrl.create({
			title: this.translateText('WAP_422','提示'),
			message: text,
			buttons: [
				{
					text: this.translateText('WAP_61','取消'),
					role: 'cancel',
				},
				{
					text: this.translateText('WAP_110', '确定'),
					handler: () => {
						callback();
					}
				}
			]
		});
		alert.present();
	}

	/* 加载中 */
	presentLoading(v,defaultValue) {
		this.language.get(v,defaultValue, value => {
            this.loader = this.loadingCtrl.create({
				content: value,
				showBackdrop: true
			});
			this.loader.present();
        });
	}
	
	/* 加载中-取消 */
	dismissLoading() {
		if (this.loader) {
			this.loader.dismiss();
		}
		this.loader = null;
	}

	/* 文字翻译 */
	translateText(value, defaultValue){
		return this.language.get(value, defaultValue);
	}

	/* 打开遮罩层 */
	presentModal(page, json) {
		let modal = this.modalCtrl.create(page, json);
		modal.present();
	}
}
