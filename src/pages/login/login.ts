import { Component } from '@angular/core';
import { Platform, IonicPage, NavController, ModalController, NavParams, AlertController, LoadingController } from 'ionic-angular';
/* pages */
import { TabsPage } from "../tabs/tabs";
import { RegisterPage } from '../register/register';
import { ForgetPasswordPage } from '../forgetpassword/forgetpassword';
/* serves */
import { SocketServeProvider } from "../../providers/socket-serve/socket-serve";
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { PresentProvider } from '../../providers/present/present';
import { LanguageProvider } from '../../providers/language/language';

declare var store, Window;

@IonicPage()
@Component({
	selector: 'page-login',
	templateUrl: 'login.html'
})
export class LoginPage {
	private config = Window.config;
	/* 记住密码赋值 */
	public orgcode: string = '';
	public username: string = '';
	public password: string = '';

	constructor(
		public platform: Platform,
		public loadingCtrl: LoadingController,
		public alertCtrl: AlertController,
		public modalCtrl: ModalController,
		public navCtrl: NavController,
		public navParams: NavParams,
		private _http: HttpServeProvider,
		private _socket: SocketServeProvider,
		private present: PresentProvider,
		private language: LanguageProvider
	) {
		const self = this;
		Window.loginPageFreshConfig = () => {
			self.config = Window.config;
		}
		if (store.get('j_orgcode') && store.get('j_username') && store.get('j_password')) {
			this.orgcode = store.get('j_orgcode');
			this.username = store.get('j_username');
			this.password = store.get('j_password');
			this.isSaveLoginInfo = true;
			Window.isSaveLoginInfo = this.isSaveLoginInfo;
		}
		Window.showProList = [];
		/* 过期自动登录 */
		Window.autoLogin = () => {
			if (Window.changeUser == undefined) {
				setTimeout(() => {
					Window.autoLogin();
				}, 100);
				return;
			}
			if (self.isSaveLoginInfo && Window.changeUser) {
				self.logIn(store.get('j_orgcode'), store.get('j_username'), store.get('j_password'));
			}
		}
		Window.autoLogin();
	}
	private isSaveLoginInfo: boolean = false;
	/* 是否显示密码 */
	public isShowPWD: string = 'password';

