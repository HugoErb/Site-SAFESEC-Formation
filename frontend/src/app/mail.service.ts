import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor(private http: HttpClient) { }

  sendMail(data: Record<string, string>, trainingRequest: boolean): Observable<unknown> {
    const apiUrl = trainingRequest ? '/send-mail-training-request' : '/send-mail';
    return this.http.post<unknown>(apiUrl, data);
  }
}
