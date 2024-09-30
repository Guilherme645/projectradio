import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { AppComponent } from './app.component';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';
import { RouterModule } from '@angular/router';
import { ListboxModule } from 'primeng/listbox';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { NouisliderModule } from 'ng2-nouislider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
@NgModule({
  declarations: [
    AppComponent,
    AudioPlayerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    RouterModule.forRoot([]),
    ListboxModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    MatProgressBarModule,
    MatSelectModule,
    MatOptionModule,
    NgxSliderModule,
    NouisliderModule ,
    MatListModule,
    MatIconModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
