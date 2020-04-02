import { Component } from '@angular/core';
import { Platform, IonicPage, NavController, ModalController, NavParams, AlertController, LoadingController, App } from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";
/* pages */
import { TabsPage } from "../tabs/tabs";
import { RegisterPage } from '../register/register';
import { ForgetPasswordPage } from '../forgetpassword/forgetpassword';
/* serves */
import { SocketServeProvider } from "../../providers/socket-serve/socket-serve";
import { HttpServeProvider } from '../../providers/http-serve/http-serve';
import { PresentProvider } from '../../providers/present/present';

declare var store, Window, window;

@IonicPage()
@Component({
	selector: 'page-login',
	templateUrl: 'login.html'
})
export class LoginPage {
	private loader: any;
	private config = Window.config;
	public lineData = this.config.line;
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
		public translate: TranslateService,
		private _http: HttpServeProvider,
		private _socket: SocketServeProvider,
		private present: PresentProvider,
		private app: App
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
		this.checkLoginLine();
	}
	private isSaveLoginInfo: boolean = false;
	/* 是否显示密码 */
	public isShowPWD: string = 'password';

	logIn(orgcode, username, password) {
		if (orgcode.length == 0) {
			this.translate.get('请输入机构代码').subscribe((res: string) => {
				this.present.presentToast(res, 'toast-red');
			});
		}
		else if (username.length == 0) {
			this.translate.get('请输入登录账号').subscribe((res: string) => {
				this.present.presentToast(res, 'toast-red');
			});
		}
		else if (password.length == 0) {
			this.translate.get('请输入登录密码').subscribe((res: string) => {
				this.present.presentToast(res, 'toast-red');
			});
		}
		else {
			let body = {
				j_orgcode: orgcode,
				j_username: username,
				j_password: password
			};
			let self = this;
			if (this.loader === null) {
				this.translate.get('正在检测线路 ...').subscribe((res: string) => {
					this.present.presentLoading(res, true, 6000);
				});
			}

			/* 用户登录 */
			if (Window.currentLine == undefined) {
				setTimeout(() => {
					this.logIn(orgcode, username, password);
				}, 300);
				return;
			}
			var tmp_orgcode = null;
			this._http.postForm("login", body, function (data) {
				console.log('[获取登陆后返回的数据]', data);
				if (data.code == '000000') {
					Window.token = 'Bearer ' + data.content.token;
					Window.addParams();
					// 查询用户是否走完注册流程
					self._http.get('api/v1/crm/openaccount', function (info) {
						console.log('[查询用户是否走完注册流程]', info);
						const obj = JSON.parse(info.content);
						window.openAccountId = obj.id;
						if (obj.status !== 1) {
							self.toRegister(obj.status, body);
							return;
						}
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
								self.translate.get('不存在该账号').subscribe((res: string) => {
									self.present.presentToast(res, 'toast-red');
								});
								self.present.dismissLoading();
								return;
							}
						}
						else {
							self.translate.get('不存在该账号').subscribe((res: string) => {
								self.present.presentToast(res, 'toast-red');
							});
							self.present.dismissLoading();
							return;
						}
						self.present.dismissLoading();
						self.translate.get('正在连接行情 ...').subscribe((res: string) => {
							self.present.presentLoading(res, true, 6000);
						});
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
													QLastPrice: 0,									//最新价
													QChangeRate: 0,									//涨幅
													QChangeValue: 0,								//涨跌值
													QAskQty: 0,										//卖一
													QBidQty: 0,										//买一
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
							self.translate.get('无效的账号').subscribe((res: string) => {
								self.present.presentToast(res, 'toast-red');
							});
						}
					})
				}
				else {
					self.present.presentToast(data.message, 'toast-red');
					self.present.dismissLoading();
				}
			}, false);
		}
	}
	ionViewWillLeave() {
		this.present.dismissLoading();
	}
	private checkLoginLineTime: any = null;
	/* 选择线路 */
	checkLoginLine() {
		const self = this;
		const line = Window.config.line;
		self.translate.get('正在检测线路 ...').subscribe((res: string) => {
			self.present.presentLoading(res, true, 6000);
		});
		for (let i = 0, r = line.length; i < r; i++) {
			let befoTime = new Date().getTime();
			this.ping(line[i].webUrl + 'images/s.gif?time=' + new Date().getTime(), (status) => {
				let useTime = new Date().getTime() - befoTime;
				let __status;
				__status = status.hasOwnProperty('status') ? status.status : status;
				Window.config.line[i].ping = __status;
				Window.config.line[i].time = useTime;
				console.log('[状态]', __status);
				console.log('[当前配置文件]', Window.config, i);
				console.log('[更新线路ping]', Window.config.line[i]);
				if (__status === 200) {
					self.present.dismissLoading();
				}
			});
		}
		this.checkLoginLineTime = setTimeout(() => {
			let canUseLine = [];
			let index = 0;
			for (let i = 0, r = Window.config.line.length; i < r; i++) {
				if (typeof (Window.config.line[i].ping) === 'object' && Window.config.line[i].ping.status === 200) {
					canUseLine.push(i);
				}
				else if (typeof (Window.config.line[i].ping) === 'number' && Window.config.line[i].ping === 200) {
					canUseLine.push(i);
				}
			};
			/* 找最优线路 */
			for (let i = 0, r = canUseLine.length; i < r; i++) {
				if (canUseLine[i].time < canUseLine[index].time) {
					index = i;
				}
			}
			Window.currentLine = line[canUseLine[index]];
			if (Window.currentLine == undefined) {
				self.checkLoginLine();
				self.present.dismissLoading();
				return;
			}
			else {
				self.present.dismissLoading();
				clearTimeout(this.checkLoginLineTime);
			}
		}, 3000);
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
	public backButtonPressed: boolean = false;
	exitApp() {
		this.platform.registerBackButtonAction(() => {
			let overlay = this.app._appRoot._overlayPortal.getActive() || this.app._appRoot._modalPortal.getActive();
			if (overlay) {
				overlay.dismiss();
				return;
			}
			let activeVC = this.navCtrl.getActive();
			let page = activeVC.instance;
			if (page.tabs) {
				let activeNav = page.tabs.getSelected();
				if (activeNav.canGoBack()) {
					return activeNav.pop();
				} else {
					return this.showExit();
				}
			}
			if (page instanceof LoginPage) {//查看当前页面是否是登陆页面
				this.showExit();
				return;
			}
			this.app.getActiveNav().pop();//剩余的情况全部使用全局路由进行操作 
		});
	}

	// 双击退出
	showExit() {
		if (this.backButtonPressed) {
			this.platform.exitApp();
		} else {
			this.present.presentToast('再按一次退出应用');
			this.backButtonPressed = true;
			setTimeout(() => {
				this.backButtonPressed = false;
			}, 2000)
		}
	}

	/* 语言选择 */
	public languageOpen = false;
	public languageResult: any;
	language() {
		let alert = this.alertCtrl.create();
		const historyLanguage:string = localStorage.getItem('language')?localStorage.getItem('language'):'zh';
		alert.addInput({
			type: 'radio',
			label: '中文简体',
			value: 'zh',
			checked: historyLanguage === 'zh'?true:false
		});

		alert.addInput({
			type: 'radio',
			label: '中文繁体',
			value: 'hk',
			checked: historyLanguage === 'hk'?true:false
		});

		alert.addInput({
			type: 'radio',
			label: 'English',
			value: 'en',
			checked: historyLanguage === 'en'?true:false
		});
		this.translate.get('取消').subscribe((res: string) => {
			alert.addButton(res);
		});
		this.translate.get('确定').subscribe((res: string) => {
			alert.addButton({
				text: res,
				handler: (data: any) => {
					console.log('language data:', data);
					window.changeLanguage(data);
					this.languageOpen = false;
					this.languageResult = data;
				}
			});
		});
		alert.present();
	}
}
