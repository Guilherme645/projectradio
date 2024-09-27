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
  audio!: HTMLAudioElement;  // Instância do objeto Audio
  currentTime = 0; // Tempo atual do áudio
  cutsList: Record<string, string[]> = {};  // Define que cutsList é um objeto com chaves do tipo string e valores do tipo array de strings
  selectedSubfolder: string = '';  // Subpasta selecionada
  filesInSelectedSubfolder: string[] = [];  // Lista de arquivos da subpasta selecionada

  constructor(private audioService: AudioService) {}

  ngOnInit() {
    this.loadRadios();
    this.initializeSliderOptions();
    this.loadCutsList();  // Carrega a lista de cortes ao inicializar
  }
// Função para realizar o corte de áudio (simulado no frontend)
onCutAudio() {
  const radioName = this.selectedRadio; // Nome da rádio selecionada
  const fileName = this.selectedAudio;  // Nome do arquivo de áudio selecionado
  const startSeconds = this.range[0];   // Início do corte (segundos)
  const durationSeconds = this.range[1] - this.range[0];  // Duração do corte (segundos)

  this.audioService.cutAudio(radioName, fileName, startSeconds, durationSeconds)
    .subscribe((blob: Blob) => {
      // Aqui você pode baixar o arquivo ou salvar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}-corte.mp3`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
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
      this.initializeAudio();
      this.playAudio();
    }
  }

  // Inicializar o objeto de áudio
  initializeAudio() {
    this.audio = new Audio(this.audioUrl);
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime;

      // Pausar quando chegar ao final do corte
      if (this.audio.currentTime >= this.range[1]) {
        this.audio.pause();
        this.audio.currentTime = this.range[0];  // Reiniciar no início do corte
        this.isPlaying = false;
      }
    });
  }

  // Reproduzir o áudio a partir do início do corte
  playAudio() {
    this.audio.currentTime = this.range[0];  // Iniciar no ponto de corte inicial
    this.audio.play();
    this.isPlaying = true;
  }

  // Pausar ou continuar reprodução
  togglePlayPause() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.playAudio();
    }
    this.isPlaying = !this.isPlaying;
  }

  // Atualizar o tempo de início do áudio conforme o slider
  seekTo(time: number) {
    this.audio.currentTime = time;
  }

  // Retroceder o áudio 10 segundos
  stepBackward() {
    this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
  }

  // Avançar o áudio 10 segundos
  stepForward() {
    this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 10);
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
  // Método para listar todas as subpastas e arquivos na pasta de cortes
  loadCutsList() {
    this.audioService.listCortes().subscribe((cuts) => {
      this.cutsList = cuts;
      this.subfolders = Object.keys(this.cutsList);  // Pega as subpastas
    }, error => {
      console.error('Erro ao carregar a lista de subpastas:', error);
    });
  }

  // Método chamado quando uma subpasta é selecionada
  onSubfolderSelect() {
    if (this.selectedSubfolder) {
      this.filesInSelectedSubfolder = this.cutsList[this.selectedSubfolder] || [];  // Lista os arquivos da subpasta selecionada
    }
  }

  // Método chamado quando um arquivo de áudio é selecionado
  onAudioSelect() {
    if (this.selectedAudio) {
      this.playCut(this.selectedAudio);
    }
  }

  // Método para reproduzir o corte selecionado
  playCut(file: string) {
  //   const cutAudioUrl = `${this.audioService.getAudioBaseUrl()}/cortes/${file}`;

  //   if (this.currentAudio) {
  //     this.currentAudio.pause();  // Pausa o áudio atual se já estiver tocando
  //   }

  //   this.currentAudio = new Audio(cutAudioUrl);
  //   this.currentAudio.play();
  // }
}
  // Método para reproduzir o corte selecionado
}
