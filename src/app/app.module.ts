import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, JsonpModule } from '@angular/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { HTTP } from '@ionic-native/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

/* components */
import { MyApp } from './app.component';
import { AlertComponent } from '../components/alert/alert';
import { CapitalComponent } from '../components/capital/capital';

/* pages */
import { TabsPage } from '../pages/tabs/tabs';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { MarketPage } from '../pages/market/market';
import { WalletPage } from '../pages/wallet/wallet';
import { RegisterPage } from '../pages/register/register';
import { MyaccountPage } from '../pages/myaccount/myaccount';
import { SltpBlockPage } from '../pages/sltpblock/sltpblock';
import { PersionPwdPage } from '../pages/persionpwd/persionpwd';
import { OpenAccountPage } from '../pages/openaccount/openaccount';
import { DocumentaryPage } from '../pages/documentary/documentary';
import { ProductdetailPage } from '../pages/productdetail/productdetail';
import { ForgetPasswordPage } from '../pages/forgetpassword/forgetpassword';
import { TraderContractPage } from '../pages/tradercontract/tradercontract';
import { PositionDetailPage } from '../pages/positiondetail/positiondetail';
/* provider */
import { TraderProvider } from '../providers/trader/trader';
import { PresentProvider } from '../providers/present/present';
import { HttpServeProvider } from '../providers/http-serve/http-serve';
import { SocketServeProvider } from '../providers/socket-serve/socket-serve';
import { LanguageProvider } from '../providers/language/language';

import { PipesModule } from '../pipes/pipes.module';

@NgModule({
	declarations: [
		MyApp,
		AlertComponent,
		CapitalComponent,
		TabsPage,
		HomePage,
		LoginPage,
		MarketPage,
		WalletPage,
		RegisterPage,
		MyaccountPage,
		SltpBlockPage,
		PersionPwdPage,
		OpenAccountPage,
		DocumentaryPage,
		ProductdetailPage,
		ForgetPasswordPage,
		TraderContractPage,
		PositionDetailPage
	],
	imports: [
		BrowserModule,
		// TranslateModule.forRoot({
		// 	loader: {
		// 		provide: TranslateLoader,
		// 		useFactory: HttpLoaderFactory,
		// 		deps: [HttpClient]
		// 	}
		// }),
		IonicModule.forRoot(MyApp, {
			backButtonText: '',
			tabsHideOnSubPages: 'true',
			pageTransition: 'wp-transition'
		}),
		HttpModule,
		JsonpModule,
		HttpClientModule,
		PipesModule
	],
	bootstrap: [IonicApp],
	entryComponents: [
		TabsPage,
		HomePage,
		LoginPage,
		MarketPage,
		WalletPage,
		RegisterPage,
		MyaccountPage,
		SltpBlockPage,
		PersionPwdPage,
		OpenAccountPage,
		DocumentaryPage,
		ProductdetailPage,
		ForgetPasswordPage,
		TraderContractPage,
		PositionDetailPage
	],
	providers: [
		StatusBar,
		Keyboard,
		SplashScreen,
		{ provide: ErrorHandler, useClass: IonicErrorHandler },
		HTTP,
		TraderProvider,
		PresentProvider,
		SocketServeProvider,
		HttpServeProvider,
		ScreenOrientation,
		LanguageProvider
	]
})

export class AppModule { }
export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}