	logIn(orgcode, username, password) {
		if (orgcode.length == 0) {
			this.present.presentToast('WAP_470', '请输入机构代码', 'toast-red');
		}
		else if (username.length == 0) {
			this.present.presentToast('WAP_170', '请输入登录账号', 'toast-red');
		}
		else if (password.length == 0) {
			this.present.presentToast('WAP_358', '请输入登录密码', 'toast-red');
		}
		else {
			let body = {
				j_orgcode: orgcode,
				j_username: username,
				j_password: password
			};
			let self = this;
			/* 用户登录 */
			if (Window.config.line == undefined) {
				setTimeout(() => {
					this.logIn(orgcode, username, password);
				}, 300);
				return;
			}
			var tmp_orgcode = null;
			this._http.postForm("login", body, function (data) {
				console.log('[获取登陆后返回的数据]', data);
				store.set('pw', password);
				if (data.code == '000000') {
					Window.token = 'Bearer ' + data.content.token;
					Window.addParams();
					if (Window.config.orgcode) {
						tmp_orgcode = data.content.orgCode;
						var num = 0;
						if (Window.config.orgcode[0] == '*') {
							num++;
						} else {
							for (let i = 0, r = Window.config.orgcode.length; i < r; i++) {
								if (tmp_orgcode.indexOf(Window.config.orgcode[i]) >= 0) {
									num++;
								}
							}
						}
						if (num <= 0) {
							self.present.presentToast('WAP_297', '不存在该账号', 'toast-red');
							self.present.dismissLoading();
							return;
						}
					}
					else {
						self.present.presentToast('WAP_297', '不存在该账号', 'toast-red');
						self.present.dismissLoading();
						return;
					}
					self.present.dismissLoading();
					self.present.presentLoading('WAP_372', '正在连接行情 ...');
					if ((data.content.userState == -2 || data.content.userState == 1 || data.content.userState == 2 || data.content.userState == 8000 || data.content.userState == 8001) && data.content.userType == 4) {
						if (self.isSaveLoginInfo === true) {
							store.set('j_orgcode', orgcode);
							store.set('j_username', username);
							store.set('j_password', password);
						}
						else {
							store.remove('j_orgcode');
							store.remove('j_username');
							store.remove('j_password');
						}
						sessionStorage.setItem('j_orgcode', orgcode);
						sessionStorage.setItem('j_username', username);
						sessionStorage.setItem('j_password', password);
						Window.userInfo = data.content;
						Window.openReconnect = true;
						Window.changeUser = true;
						self._socket.creatNewSocket(function () {
							/* 获取所有分类 */
							self._http.postJson("client/config/product/category/query/list", {}, function (res) {
								if (res.code == '000000') {
									Window.allContractNav = JSON.parse(res.content);
									/* 获取所有合约 */
									self._http.get("client/config/product/product/query/list/null", function (_data) {
										Window.allProductList = [];
										let productList = JSON.parse(_data.content);
										console.log('[合约列表]', productList);
										for (let i = 0, r = productList.length; i < r; i++) {
											Window.allProductList.push({
												categoryId: productList[i].categoryId, 			// 分类ID
												categoryIds: productList[i].categoryIds, 		// 分类ID数组
												productId: productList[i].productId, 			// 合约ID
												productName: productList[i].commodityName, 		// 合约名称
												productCode: productList[i].contractCode, 		// 合约代码
												commodityCode: productList[i].commodityCode,
												commodityId: productList[i].commodityId, 		// 合约品种ID 
												color: '',										// 涨跌颜色标识
												QLastPrice: 0,									// 最新价
												QChangeRate: 0,									// 涨幅
												QChangeValue: 0,								// 涨跌值
												QAskQty: 0,										// 卖一
												QBidQty: 0,										// 买一
												oldPrice: 0,
												oldPriceChange: 1,
												QTotalQty: 0,
												Apercent: 0,
												unionMinPrices: productList[i].unionMinPrices,
												Stamp: 0,
												QHighPrice: 0,
												QPreClosingPrice: 0,
												QLowPrice: 0,
												QPositionQty: 0,
												QOpeningPrice: 0,
												_QAskPrice: [],
												_QAskQty: [],
												_QBidPrice: [],
												_QBidQty: [],
												commoditySort: productList[i].commoditySort,
												contractSort: productList[i].contractSort,
												priceGearsNum: productList[i].priceGearsNum,
												marketSort: productList[i].marketSort,
												contractNum: productList[i].contractNum,
												/**
												 * commodityType 
												 * 0:期货 1:连续 2:股配 3:股权期货 4:差价 5:股票
												 */
												commodityType: productList[i].commodityType,
												minOrderVol: productList[i].minOrderVol			// 最小合约交易手数
											});
										}
										Window.showIonicMenu(true);
										for (let i in self.config.line) {
											if (i == self.config.env) {
												Window.config = self.config.line[i];
												break;
											}
										}
										self.navCtrl.setRoot(TabsPage);
									});
								}
							});
						});
					}
					else {
						self.present.presentToast('WAP_499', '无效的账号', 'toast-red');
					}
				}
				else {
					self.present.presentToast('', data.message, 'toast-red');
					self.present.dismissLoading();
				}
			}, false);
		}
	}
	ionViewWillLeave() {
		this.present.dismissLoading();
	}
	toRegister(status, info) {
		this.navCtrl.push(RegisterPage, { status: status, info: info });
	}
	toForgetPwd() {
		this.navCtrl.push(ForgetPasswordPage);
	}
	changeSaveLogin() {
		Window.isSaveLoginInfo = this.isSaveLoginInfo;
		if (!this.isSaveLoginInfo) {
			store.remove('j_orgcode');
			store.remove('j_username');
			store.remove('j_password');
		}
	}
	clearSpace(str, model) {
		const _str = str.replace(/\s/g, "");
		setTimeout(() => {
			eval("(" + "self." + model + "='" + _str + "'" + ")");
		}, 10);
	}
	ping(ip, callback = function (bool) { }) {
		this._http.check_line(ip, function (status) {
			callback(status);
		});
	}

	/* 退出App */
	exitApp() {
		this.present.presentConfirm(
			this.present.translateText('WAP_280', '退出应用'), ()=>{
			this.platform.exitApp();
		});
	}

	/* 语言选择 */ 
	public languageOpen = false;
	public languageResult: any;
	public languageList = JSON.parse(localStorage.getItem('isoCodes'));
	public currentLanguage = localStorage.getItem('currentLanguage') || 'zh_CN';
	lanSwitch(){
		let alert = this.alertCtrl.create();
		this.currentLanguage = localStorage.getItem('currentLanguage') || 'zh_CN';
		for(let i=0;i<this.languageList.length; i++){
			alert.addInput({
				type: 'radio',
				label: this.languageList[i].isoName,
				value: this.languageList[i].isoCode,
				checked: this.currentLanguage === this.languageList[i].isoCode?true:false
			});
		}
		this.language.get('WAP_61', '取消', res => {
			alert.addButton(res);
		});

		this.language.get('WAP_110','确定', res => {
			alert.addButton({
				text: res,
				handler: (data: any) => {
					console.log('language data:', data);
					this.modifyLanguage(data);
					this.languageOpen = false;
					this.languageResult = data;
				}
			});
		});
		alert.present();
	}

	/* 选择语言 */
	modifyLanguage(lan) {
		// this.tips.presentLoading('WAP_516','正在切换语言 ...');
		// 获取当前的语言和版本号
		const data = {
			"dataCode": "string",
			"isoCode": this.currentLanguage,
			"version": localStorage.getItem(this.currentLanguage) ? JSON.parse(localStorage.getItem(this.currentLanguage)).version : -1
		};
		// 设置当前语言
		localStorage.setItem('currentLanguage',lan);

		this._http.postJson('api/v2/base/dataCodeI8n',data,res => {
			// 判断是否有新版本
			if(JSON.stringify(res.content.data) !== '{}') {
				localStorage.setItem(this.currentLanguage,JSON.stringify(res.content));
				Window.currentLanguageMap = res.content.data;
			}
			location.reload();
		});
	}
}
