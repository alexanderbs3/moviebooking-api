import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { JwtResponse, LoginRequest, SignupRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'cv_token';
  private readonly USER_KEY  = 'cv_user';
  private readonly baseUrl   = `${environment.apiUrl}/api/auth`;

  private _currentUser = signal<JwtResponse | null>(this.loadUser());

  readonly currentUser  = this._currentUser.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._currentUser());
  readonly isAdmin      = computed(() => this._currentUser()?.roles?.includes('ROLE_ADMIN') ?? false);
  readonly username     = computed(() => this._currentUser()?.username ?? '');

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * BUG FIX #1 — campo renomeado de "username" para "usernameOrEmail"
   * para corresponder ao record LoginRequest do backend Spring Boot.
   */
  login(req: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.baseUrl}/login`, req).pipe(
      tap((res: JwtResponse) => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res));
        this._currentUser.set(res);
      })
    );
  }

  /**
   * BUG FIX #6 — método signup() adicionado ao serviço Angular.
   * O backend já possuía AuthService.signup() e o endpoint foi exposto
   * em AuthController (BUG FIX #3).
   */
  signup(req: SignupRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.baseUrl}/signup`, req).pipe(
      tap((res: JwtResponse) => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res));
        this._currentUser.set(res);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUser(): JwtResponse | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
