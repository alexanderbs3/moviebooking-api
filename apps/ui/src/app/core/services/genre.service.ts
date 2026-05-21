import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenreResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GenreService {
  private readonly url = `${environment.apiUrl}/api/genres`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<GenreResponse[]> {
    return this.http.get<GenreResponse[]>(this.url);
  }
}
