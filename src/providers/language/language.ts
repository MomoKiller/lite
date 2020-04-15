import { Injectable } from '@angular/core';
declare var Window;

@Injectable()
export class LanguageProvider {
  constructor() {
    Window.currentLanguageMap = {};
  }

  // 获取翻译
  get(value, defaultValue, callback?) {
    const text = Window.currentLanguageMap[value] || defaultValue;
    if (callback) {
      callback(text);
    }
    else {
      return text;
    }
  }

}
