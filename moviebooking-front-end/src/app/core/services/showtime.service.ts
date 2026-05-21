import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShowtimeResponse, ShowtimeRequest, SeatResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ShowtimeService {
  private readonly pub   = `${environment.apiUrl}/api/showtimes`;
  private readonly admin = `${environment.apiUrl}/api/admin/showtimes`;

  constructor(private http: HttpClient) {}

  // ─── Público ──────────────────────────────────────────────────────────────

  getByDate(date: string): Observable<ShowtimeResponse[]> {
    return this.http.get<ShowtimeResponse[]>(this.pub, {
      params: new HttpParams().set('date', date)
    });
  }

  getById(id: number): Observable<ShowtimeResponse> {
    return this.http.get<ShowtimeResponse>(`${this.pub}/${id}`);
  }

  /** Mapa de assentos público — visitantes podem ver disponibilidade */
  getSeats(showtimeId: number): Observable<SeatResponse[]> {
    return this.http.get<SeatResponse[]>(`${this.pub}/${showtimeId}/seats`);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  adminGetAll(): Observable<ShowtimeResponse[]> {
    return this.http.get<ShowtimeResponse[]>(this.admin);
  }

  create(req: ShowtimeRequest): Observable<ShowtimeResponse> {
    return this.http.post<ShowtimeResponse>(this.admin, req);
  }

  update(id: number, req: ShowtimeRequest): Observable<ShowtimeResponse> {
    return this.http.put<ShowtimeResponse>(`${this.admin}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.admin}/${id}`);
  }
}
