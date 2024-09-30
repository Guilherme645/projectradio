import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { AudioService } from 'src/app/services/audio.service';
import { MatSnackBar } from '@angular/material/snack-bar'; // Importar MatSnackBar

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
  progress: number = 0;  // Progresso do corte em porcentagem


  constructor(private audioService: AudioService, private snackBar: MatSnackBar) {}

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

    // Exibe a barra de progresso
    this.isCutting = true;
    this.cutCompleted = false;
    this.progress = 0;

    const xhr = new XMLHttpRequest();
    const params = `startSeconds=${startSeconds}&durationSeconds=${durationSeconds}`;
    const url = `http://localhost:8080/audio/cut/${radioName}/${fileName}?${params}`;

    xhr.open('POST', url, true);
    xhr.responseType = 'blob';

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        this.progress = Math.round((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${fileName}-corte.mp3`;
        a.click();
        window.URL.revokeObjectURL(downloadUrl);

        // Atualiza a barra de progresso e mostra mensagem de sucesso
        this.progress = 100;
        this.isCutting = false;
        this.cutCompleted = true;
        this.snackBar.open('Corte feito com sucesso!', 'Fechar', {
          duration: 3000,
          verticalPosition: 'top'
        });
      } else {
        console.error('Erro ao realizar o corte:', xhr.statusText);
        this.isCutting = false;
        this.snackBar.open('Erro ao realizar o corte', 'Fechar', {
          duration: 3000,
          verticalPosition: 'top'
        });
      }
    };

    xhr.onerror = () => {
      console.error('Erro na solicitação.');
      this.isCutting = false;
      this.snackBar.open('Erro ao realizar o corte', 'Fechar', {
        duration: 3000,
        verticalPosition: 'top'
      });
    };

    xhr.send();
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
cutAudioSelect() {
  if (this.selectedAudio && this.selectedRadio) {
    const audioUrl = this.audioService.getCutAudioUrl(this.selectedRadio, this.selectedAudio);
    this.audioPlayer.nativeElement.src = audioUrl;  // Atualiza a fonte do player com o URL do corte
    this.audioPlayer.nativeElement.play();  // Inicia a reprodução
  }
}
}
