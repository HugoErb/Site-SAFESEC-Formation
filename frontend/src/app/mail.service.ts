import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor(private http: HttpClient) { }

  sendMail(data: any, trainingRequest: boolean): Observable<any> {
    let apiUrl = '/send-mail'
    if (trainingRequest) {
      apiUrl = '/send-mail-training-request'
    }
    
    return this.http.post(apiUrl, data);
  }
}
