import { Pipe, PipeTransform } from '@angular/core';
declare var Window;

@Pipe({
  name: 'translate',
})
export class TranslatePipe implements PipeTransform {
  transform(value: string, ...args) {
    return Window.currentLanguageMap[value];
  }
}
