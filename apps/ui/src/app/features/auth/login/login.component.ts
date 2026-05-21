import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <!-- Decorative Grid Corner -->
      <div class="corner-tl"></div>
      <div class="corner-br"></div>

      <div class="login-container">
        <!-- Header -->
        <div class="login-header">
          <div class="logo-mark">◈</div>
          <h1 class="login-title" data-text="CINEVERSE">CINEVERSE</h1>
          <p class="login-sub">// SYSTEM ACCESS REQUIRED</p>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form" autocomplete="off">

          <div class="field-group">
            <label class="field-label">◂ IDENTIFICADOR</label>
            <input
              formControlName="username"
              type="text"
              class="cyber-input"
              placeholder="usuario"
              [class.error]="isInvalid('username')"
            />
            @if (isInvalid('username')) {
              <span class="field-error">↳ Campo obrigatório</span>
            }
          </div>

          <div class="field-group">
            <label class="field-label">◂ CHAVE DE ACESSO</label>
            <div class="pass-wrap">
              <input
                formControlName="password"
                [type]="showPass() ? 'text' : 'password'"
                class="cyber-input"
                placeholder="••••••••"
                [class.error]="isInvalid('password')"
              />
              <button type="button" class="pass-toggle" (click)="showPass.set(!showPass())">
                {{ showPass() ? '◉' : '◎' }}
              </button>
            </div>
            @if (isInvalid('password')) {
              <span class="field-error">↳ Campo obrigatório</span>
            }
          </div>

          @if (errorMsg()) {
            <div class="login-error">
              <span class="err-icon">⚠</span>
              <span>{{ errorMsg() }}</span>
            </div>
          }

          <button type="submit" class="btn-submit" [disabled]="loading()">
            @if (loading()) {
              <span class="cyber-spinner small"></span>
              <span>AUTENTICANDO...</span>
            } @else {
              <span>ACESSAR SISTEMA</span>
              <span class="btn-arrow">→</span>
            }
          </button>
        </form>

        <!-- Footer -->
        <div class="login-footer">
          <div class="cyber-divider"></div>
          <p class="footer-text">
            SEM CONTA?
            <a routerLink="/register" class="footer-link">CADASTRAR-SE</a>
          </p>
        </div>

        <!-- Credentials hint for dev -->
        <div class="dev-hint">
          <span class="hint-label">DEV_HINT</span>
          <span>admin / admin123 &nbsp;|&nbsp; user / user123</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 24px;
      overflow: hidden;
    }

    /* Decorative corners */
    .corner-tl, .corner-br {
      position: absolute;
      width: 200px;
      height: 200px;
      pointer-events: none;
    }

    .corner-tl {
      top: 40px; left: 40px;
      border-top: 1px solid rgba(37,99,235,0.2);
      border-left: 1px solid rgba(37,99,235,0.2);
    }

    .corner-br {
      bottom: 40px; right: 40px;
      border-bottom: 1px solid rgba(37,99,235,0.2);
      border-right: 1px solid rgba(37,99,235,0.2);
    }

    .login-container {
      width: 100%;
      max-width: 420px;
      background: var(--bg-surface);
      border: 1px solid #1e1e1e;
      border-radius: var(--radius-lg);
      padding: 48px 40px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0; left: 20%; right: 20%;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--neon-green), transparent);
      }
    }

    .login-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo-mark {
      font-size: 2rem;
      color: var(--neon-green);
      text-shadow: var(--neon-green-glow);
      margin-bottom: 16px;
      animation: logo-pulse 2s ease-in-out infinite;
    }

    @keyframes logo-pulse {
      0%, 100% { text-shadow: 0 0 8px rgba(37,99,235,0.6); }
      50%       { text-shadow: 0 0 24px rgba(37,99,235,0.9), 0 0 48px rgba(37,99,235,0.4); }
    }

    .login-title {
      font-family: var(--font-display);
      font-size: 1.8rem;
      font-weight: 900;
      letter-spacing: 0.2em;
      color: var(--text-primary);
      position: relative;
    }

    .login-sub {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 6px;
      letter-spacing: 0.1em;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .pass-wrap {
      position: relative;
    }

    .pass-wrap .cyber-input {
      padding-right: 48px;
    }

    .pass-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1rem;
      cursor: pointer;
      transition: color 200ms;
      &:hover { color: var(--neon-green); }
    }

    .login-error {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      background: rgba(220,38,38,0.06);
      border: 1px solid rgba(220,38,38,0.3);
      color: var(--neon-red);
      font-family: var(--font-mono);
      font-size: 0.8rem;
    }

    .btn-submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 14px;
      margin-top: 8px;
      background: var(--neon-green);
      color: #ffffff;
      border: none;
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      cursor: pointer;
      transition: var(--transition);

      .btn-arrow { transition: transform 200ms; }

      &:hover:not(:disabled) {
        background: #1d4ed8;
        box-shadow: var(--neon-green-glow);
        .btn-arrow { transform: translateX(4px); }
      }

      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .cyber-spinner.small {
      width: 16px;
      height: 16px;
      border-width: 2px;
    }

    .login-footer {
      margin-top: 32px;
      text-align: center;
    }

    .footer-text {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 16px;
      letter-spacing: 0.05em;
    }

    .footer-link {
      color: var(--neon-green);
      margin-left: 8px;
      font-weight: 600;
      &:hover { text-shadow: var(--neon-green-glow); }
    }

    .dev-hint {
      margin-top: 16px;
      padding: 10px 14px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--text-muted);
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .hint-label {
      color: var(--neon-green);
      opacity: 0.5;
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      flex-shrink: 0;
    }
  `]
})
export class LoginComponent {
  private fb      = inject(FormBuilder);
  private auth    = inject(AuthService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);
  private toast   = inject(ToastService);

  readonly showPass = signal(false);
  readonly loading  = signal(false);
  readonly errorMsg = signal('');

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMsg.set('');

    const { username, password } = this.form.value;

    // BUG FIX #1 — mapeamento do campo "username" do form → "usernameOrEmail" do backend
    this.auth.login({ usernameOrEmail: username!, password: password! }).subscribe({
      next: () => {
        this.toast.success('Acesso autorizado. Bem-vindo!');
        const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
        this.router.navigateByUrl(redirect);
      },
      error: (err: any) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Credenciais inválidas';
        this.errorMsg.set(msg);
      }
    });
  }
}
