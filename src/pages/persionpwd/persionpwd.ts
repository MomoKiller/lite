import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, AlertController } from 'ionic-angular';

/* service */
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { PresentProvider } from '../../providers/present/present';
import { LanguageProvider } from '../../providers/language/language';
/****/
declare var Window;
@IonicPage()
@Component({
	selector: 'page-persionpwd',
	templateUrl: 'persionpwd.html'
})
export class PersionPwdPage {

	/* 修改密码 变量 */
	private newPwd: string;
	private repeatPwd: string;
	public oldPwd: string = '';

	public postCodeText: string = '获取验证码';
	private isPostCode: boolean = false;
	private countDownTime: number = 60;

	public checkCode: string = '';
	public ways: Array<any> = [];
	public checkWays: any;
	public value: string = '';
	public config = Window.config;
	private regPassword = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;

	public userValidate;

	constructor(
		public alertCtrl: AlertController, 
		public http: HttpServeProvider, 
		public navCtrl: NavController, 
		public viewCtrl: ViewController, 
		public navParams: NavParams, 
		private present: PresentProvider,
		private language: LanguageProvider
	) { }

	ionViewDidLoad() {
		let self = this;
		this.userValidate = Window.userValidate;
		/* 获取可用验证方式 */
		this.http.postJson("client/user/get/ways", {}, function (res) {
			console.log(res);
			if (res.code == '000000') {
				self.ways = res.ways;
				self.checkWays = self.config.isUseSimpleRegister ? 'old' : self.ways[0].type;
				if (self.ways.length > 0) {
					self.value = self.ways[0].content;
				}
			}
			else {
				self.present.presentToast('', res.message, 'toast-red');
			}
		});
	}
	changeCheckWays() {
		this.ways.forEach(x => {
			if (x.type == this.checkWays) {
				this.value = x.content;
			}
		});
	}
	countDown() {
		let self = this;
		if (this.countDownTime > 0) {
			setTimeout(() => {
				self.countDownTime--;
				self.language.get('WAP_163', '秒后可重新获取', res =>{
					self.postCodeText = self.countDownTime + res;
				});
				self.countDown();
			}, 1000);
		}
		else {
			this.isPostCode = false;
			self.language.get('WAP_331', '重新获取验证码', res =>{
				self.postCodeText = res;
			});
			
		}
	}
	checkedWays() {
		if (this.checkWays == 0) {
			let reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
			if (this.value == '') {
				this.present.presentToast('WAP_486', '请填写验证邮箱', 'toast-red');
				return false;
			}
			else if (!reg.test(this.value)) {
				this.present.presentToast('WAP_39', '验证邮箱格式不正确', 'toast-red');
				return false;
			}
		}
		else if (this.checkWays == 1) {
			let reg = new RegExp("^1[3|4|5|7|8][0-9]{9}$");
			if (this.value == '') {
				this.present.presentToast('WAP_203', '请填写验证手机', 'toast-red');
				return false;
			}
			else if (!reg.test(this.value)) {
				this.present.presentToast('WAP_262', '验证手机格式不正确', 'toast-red');
				return false;
			}
		}
		return true;
	}
	getCheckCode() {
		let self = this;
		const body = {
			"validInfo": this.value,
			"validType": this.checkWays,
			"validCodeType": 1
		}
		if (this.isPostCode == false) {
			this.isPostCode = true;
			this.http.postJson("client/user/get/validcode", body, function (res) {
				console.log(res);
				if (res.code == '000000' && res.success) {
					this.present.presentToast('WAP_262', '验证码已发送,请注意查收', 'toast-green');
					self.countDown();
				}
				else {
					self.present.presentToast('WAP_191', '发送失败,请重新尝试', 'toast-red');
					self.isPostCode = false;
				}
			});
		}
	}
	changePwd(): void {
		let self = this;
		if (this.checkWays == 'old') {
			if (this.oldPwd == '') {
				self.present.presentToast('WAP_101', '密码不能为空', 'toast-red');
			}
			else if (!this.newPwd) {
				self.present.presentToast('WAP_282', '新密码不能为空', 'toast-red');
			}
			else if (this.newPwd.length < 8) {
				self.present.presentToast('WAP_463', '登录密码不能小于8位', 'toast-red');
			}
			else if (!this.regPassword.test(this.newPwd)) {
				self.present.presentToast('WAP_53', '登录密码格式不正确', 'toast-red');
			}
			else if (this.newPwd != this.repeatPwd) {
				self.present.presentToast('WAP_222', '新密码与确认密码不一致', 'toast-red');
			}
			else {
				let body = {
					"type": 1,
					"value": this.newPwd,
					"password": this.oldPwd
				};
				this.http.postJson("client/user/edit/key/info", body, function (res) {
					if (res.code == '000000') {
						self.showPrompt();
						// 191021 @wuwp 关闭弹框
						self.viewCtrl.dismiss();
					}
					else {
						self.present.presentToast('', res.message, 'toast-red');
					}
				}, false);
			}
		}
		else {
			if (!this.newPwd) {
				self.present.presentToast('WAP_282', '新密码不能为空', 'toast-red');
			}
			else if (this.newPwd.length < 8) {
				self.present.presentToast('WAP_463', '登录密码不能小于8位', 'toast-red');
			}
			else if (!this.regPassword.test(this.newPwd)) {
				self.present.presentToast('WAP_53', '登录密码格式不正确', 'toast-red');
			}
			else if (this.newPwd != this.repeatPwd) {
				self.present.presentToast('WAP_222', '新密码与确认密码不一致', 'toast-red');
			}
			else {
				let body = {
					"validInfo": this.newPwd,
					"code": this.checkCode,
					"validType": this.checkWays,
					"validCodeType": 1
				};
				/* 个人密码修改 */
				this.http.postJson("client/user/update/key2", body, function (data) {
					if (data.code == '000000') {
						self.present.presentToast('WAP_343', '密码修改成功,请重新登录', 'toast-red');
						Window.loginout();
					}
					else {
						self.present.presentToast('', data.message, 'toast-red');
					}
					self.newPwd = '';
					self.repeatPwd = '';
				})
			}
		}
	}
	showPrompt() {
		const prompt = this.alertCtrl.create({
			title: this.present.translateText('WAP_422','提示'),
			message: this.present.translateText('WAP_343',"密码修改成功,请重新登录"),
			buttons: [
				{
					text: this.present.translateText('WAP_110','确定'),
					handler: data => {
						Window.currentClassifyA = undefined;
						Window.currentClassifyB = undefined;
						Window.loginout();
					}
				}
			]
		});
		prompt.present();
	}
}
