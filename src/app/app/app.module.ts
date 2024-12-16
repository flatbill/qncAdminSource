import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { QncmenComponent } from './qncmen/qncmen.component';
import { QncproComponent } from './qncpro/qncpro.component';
import { QncwwgComponent } from './qncwwg/qncwwg.component';
import { QncwwgdComponent } from './qncwwgd/qncwwgd.component';
import { QncwwiComponent } from './qncwwi/qncwwi.component';
import { QncwwqComponent } from './qncwwq/qncwwq.component';
import { QncwwqdComponent } from './qncwwqd/qncwwqd.component';
import { QncwwrComponent } from './qncwwr/qncwwr.component';
import { QncwwrdComponent } from './qncwwrd/qncwwrd.component';
import { QncwwsComponent }   from './qncwws/qncwws.component';
import { QncwwsrComponent }  from './qncwwsr/qncwwsr.component';
import { QncwwsrdComponent} from './qncwwsrd/qncwwsrd.component';
import { QncwwuComponent }   from './qncwwu/qncwwu.component';

@NgModule({
  declarations: [
    AppComponent,
    QncproComponent,
    QncmenComponent,
    QncwwgComponent,
    QncwwgdComponent,
    QncwwiComponent,
    QncwwqComponent,
    QncwwqdComponent,
    QncwwrComponent,
    QncwwrdComponent,
    QncwwsComponent,
    QncwwsrComponent,
    QncwwsrdComponent,
    QncwwuComponent 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
