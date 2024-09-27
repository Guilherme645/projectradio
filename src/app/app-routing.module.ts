import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';


const routes: Routes = [
  { path: '', redirectTo: '/audio-player', pathMatch: 'full' },  
  { path: 'audio-player', component: AudioPlayerComponent },   
  { path: '**', redirectTo: '/audio-list' }                   
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
