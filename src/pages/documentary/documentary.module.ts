import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DocumentaryPage } from './documentary';

@NgModule({
  declarations: [
    DocumentaryPage,
  ],
  imports: [
    IonicPageModule.forChild(DocumentaryPage),
  ],
})
export class DocumentaryPageModule {}
