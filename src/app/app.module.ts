import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { MyApp } from './app.component';
import { TabsPage } from '../pages/tabs/tabs';
import { HomePage } from '../pages/home/home';
import { DisclaimerPage } from '../pages/disclaimer/disclaimer';
import { LoginPage } from '../pages/login/login';

import { AlertComponent } from '../components/alert/alert';
import { CapitalComponent } from '../components/capital/capital';

import { SocketServeProvider } from '../providers/socket-serve/socket-serve';
import { HttpServeProvider } from '../providers/http-serve/http-serve';

import { ProductdetailPage } from '../pages/productdetail/productdetail';
import { CapitalFlowPage } from '../pages/capital-flow/capital-flow';
import { PersionPwdPage } from '../pages/persion-pwd/persion-pwd';
import { GoldPwdPage } from '../pages/gold-pwd/gold-pwd';
import { RegisterPage } from '../pages/register/register';
import { SltpBlockPage } from '../pages/sltp-block/sltp-block';
import { CurrencyDetailPage } from '../pages/currency-detail/currency-detail';
import { SubBankPage } from '../pages/sub-bank/sub-bank';
import { ForgetPasswordPage } from '../pages/forget-password/forget-password';
import { TraderProvider } from '../providers/trader/trader';

import { HttpModule, JsonpModule } from '@angular/http';
import { Keyboard } from '@ionic-native/keyboard';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
	declarations: [
		MyApp,
		HomePage,
		TabsPage,
		LoginPage,
		AlertComponent,
		CapitalComponent,
		ProductdetailPage,
		CapitalFlowPage,
		PersionPwdPage,
		GoldPwdPage,
		RegisterPage,
		ForgetPasswordPage,
		SltpBlockPage,
		CurrencyDetailPage,
		DisclaimerPage,
		SubBankPage
	],
	imports: [
		BrowserModule,
		TranslateModule.forRoot({
				loader: {
					provide: TranslateLoader,
					useFactory: HttpLoaderFactory,
					deps: [HttpClient]
				}
			}),
		IonicModule.forRoot(MyApp,{
			backButtonText: '',
			tabsHideOnSubPages: 'true',
			pageTransition: 'wp-transition'
		}),
		HttpModule,
		JsonpModule,
		HttpClientModule
	],
	bootstrap: [IonicApp],
	entryComponents: [
		MyApp,
		HomePage,
		TabsPage,
		LoginPage,
		ProductdetailPage,
		CapitalFlowPage,
		PersionPwdPage,
		GoldPwdPage,
		RegisterPage,
		ForgetPasswordPage,
		SltpBlockPage,
		CurrencyDetailPage,
		DisclaimerPage,
		SubBankPage
	],
	providers: [
		StatusBar,
		SplashScreen,
		{provide: ErrorHandler, useClass: IonicErrorHandler},
		SocketServeProvider,
		HTTP,
		HttpServeProvider,
		TraderProvider,
		ScreenOrientation,
		Keyboard
	]
})

export class AppModule {}
export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}