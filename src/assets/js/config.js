var baseConfig = {
	"sunx_app_test": {
		"version": 8,
		"orgcode": ["1@"],
		"pcId": "test",
		"line": [{
			"id": 0,
			"webUrl": "http://47.101.35.248:33207/trade/",
			"socketUrl": "http://47.101.35.248:33202",
			"lineName": "test环境"
		}],
		"logo": "sunx.png",
		"viewRealInfoUrl": "realNameInfo/index.html",
		"registerUrl": "register/index.html",
		"viewRealNameInfo": "register/index.html#/newOpenAccount",
		"rechargeInner": "origin",
		"withdrawInner": "origin",
		"isUseSimpleRegister": true,
		"contactChannel": {
			"email": true,
			"phone": false,
			"certificateA": true,
			"certificateB": true,
			"certificateC": false,
			"certificateD": true,
			"needUserName": true
		},
		"website": "",
		"favoritesNav": {
			"futures": {
				"name": "期货",
				"show": true
			},
			"cfd": {
				"name": "CFD",
				"show": true
			}
		}
	},
	"181_app": {
		"version": 6,
		"orgcode": ["1@"],
		"line": [{
			"id": 0,
			"webUrl": "http://192.168.1.181:8180/trade/",
			"socketUrl": "http://192.168.1.181:9091",
			"lineName": "181測試（一）"
		}],
		"logo": "onlinetest.png",
		"viewRealInfoUrl": "realNameInfo/index.html",
		"registerUrl": "register/index.html",
		"contactChannel": {
			"email": true,
			"phone": false,
			"certificateA": true,
			"certificateB": true,
			"certificateC": false,
			"certificateD": false,
			"needUserName": true
		},
		"website": "",
		"favoritesNav": {
			"futures": {
				"name": "期货",
				"show": true
			},
			"cfd": {
				"name": "CFD",
				"show": true
			}
		}
	},
	"phinest": {
		"version": 6,
		"orgcode": ["1@-5@"],
		"line": [{
			"id": 0,
			"webUrl": "http://47.101.66.181:34207/trade/",
			"socketUrl": "http://47.101.66.181:34202",
			"lineName": "phinest 1"
		},
		{
			"id": 1,
			"webUrl": "http://39.108.130.56:34207/trade/",
			"socketUrl": "http://39.108.130.56:34202",
			"lineName": "phinest 2"
		},
		{
			"id": 2,
			"webUrl": "http://kjgj.ancestree.cn:34207/trade/",
			"socketUrl": "http://kjgj.ancestree.cn:34202",
			"lineName": "phinest 3"
		},
		{
			"id": 3,
			"webUrl": "http://47.56.130.50:34207/trade/",
			"socketUrl": "http://47.56.130.50:34202",
			"lineName": "phinest 4"

		}],
		"logo": "phinest.png",
		"viewRealInfoUrl": "realNameInfo/index.html",
		"rechargeInner": "origin",
		"withdrawInner": "origin",
		"registerUrl": "register/index.html",
		"isUseSimpleRegister": false,
		"contactChannel": {
			"email": true,
			"phone": false,
			"certificateA": true,
			"certificateB": true,
			"certificateC": false,
			"certificateD": false,
			"needUserName": true

		},
		"website": "",
		"favoritesNav": {
			"futures": {
				"name": "期货",
				"show": true
			},
			"cfd": {
				"name": "CFD",
				"show": true
			}
		}
	},
	"otp": {
		"version": 9,
		"orgcode": ["1@"],
		"pcId": "otp",
		"line": [{
			"id": 0,
			"webUrl": "http://47.103.66.181:33607/trade/",
			"socketUrl": "http://47.103.66.181:33602",
			"lineName": "otp 1"
		},
		{
			"id": 1,
			"webUrl": "http://47.110.156.91:33607/trade/",
			"socketUrl": "http://47.110.156.91:33602",
			"lineName": "otp 2"
		},
		{
			"id": 2,
			"webUrl": "http://sunx.hnrotor.cn:33607/trade/",
			"socketUrl": "http://sunx.hnrotor.cn:33602",
			"lineName": "otp 3"
		}],
		"logo": "otp.png",
		"viewRealInfoUrl": "register/index.html#/newOpenAccount",
		"viewRealNameInfo": "register/index.html#/newOpenAccount",
		"rechargeInner": "origin",
		"withdrawInner": "origin",
		"registerUrl": "register/index.html",
		"contactChannel": {
			"email": true,
			"phone": false,
			"certificateA": true,
			"certificateB": true,
			"certificateC": true,
			"certificateD": false,
			"needUserName": true
		},
		"website": "",
		"favoritesNav": {
			"futures": {
				"name": "期货",
				"show": true
			},
			"cfd": {
				"name": "CFD",
				"show": true
			}
		}
	},
}	
