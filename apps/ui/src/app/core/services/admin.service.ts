import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = `${environment.apiUrl}/api/admin`;
  constructor(private http: HttpClient) {}

  getReport(start: string, end: string): Observable<ReportResponse> {
    const params = new HttpParams().set('startDate', start).set('endDate', end);
    return this.http.get<ReportResponse>(`${this.base}/reports`, { params });
  }

  getCurrentMonthReport(): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`${this.base}/reports/current-month`);
  }

  getYearToDateReport(): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`${this.base}/reports/year-to-date`);
  }
}
