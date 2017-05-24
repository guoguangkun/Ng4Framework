import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { routes } from './maps/routes';
import { components } from './maps/components';
import { AppComponent } from './app.component';

/**
 * 导入模块
 */
const MODULE_IMPORTS=[
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes,{useHash:false})
];

@NgModule({
    bootstrap:[AppComponent],
    declarations:components,
    imports:MODULE_IMPORTS
})

export class AppModule{

}