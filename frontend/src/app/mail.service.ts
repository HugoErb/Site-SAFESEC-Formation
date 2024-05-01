import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private apiUrl = 'http://localhost:3000/sendmail';

  constructor(private http: HttpClient) {}

  sendMail(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
