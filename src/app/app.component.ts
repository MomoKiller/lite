import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';
import { Platform, App, ToastController, LoadingController, NavController, Nav } from 'ionic-angular';
/* pages */
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { WalletPage } from '../pages/wallet/wallet';
import { MarketPage } from '../pages/market/market';
import { MyaccountPage } from '../pages/myaccount/myaccount';
import { DocumentaryPage } from '../pages/documentary/documentary';
import { ProductdetailPage } from '../pages/productdetail/productdetail';
/* serves */
import { HttpServeProvider } from '../providers/http-serve/http-serve';
import { SocketServeProvider } from "../providers/socket-serve/socket-serve";
import { PresentProvider } from '../providers/present/present';
import { LanguageProvider } from '../providers/language/language';

declare var Window, window, $, screen: any, indexLibrary, baseConfig;

@Component({
	templateUrl: 'app.html'
})
/* cordova plugin add cordova-plugin-app-version */
export class MyApp {
	@ViewChild(Nav) nav: Nav;
	rootPage: any;
	pages: Array<{ title: string, component: string, class: string }>;
	public disconnect: boolean = false;
	public showIonicMenu: boolean = false;
	private registerBackButton;
	public checkPage;
	public registerBackEvent: Function;

	constructor(
		private app: App,
		private keyboard: Keyboard,
		public platform: Platform,
		private splashScreen: SplashScreen,
		public loadingCtrl: LoadingController,
		public toastCtrl: ToastController,
		public http: HttpServeProvider,
		private socket: SocketServeProvider,
		private present: PresentProvider,
		private language: LanguageProvider
	) {
		/* apk新增 */
		platform.ready().then((readySource) => {
			this.present.presentLoading('WAP_123','初次加载配置文件，请耐心等候 ...');
			window.removeSysLoading();
			Window.changeUser = true;
			this.splashScreen.hide();
			const afterGetVersion = () => {
				if (localStorage.getItem('config') == null || localStorage.getItem('config') == undefined || localStorage.getItem('config') == "undefined") {
					Window.config = baseConfig[Window.appVersion];
					localStorage.setItem('config', JSON.stringify(Window.config));
					this.present.dismissLoading();
					this.getConfigResult = Window.config;
					// this.rootPage = LoginPage;
					this.getLanguage(()=>{this.rootPage = LoginPage;});
					this.getOnlineConfig();
				}
				else {
					Window.config = JSON.parse(localStorage.getItem('config'));
					this.present.dismissLoading();
					// this.rootPage = LoginPage;
					this.getLanguage(()=>{this.rootPage = LoginPage;});
					this.getOnlineConfig();
				}
				if (window.StatusBar) {
					window.StatusBar.styleDefault();
				}
			}
			if (window.cordova) {
				screen.orientation.lock('portrait');
				this.keyboard.hideKeyboardAccessoryBar(false);
				window.cordova.getAppVersion.getVersionNumber((version) => {
					Window.appVersion = version;
					afterGetVersion();
				});
			}
			else {
				//测试指定环境
				Window.appVersion = "sunx_app_test";
				//监听浏览器返回
				window.history.pushState(null, null, "#");
				window.addEventListener("popstate", (e) => {
					let activeNav: NavController = this.app.getActiveNav();
					activeNav.pop();
					window.history.pushState(null, null, "#");
				});
				afterGetVersion();
			}
			this.registerBackEvent = this.platform.registerBackButtonAction(() => {
				if (this.goBackLogic()) {
					if (this.checkPage) {
						//如果是根目则按照需求1处理
						this.exitApp();
					}
					else {
						//非根目录返回上一级页面
						this.app.goBack();
					}
				}
			}, 10);
			const height = $(window).height();

			if (this.platform.is('ios')) {
				window.isShowKeyBoard = false;
				this.keyboard.disableScroll(true);
				window.addEventListener('native.keyboardshow', (e: any) => {
					$('html,body').css("height", `${height - e.keyboardHeight}px`);
					window.isShowKeyBoard = true;
					document.body.scrollIntoView(true);
				});
				window.addEventListener('native.keyboardhide', (e: any) => {
					$('html,body').css("height", `${height}px`);
					window.isShowKeyBoard = false;
					document.body.scrollIntoView(true);
				});
			}
		});
		Window.showIonicMenu = (bool) => {
			this.showIonicMenu = bool;
		}
		Window.reload = () => {
			this.disconnect = true;
		}
		/* 退出登录 */
		Window.loginout = () => {
			if (!Window.socket) {
				return;
			}
			this.socket.destoryAll();
			Window.socket.close();
			delete Window.socket;
			Window.showIonicMenu(false);
			this.nav.setRoot(LoginPage);
		}
		window.removeSysLoading = function () {
			$('#enter-loading').remove();
		};

	}

