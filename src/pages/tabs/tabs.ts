import { Component } from '@angular/core';
/* pages */
import { HomePage } from '../home/home';
import { MarketPage } from '../market/market';
import { WalletPage } from '../wallet/wallet';
import { MyaccountPage } from '../myaccount/myaccount';
import { DocumentaryPage } from '../documentary/documentary';
/* service */
import { PresentProvider } from '../../providers/present/present';

@Component({
	templateUrl: 'tabs.html'
})
export class TabsPage {
	tabRoots: Object[];
	constructor(
		private present: PresentProvider
	) {
		this.tabRoots = [
			{
				root: HomePage,
				tabTitle: this.present.translateText('', '首页'),
				tabIcon: 'home'
			},
			{
				root: WalletPage,
				tabTitle: this.present.translateText('', '钱包'),
				tabIcon: 'wallet'
			},
			{
				root: DocumentaryPage,
				tabTitle: this.present.translateText('', '跟单'),
				tabIcon: 'documentary'
			},
			{
				root: MarketPage,
				tabTitle: this.present.translateText('WAP_242', '行情'),
				tabIcon: 'market'
			},			
			{
				root: MyaccountPage,
				tabTitle: this.present.translateText('', '我的'),
				tabIcon: 'myaccount'
			}
		];
	}
}
