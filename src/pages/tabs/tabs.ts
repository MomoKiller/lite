import { Component } from '@angular/core';
/* pages */
import { HomePage } from '../home/home';
import { MarketPage } from '../market/market';
import { WalletPage } from '../wallet/wallet';
import { MyaccountPage } from '../myaccount/myaccount';
import { DocumentaryPage } from '../documentary/documentary';

@Component({
	templateUrl: 'tabs.html'
})
export class TabsPage {
	tabRoots: Object[];
	constructor() {
		this.tabRoots = [
			{
				root: HomePage,
				tabTitle: '首页',
				tabIcon: 'home'
			},
			{
				root: WalletPage,
				tabTitle: '钱包',
				tabIcon: 'wallet'
			},
			{
				root: DocumentaryPage,
				tabTitle: '跟单',
				tabIcon: 'documentary'
			},
			{
				root: MarketPage,
				tabTitle: '行情',
				tabIcon: 'market'
			},			
			{
				root: MyaccountPage,
				tabTitle: '我的',
				tabIcon: 'myaccount'
			}
		];
	}
}