	/* 正式环境 */
	private onlineConfigUrl = [
		"http://47.111.146.166:65501/staticResources/config.json",
		"http://47.111.146.166:65500/staticResources/config.json",
		"http://47.111.146.166:65503/staticResources/config.json",
		"http://47.107.114.218:65500/staticResources/config.json",
		"http://47.107.120.122/staticResources/config.json"
	];
	private testConfigUrl = [
		"http://47.99.210.59:33205/staticResources/config-2.json"	// 测试环境路径
	];

	/* 设置当前配置文件线路 */
	private currentOnlineConfigUrl = this.testConfigUrl;
	/* 热更新提示显示 */
	public hotCodePushLoading: boolean = false;
	/* 获取到的配置文件 */
	getConfigResult = null;
	/* 可用线路 */
	canUseConfigUrl = [];
	getOnlineConfig() {
		let self = this;
		//可用线路数组
		for(let i=0,r=this.currentOnlineConfigUrl.length;i<r;i++){
			this.http.get(this.currentOnlineConfigUrl[i] + "?time=" + new Date().getTime(), (res: any) => {
				console.log('[获取线上配置文件]', res);
				if (typeof (res) === 'string') {
					res = JSON.parse(res);
				}
				if (res.hasOwnProperty('status') === false) {
					this.getConfigResult = res[Window.appVersion];
					if (!this.getConfigResult) {
						this.present.presentToast('WAP_497','未在配置列表中找到对应的客户ID', 'toast-red');
						return;
					}
					this.canUseConfigUrl.push(self.currentOnlineConfigUrl[i]);
					checkRes();
				}
			}, false, true);
		}
		
		setTimeout(() => {
			if (this.canUseConfigUrl.length === 0) {
				this.getOnlineConfig();
			}
		}, 5000);
		function getResult() {
			/* 比较版本号 */
			if (localStorage.getItem('config') && localStorage.getItem('config') != 'undefined') {
				Window.config = self.getConfigResult;
				const historyConfig = JSON.parse(localStorage.getItem('config'));
				self.whiteBaseConfig(self.getConfigResult, self.canUseConfigUrl);
				if (Window.config.version != historyConfig.version) {
					self.present.presentToast('WAP_493','检测到配置文件有更新,正在加载配置文件 ...','toast-green');
					Window.loginout();
				}
				/* 检测是否有热更新 */
				if (historyConfig.hotCodePush && Window.config.hotCodePush > historyConfig.hotCodePush) {
					self.hotCodePushLoading = true;
				}
				// self.rootPage = LoginPage;
				// 设置语言
				self.getLanguage(()=>{self.rootPage = LoginPage;});
			}
			else {
				self.whiteBaseConfig(Window.config, self.canUseConfigUrl);
				// self.rootPage = LoginPage;
				// 设置语言
				self.getLanguage(()=>{self.rootPage = LoginPage;});
			}
			self.present.dismissLoading();
		}
		function checkRes() {
			if (Window.config == undefined || self.canUseConfigUrl.length === 0) {
				setTimeout(function () {
					self.present.presentToast('WAP_498','网络环境不佳,正在尝试重连 ...', 'toast-red');
					checkRes();
				}, 10000);
			}
			else {
				getResult();
			}
		}
	}
	/* 写入替换全局本地配置变量 */
	whiteBaseConfig(res, canUseConfigUrl) {
		Window.configurl = canUseConfigUrl[0].replace('config.json', '');
		localStorage.setItem('config', JSON.stringify(Window.config));
		localStorage.setItem('configurl', Window.configurl);
		/* 单独处理首页面配置文件更新 */
		if (typeof (Window.loginPageFreshConfig) == 'function') {
			Window.loginPageFreshConfig();
		}
	}

