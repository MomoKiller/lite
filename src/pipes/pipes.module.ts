import { NgModule } from '@angular/core';
import { TranslatePipe } from './translate/translate';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from 'ionic-angular';
@NgModule({
	declarations: [TranslatePipe],
	imports: [
		BrowserModule,
		IonicModule.forRoot(PipesModule)
	],
	exports: [TranslatePipe]
})
export class PipesModule {}
