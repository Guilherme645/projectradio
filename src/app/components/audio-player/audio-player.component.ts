import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { AudioService } from 'src/app/services/audio.service';  // Ajuste o caminho conforme necessário

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnInit {
  @ViewChild('audioPlayer', { static: false }) audioPlayer!: ElementRef<HTMLAudioElement>;

  radios: string[] = [];
  selectedRadio: string = '';
  subfolders: string[] = [];
  selectedFolder: string = '';
  audioFiles: string[] = [];
  selectedAudio: string = '';
  audioUrl: string = ''; // URL do áudio selecionado
  range: number[] = [0, 100];  // Intervalo para o slider de corte
  sliderOptions: any = {};  // Opções do slider
  isPlaying = false;  // Status de reprodução
  isCutting = false;  // Status de corte
  cutProgress = 0;  // Progresso do corte
  cutCompleted = false;  // Se o corte foi concluído
  cutAudioUrl = '';  // URL do áudio cortado

  constructor(private audioService: AudioService) {}

  ngOnInit() {
    this.loadRadios();
    this.initializeSliderOptions();
  }

  // Carregar a lista de rádios
  loadRadios() {
    this.audioService.listRadios().subscribe((radios) => {
      this.radios = radios;
    });
  }

  // Chamado quando uma rádio é selecionada
  onRadioSelect() {
    if (this.selectedRadio) {
      this.audioService.listContentsFromRadio(this.selectedRadio).subscribe((response: any) => {
        console.log(response);  // Verifique o que está sendo retornado da API
        this.subfolders = response.subfolders || [];  // Subpastas
        this.audioFiles = response.files || [];  // Arquivos
        this.selectedFolder = '';
        this.selectedAudio = '';
        this.audioUrl = '';  // Limpar URL do áudio
      });
    }
  }

  // Chamado quando uma pasta é selecionada
  onFolderSelect() {
    if (this.selectedFolder) {
      this.audioFiles = [];  // Limpar arquivos anteriores
      this.selectedAudio = '';
      this.audioUrl = '';  // Limpar URL do áudio

      // Buscar os arquivos na pasta selecionada (ajuste conforme necessário)
      this.audioService.listContentsFromRadio(this.selectedRadio).subscribe((response: any) => {
        this.audioFiles = response.files || [];
      });
    }
  }

  // Chamado quando um arquivo de áudio é selecionado
  onAudioFileSelect() {
    if (this.selectedAudio) {
      this.audioUrl = this.audioService.getAudioUrl(this.selectedRadio, this.selectedAudio);
      this.playAudio();
    }
  }

  // Reproduzir o áudio selecionado
  playAudio() {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.src = this.audioUrl;
      this.audioPlayer.nativeElement.play();
      this.isPlaying = true;
    }
  }

  // Alternar reprodução/pausa
  togglePlayPause() {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      if (this.isPlaying) {
        this.audioPlayer.nativeElement.pause();
      } else {
        this.audioPlayer.nativeElement.play();
      }
      this.isPlaying = !this.isPlaying;
    }
  }

  // Retroceder o áudio
  stepBackward() {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.currentTime -= 10;  // Retroceder 10 segundos
    }
  }

  // Avançar o áudio
  stepForward() {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.currentTime += 10;  // Avançar 10 segundos
    }
  }

  // Inicializar as opções do slider
  initializeSliderOptions() {
    this.sliderOptions = {
      floor: 0,
      ceil: 100,
      step: 0.1,
      translate: (value: number) => {
        return `${value}s`;
      }
    };
  }

  // Atualizar o tempo de corte
  seekTo(time: number) {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.currentTime = time;
    }
  }
}