	/* 环境为浏览器时 新增全屏浏览器*/
	private fullScreen: boolean = false;
	fullScreenBroswer() {
		if (!window.cordova) {
			const dom = document.querySelector(".product-detail-page");
			if (dom == null) {
				this.fullScreen = !this.fullScreen;
				if (this.fullScreen) {
					indexLibrary.fullScreen();
				}
				else {
					indexLibrary.exitFullscreen();
				}
			}
		}
	}
	exitApp() {
		if (this.registerBackButton) {
			this.platform.exitApp();
		}
		else {
			this.language.get('WAP_352','再按一次退出应用',value => {
                this.toastCtrl.create({
					message: value,
					duration: 2000,
					position: 'top',
					cssClass: 'toast-yellow'
				}).present();
            });
			setTimeout(() => this.registerBackButton = false, 2000);//2秒内没有再次点击返回则将触发标志标记为false
		}
	}
	goBackLogic() {
		var currentCmp = this.app.getActiveNav().getActive().component;
		var isPage1 = currentCmp === HomePage;
		var isPage2 = currentCmp === WalletPage;
		var isPage3 = currentCmp === DocumentaryPage;
		var isPage4 = currentCmp === MarketPage;
		var isPage5 = currentCmp === MyaccountPage;
		var isPage6 = currentCmp === ProductdetailPage;

		if (isPage6) {
			if (Window.isFullEcharts) {
				return false;
			}
			else {
				this.checkPage = false;
			}
		}
		else {
			if (isPage1 || isPage2 || isPage3 || isPage4 || isPage5) {
				this.checkPage = true
			}
			else {
				this.checkPage = false
			}
		}
		return true;
	}

	/* 语言数组参数 */
	private currentLanguage: string = localStorage.getItem('currentLanguage') || 'zh_CN';
    private isoCodes: any = localStorage.getItem('isoCodes') ? JSON.parse(localStorage.getItem('isoCodes')) : null;
    public currentLanguageMap = {};
	/* 获取语言数组 */
	getLanguageArray(callback) {
        // 获取当前的语言和版本号
        const data = {
            "dataCode": "string",
            "isoCode": this.currentLanguage,
            "version": localStorage.getItem(this.currentLanguage) ? JSON.parse(localStorage.getItem(this.currentLanguage)).version : -1
        };
        this.http.postJson('api/v2/base/dataCodeI8n',data,res => {
            // 判断是否有新版本
            if(JSON.stringify(res.content.data) === '{}') {
                this.currentLanguageMap = JSON.parse(localStorage.getItem(this.currentLanguage)).data;
            }
            else {
                localStorage.setItem(this.currentLanguage,JSON.stringify(res.content));
                this.currentLanguageMap = res.content.data;
            }
            Window.currentLanguageMap = this.currentLanguageMap
            callback();
        });
    }
	/* 获取语言 */
	getLanguage(callback) {
        this.http.get('api/v2/base/isoCodes',res => {
            console.log(res);
            if(this.isoCodes) {
                if(this.isoCodes.length !== res.content.length) {
                    for(let i = 0,r = res.content.length; i < r; i++) {
                        let hasLanguage = false;
                        for(let s = 0,k = this.isoCodes.length; s < k; s++) {
                            if(this.isoCodes[s].isoCode === res.content[i].isoCode) {
                                hasLanguage = true;
                            }
                        }
                        // 检测到有新语言
                        if(hasLanguage === false) {
                            res.content[i].version = -1;
                            this.isoCodes.push(res.content[i]);
                        }
                    }
                }
            }
            else {
                this.isoCodes = res.content;
                this.isoCodes.forEach(x => {
                    x.version = -1;
                });
            }
            // 把处理好的语言类型列表储存在本地
            localStorage.setItem('isoCodes',JSON.stringify(this.isoCodes));
            this.getLanguageArray(callback);
        });
    }
}
