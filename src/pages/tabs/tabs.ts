import { Component } from '@angular/core';
import { HomePage } from '../home/home';
import 'rxjs/add/operator/map';

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
				tabIcon: 'flash'
			},
			{
				root: HomePage,
				tabTitle: '钱包',
				tabIcon: 'contact'
			},
			{
				root: HomePage,
				tabTitle: '跟单',
				tabIcon: 'contact'
			},
			{
				root: HomePage,
				tabTitle: '行情',
				tabIcon: 'globe'
			},			
			{
				root: HomePage,
				tabTitle: '账户',
				tabIcon: 'contact'
			}
		];
	}
}
