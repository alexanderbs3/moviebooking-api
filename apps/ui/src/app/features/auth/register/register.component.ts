import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * BUG FIX #7 — Componente de cadastro ausente no frontend.
 * O backend já suportava registro via AuthService.signup(),
 * mas não havia tela de cadastro no Angular.
 *
 * Corretamente envia os campos fullName e phone exigidos pelo backend.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-page">
      <div class="corner-tl"></div>
      <div class="corner-br"></div>

      <div class="register-container">
        <div class="register-header">
          <div class="logo-mark">◈</div>
          <h1 class="register-title" data-text="CINEVERSE">CINEVERSE</h1>
          <p class="register-sub">// CRIAR NOVA CONTA</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="register-form" autocomplete="off">

          <div class="field-row">
            <div class="field-group">
              <label class="field-label">◂ IDENTIFICADOR</label>
              <input
                formControlName="username"
                type="text"
                class="cyber-input"
                placeholder="nome_usuario"
                [class.error]="isInvalid('username')"
              />
              @if (isInvalid('username')) {
                <span class="field-error">↳ Mínimo 3 caracteres</span>
              }
            </div>

            <div class="field-group">
              <label class="field-label">◂ NOME COMPLETO</label>
              <input
                formControlName="fullName"
                type="text"
                class="cyber-input"
                placeholder="Seu nome"
                [class.error]="isInvalid('fullName')"
              />
              @if (isInvalid('fullName')) {
                <span class="field-error">↳ Campo obrigatório</span>
              }
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">◂ E-MAIL</label>
            <input
              formControlName="email"
              type="email"
              class="cyber-input"
              placeholder="usuario@email.com"
              [class.error]="isInvalid('email')"
            />
            @if (isInvalid('email')) {
              <span class="field-error">↳ E-mail inválido</span>
            }
          </div>

          <div class="field-row">
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
                <span class="field-error">↳ Mínimo 6 caracteres</span>
              }
            </div>

            <div class="field-group">
              <label class="field-label">◂ TELEFONE <span class="optional">(opcional)</span></label>
              <input
                formControlName="phone"
                type="tel"
                class="cyber-input"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          @if (errorMsg()) {
            <div class="register-error">
              <span class="err-icon">⚠</span>
              <span>{{ errorMsg() }}</span>
            </div>
          }

          <button type="submit" class="btn-submit" [disabled]="loading()">
            @if (loading()) {
              <span class="cyber-spinner small"></span>
              <span>CRIANDO CONTA...</span>
            } @else {
              <span>CRIAR CONTA</span>
              <span class="btn-arrow">→</span>
            }
          </button>
        </form>

        <div class="register-footer">
          <div class="cyber-divider"></div>
          <p class="footer-text">
            JÁ POSSUI CONTA?
            <a routerLink="/login" class="footer-link">ACESSAR SISTEMA</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 24px;
      overflow: hidden;
    }

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

    .register-container {
      width: 100%;
      max-width: 560px;
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

    .register-header {
      text-align: center;
      margin-bottom: 36px;
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

    .register-title {
      font-family: var(--font-display);
      font-size: 1.8rem;
      font-weight: 900;
      letter-spacing: 0.2em;
      color: var(--text-primary);
    }

    .register-sub {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 6px;
      letter-spacing: 0.1em;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .optional {
      font-size: 0.65rem;
      color: var(--text-muted);
      opacity: 0.6;
    }

    .pass-wrap {
      position: relative;
    }
    .pass-wrap .cyber-input { padding-right: 48px; }
    .pass-toggle {
      position: absolute;
      right: 12px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      color: var(--text-muted); font-size: 1rem;
      cursor: pointer; transition: color 200ms;
      &:hover { color: var(--neon-green); }
    }

    .register-error {
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
      width: 16px; height: 16px; border-width: 2px;
    }

    .register-footer {
      margin-top: 28px;
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
  `]
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toast  = inject(ToastService);

  readonly showPass = signal(false);
  readonly loading  = signal(false);
  readonly errorMsg = signal('');

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    fullName: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone:    ['']
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

    const { username, fullName, email, password, phone } = this.form.value;

    this.auth.signup({
      username:  username!,
      fullName:  fullName!,
      email:     email!,
      password:  password!,
      phone:     phone || undefined
    }).subscribe({
      next: () => {
        this.toast.success('Conta criada com sucesso! Bem-vindo ao CineVerse!');
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Erro ao criar conta. Tente novamente.';
        this.errorMsg.set(msg);
      }
    });
  }
}
