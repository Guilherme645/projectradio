import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private apiUrl = 'http://localhost:8080/audio';

  constructor(private http: HttpClient) {}

  listRadios(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/radio`);
  }

  listContentsFromRadio(radioName: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/radio/${radioName}/contents`);
  }

  getAudioUrl(radioName: string, fileName: string): string {
    return `${this.apiUrl}/play/${radioName}/${fileName}`;
  }

  cutAudio(radioName: string, fileName: string, startSeconds: number, durationSeconds: number): Observable<Blob> {
    const url = `${this.apiUrl}/cut/${radioName}/${fileName}`;
    const params = {
      startSeconds: startSeconds.toString(),
      durationSeconds: durationSeconds.toString()
    };
    return this.http.post(url, null, { params, responseType: 'blob' });
  }

  getCutProgress(radioName: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/progress?radioName=${radioName}`);
  }

  pauseCut(): Observable<any> {
    return this.http.post(`${this.apiUrl}/pause`, {});
  }

  resumeCut(): Observable<any> {
    return this.http.post(`${this.apiUrl}/resume`, {});
  }

  cancelCut(): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancel`, {});
  }

  uploadAudio(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  listAllAudioFilesInAudiopasta(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/list`);
  }

  downloadAudio(fileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${fileName}`, { responseType: 'blob' });
  }
  listCortes(): Observable<{ [key: string]: string[] }> {
    return this.http.get<{ [key: string]: string[] }>(`${this.apiUrl}/list/cortes`);
  }

  cutLiveStream(streamUrl: string, radioName: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = `streamUrl=${encodeURIComponent(streamUrl)}&radioName=${encodeURIComponent(radioName)}`;

    return this.http.post<any>('http://localhost:8080/audio/cut-live-segments', body, { headers });
  }

  getCorteAudioUrl(subFolder: string, fileName: string): string {
    return `${this.apiUrl}/play/corte/${subFolder}/${fileName}`;
  }
}
