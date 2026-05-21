import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TheaterResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TheaterService {
  private readonly pub   = `${environment.apiUrl}/api/theaters`;
  private readonly admin = `${environment.apiUrl}/api/admin/theaters`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<TheaterResponse[]> {
    return this.http.get<TheaterResponse[]>(this.pub);
  }

  /** Lista salas para o admin (inclui inativas) */
  adminGetAll(): Observable<TheaterResponse[]> {
    return this.http.get<TheaterResponse[]>(this.admin);
  }
}
