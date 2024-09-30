import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { AudioService } from 'src/app/services/audio.service';

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
  audioUrl: string = '';
  range: number[] = [0, 100];
  sliderOptions: any = {};
  isPlaying = false;
  isCutting = false;
  cutProgress = 0;
  cutCompleted = false;
  cutAudioUrl = '';
  audio!: HTMLAudioElement;
  currentTime = 0;
  cutsList: Record<string, string[]> = {};
  selectedSubfolder: string = '';
  filesInSelectedSubfolder: string[] = [];
  streamUrl: string = '';
  radioName: string = '';
  message: string = '';

  constructor(private audioService: AudioService) {}

  ngOnInit() {
    this.loadRadios();
    this.initializeSliderOptions();
    this.loadCutsList();
  }
onCutAudio() {
  const radioName = this.selectedRadio;
  const fileName = this.selectedAudio;
  const startSeconds = this.range[0];
  const durationSeconds = this.range[1] - this.range[0];

  this.audioService.cutAudio(radioName, fileName, startSeconds, durationSeconds)
    .subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}-corte.mp3`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
}

  loadRadios() {
    this.audioService.listRadios().subscribe((radios) => {
      this.radios = radios;
    });
  }

  onRadioSelect() {
    if (this.selectedRadio) {
      this.audioService.listContentsFromRadio(this.selectedRadio).subscribe((response: any) => {
        this.subfolders = response.subfolders || [];
        this.audioFiles = response.files || [];
        this.selectedFolder = '';
        this.selectedAudio = '';
        this.audioUrl = '';
      });
    }
  }

  onFolderSelect() {
    if (this.selectedFolder) {
      this.audioFiles = [];
      this.selectedAudio = '';
      this.audioUrl = '';

      this.audioService.listContentsFromRadio(this.selectedRadio).subscribe((response: any) => {
        this.audioFiles = response.files || [];
      });
    }
  }

  onAudioFileSelect() {
    if (this.selectedAudio) {
      this.audioUrl = this.audioService.getAudioUrl(this.selectedRadio, this.selectedAudio);
      this.initializeAudio();
      this.playAudio();
    }
  }

  initializeAudio() {
    this.audio = new Audio(this.audioUrl);
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime;

      if (this.audio.currentTime >= this.range[1]) {
        this.audio.pause();
        this.audio.currentTime = this.range[0];
        this.isPlaying = false;
      }
    });
  }

  playAudio() {
    this.audio.currentTime = this.range[0];
    this.audio.play();
    this.isPlaying = true;
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.playAudio();
    }
    this.isPlaying = !this.isPlaying;
  }

  seekTo(time: number) {
    this.audio.currentTime = time;
  }

  stepBackward() {
    this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
  }

  stepForward() {
    this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 10);
  }

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
  loadCutsList() {
    this.audioService.listCortes().subscribe((cuts) => {
      this.cutsList = cuts;
      this.subfolders = Object.keys(this.cutsList);
    }, error => {
      console.error('Erro ao carregar a lista de subpastas:', error);
    });
  }

  onSubfolderSelect() {
    if (this.selectedSubfolder) {
      this.filesInSelectedSubfolder = this.cutsList[this.selectedSubfolder] || [];
    }
  }

  onAudioSelect() {
    if (this.selectedAudio) {
      this.playCut(this.selectedAudio);
    }
  }
  playCut(file: string) {

}
corteLive(){
  if (this.streamUrl && this.radioName) {
    this.audioService.cutLiveStream(this.streamUrl, this.radioName)
      .subscribe(
        (response) => {
          if (response.status === 'success') {
            this.message = response.message;
          } else {
            this.message = `Erro: ${response.message}`;
          }
        },
        (error) => {
          console.error('Erro ao iniciar o corte:', error);
          this.message = 'Erro ao iniciar o corte.';
        }
      );
  } else {
    this.message = 'Por favor, preencha todos os campos.';
  }
}
}
