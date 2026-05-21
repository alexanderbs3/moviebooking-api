import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovieResponse, MovieRequest, MovieStatus, ShowtimeResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly pub   = `${environment.apiUrl}/api/movies`;
  private readonly admin = `${environment.apiUrl}/api/admin/movies`;

  constructor(private http: HttpClient) {}

  // ─── Público (sem autenticação) ───────────────────────────────────────────

  /** Catálogo completo de filmes ativos */
  getAll(): Observable<MovieResponse[]> {
    return this.http.get<MovieResponse[]>(this.pub);
  }

  /** Filmes por status: NOW_PLAYING | COMING_SOON | ENDED */
  getByStatus(status: MovieStatus): Observable<MovieResponse[]> {
    return this.http.get<MovieResponse[]>(`${this.pub}/status/${status}`);
  }

  /** Detalhes do filme */
  getById(id: number): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(`${this.pub}/${id}`);
  }

  /** Sessões de um filme por data */
  getShowtimes(movieId: number, date?: string): Observable<ShowtimeResponse[]> {
    const params = date ? new HttpParams().set('date', date) : {};
    return this.http.get<ShowtimeResponse[]>(`${this.pub}/${movieId}/showtimes`, { params });
  }

  // ─── Admin (requer ROLE_ADMIN + token JWT) ────────────────────────────────

  /** Lista todos os filmes — incluindo inativos */
  adminGetAll(): Observable<MovieResponse[]> {
    return this.http.get<MovieResponse[]>(this.admin);
  }

  /** Cadastra novo filme */
  create(req: MovieRequest): Observable<MovieResponse> {
    return this.http.post<MovieResponse>(this.admin, req);
  }

  /** Edita filme completo */
  update(id: number, req: MovieRequest): Observable<MovieResponse> {
    return this.http.put<MovieResponse>(`${this.admin}/${id}`, req);
  }

  /** Altera apenas o status */
  changeStatus(id: number, status: MovieStatus): Observable<MovieResponse> {
    return this.http.patch<MovieResponse>(`${this.admin}/${id}/status`, null, {
      params: new HttpParams().set('status', status)
    });
  }

  /** Soft delete */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.admin}/${id}`);
  }
}
