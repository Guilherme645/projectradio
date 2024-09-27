import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private apiUrl = 'http://localhost:8080/audio';  // A URL base da sua API Spring Boot

  constructor(private http: HttpClient) {}

  // Método para listar todas as rádios (subpastas)
  listRadios(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/radio`);
  }

  // Método para listar arquivos dentro de uma rádio específica
  listContentsFromRadio(radioName: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/radio/${radioName}/contents`);
  }

  // Método para reproduzir um arquivo de áudio de uma rádio específica
  getAudioUrl(radioName: string, fileName: string): string {
    return `${this.apiUrl}/play/${radioName}/${fileName}`;
  }

  // Método para cortar um áudio específico e salvá-lo no diretório de cortes com base na data
  cutAudio(radioName: string, fileName: string, startSeconds: number, durationSeconds: number): Observable<Blob> {
    const url = `${this.apiUrl}/cut/${radioName}/${fileName}`;
    const params = {
      startSeconds: startSeconds.toString(),
      durationSeconds: durationSeconds.toString()
    };
    return this.http.post(url, null, { params, responseType: 'blob' });
  }

  // Método para obter o progresso do corte de áudio
  getCutProgress(radioName: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/progress?radioName=${radioName}`);
  }

  // Método para pausar o corte de áudio
  pauseCut(): Observable<any> {
    return this.http.post(`${this.apiUrl}/pause`, {});
  }

  // Método para retomar o corte de áudio
  resumeCut(): Observable<any> {
    return this.http.post(`${this.apiUrl}/resume`, {});
  }

  // Método para cancelar o corte de áudio
  cancelCut(): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancel`, {});
  }

  // Método para fazer upload de um arquivo de áudio
  uploadAudio(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // Método para listar todos os arquivos de áudio na pasta audiopasta
  listAllAudioFilesInAudiopasta(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/list`);
  }

  // Método para listar todos os arquivos de áudio na pasta cortes
  listAllAudioFilesInCortes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/list/cortes`);
  }

  // Método para baixar um arquivo de áudio específico (cortes)
  downloadAudio(fileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${fileName}`, { responseType: 'blob' });
  }
  // Método para listar todas as subpastas e arquivos cortados na pasta de cortes
  listCortes(): Observable<{ [key: string]: string[] }> {
    return this.http.get<{ [key: string]: string[] }>(`${this.apiUrl}/list/cortes`);
  }
}
