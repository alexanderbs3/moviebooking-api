import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Interceptor JWT.
 * - Adiciona o Bearer token em chamadas autenticadas.
 * - Não adiciona token em GETs públicos (catálogo, sessões, gêneros, salas).
 * - Trata erros HTTP globalmente.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const toast = inject(ToastService);

  const isPublicGet = req.method === 'GET' && (
    /\/api\/movies/.test(req.url)    ||
    /\/api\/genres/.test(req.url)    ||
    /\/api\/theaters/.test(req.url)  ||
    /\/api\/showtimes/.test(req.url)
  );

  const token = auth.getToken();
  const cloned = (token && !isPublicGet)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isPublicGet) {
        auth.logout();
        toast.error('Sessão expirada. Faça login novamente.');
      } else if (err.status === 403) {
        toast.error('Acesso negado. Apenas administradores podem realizar esta ação.');
      } else if (err.status >= 500) {
        toast.error('Erro no servidor. Tente novamente mais tarde.');
      }
      return throwError(() => err);
    })
  );
};
