import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController, LoadingController, AlertController, ModalController } from 'ionic-angular';
/* serves */
import { TranslateService } from "@ngx-translate/core";

@Injectable()
export class PresentProvider {

	private loader: any;    // 加载

	constructor(
		public http: HttpClient,
		public toastCtrl: ToastController,
		public alertCtrl: AlertController,
		public modalCtrl: ModalController,
		public loadingCtrl: LoadingController,
		public translateService: TranslateService
	) { }

	/* 自定义弹框 */
	presentToast(text, color = '') {
		this.translateService.get('确定').subscribe((res: string) => {
			let toast = this.toastCtrl.create({
				message: text,
				position: 'top',
				duration: 3000,
				showCloseButton: true,
				cssClass: color,
				closeButtonText: res
			});
			toast.present();
		});
	}

	/* 确认 */
	presentConfirm(text, callback) {
		let alert = this.alertCtrl.create({
			title: this.translateText('提示'),
			message: text,
			buttons: [
				{
					text: this.translateText('取消'),
					role: 'cancel',
				},
				{
					text: this.translateText('确定'),
					handler: () => {
						callback();
					}
				}
			]
		});
		alert.present();
	}

	/* 加载中 */
	presentLoading(text = '请等待...', showback = true, duration = 3000, pageChange = false, css = '') {
		this.translateService.get(text).subscribe((res: string) => {
			this.loader = this.loadingCtrl.create({
				content: res,
				showBackdrop: showback,
				duration: duration,
				dismissOnPageChange: pageChange,
				cssClass: css
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

	//文字翻译
	translateText(text: string) {
		let str: string;
		this.translateService.get(text).subscribe((res: string) => {
			str = res;
		});
		return str;
	}

	/* 打开遮罩层 */
	presentModal(page, json) {
		let modal = this.modalCtrl.create(page, json);
		modal.present();
	}
}
