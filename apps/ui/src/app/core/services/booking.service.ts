import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingRequest, BookingResponse, ApiResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly url = `${environment.apiUrl}/api/bookings`;

  constructor(private http: HttpClient) {}

  create(req: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.url, req);
  }

  getMyBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.url}/my-bookings`);
  }

  getByCode(code: string): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.url}/${code}`);
  }

  cancel(code: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.url}/${code}`);
  }
}
