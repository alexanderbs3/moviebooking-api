import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <a routerLink="/" class="logo" aria-label="Cineverse">
          <span class="logo-mark">CV</span>
          <span class="logo-copy">
            <span class="logo-text">Cineverse</span>
            <span class="logo-sub">Booking OS</span>
          </span>
        </a>

        <div class="nav-links" aria-label="Navegação principal">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Filmes</a>
          <a routerLink="/showtimes" routerLinkActive="active" class="nav-link">Sessões</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/my-bookings" routerLinkActive="active" class="nav-link">Reservas</a>
          }
          @if (auth.isAdmin()) {
            <span class="nav-divider"></span>
            <a routerLink="/admin" routerLinkActive="active" class="nav-link admin-link">Admin</a>
          }
        </div>

        <button
          class="theme-toggle"
          type="button"
          [attr.aria-label]="theme.isDark() ? 'Ativar modo claro' : 'Ativar modo escuro'"
          [attr.aria-pressed]="theme.isDark()"
          (click)="theme.toggleTheme()"
        >
          <span class="theme-toggle-icon" aria-hidden="true"></span>
          <span class="theme-toggle-text">{{ theme.isDark() ? 'Claro' : 'Escuro' }}</span>
        </button>

        <div class="nav-auth">
          @if (auth.isLoggedIn()) {
            <div class="user-info">
              <span class="user-badge">
                <span class="user-dot"></span>
                {{ auth.username() }}
              </span>
              <button class="btn-logout" type="button" (click)="auth.logout()">Sair</button>
            </div>
          } @else {
            <a routerLink="/login" class="btn-login">
              Entrar
              <span class="btn-arrow">-></span>
            </a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      min-height: 72px;
      background: var(--navbar-bg);
      border-bottom: 1px solid var(--navbar-border);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      transition: background var(--transition-slow), border-color var(--transition-slow);
    }

    .nav-inner {
      align-items: center;
      display: flex;
      gap: 28px;
      margin: 0 auto;
      max-width: 1280px;
      min-height: 72px;
      padding: 0 24px;
    }

    .logo {
      align-items: center;
      color: var(--text-primary);
      display: flex;
      flex-shrink: 0;
      gap: 12px;
    }

    .logo:hover { color: var(--text-primary); }

    .logo-mark {
      align-items: center;
      background: var(--brand-mark-bg);
      border-radius: 8px;
      box-shadow: var(--brand-mark-shadow);
      color: #ffffff;
      display: inline-flex;
      font-family: var(--font-display);
      font-size: 0.78rem;
      font-weight: 800;
      height: 38px;
      justify-content: center;
      width: 38px;
    }

    .logo-copy {
      display: flex;
      flex-direction: column;
      line-height: 1.05;
    }

    .logo-text {
      color: var(--text-primary);
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-weight: 800;
    }

    .logo-sub {
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.66rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      margin-top: 4px;
      text-transform: uppercase;
    }

    .nav-links {
      align-items: center;
      display: flex;
      flex: 1;
      gap: 4px;
      min-width: 0;
    }

    .nav-link {
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-family: var(--font-display);
      font-size: 0.9rem;
      font-weight: 700;
      padding: 9px 13px;
      white-space: nowrap;
    }

    .nav-link:hover {
      background: var(--interactive-muted);
      border-color: var(--border-dim);
      color: var(--text-primary);
    }

    .nav-link.active {
      background: var(--neon-green-dim);
      border-color: var(--border-neon);
      color: var(--neon-green);
    }

    .admin-link.active,
    .admin-link:hover {
      background: var(--neon-red-dim);
      border-color: rgba(220, 38, 38, 0.2);
      color: var(--neon-red);
    }

    .nav-divider {
      background: var(--border-dim);
      height: 24px;
      margin: 0 6px;
      width: 1px;
    }

    .nav-auth { margin-left: auto; }

    .theme-toggle {
      align-items: center;
      background: var(--bg-elevated);
      border: 1px solid var(--border-dim);
      border-radius: 999px;
      color: var(--text-secondary);
      cursor: pointer;
      display: inline-flex;
      flex-shrink: 0;
      font-family: var(--font-display);
      font-size: 0.78rem;
      font-weight: 800;
      gap: 8px;
      min-height: 40px;
      padding: 7px 12px 7px 8px;
      transition: background var(--transition), border-color var(--transition), color var(--transition), transform var(--transition), box-shadow var(--transition);
      white-space: nowrap;
    }

    .theme-toggle:hover {
      border-color: var(--border-neon);
      box-shadow: var(--shadow-sm);
      color: var(--text-primary);
      transform: translateY(-1px);
    }

    .theme-toggle-icon {
      background: var(--neon-green);
      border-radius: 999px;
      box-shadow: inset -5px -4px 0 rgba(255, 255, 255, 0.45);
      height: 24px;
      position: relative;
      transition: background var(--transition), box-shadow var(--transition), transform var(--transition);
      width: 24px;
    }

    .theme-toggle[aria-pressed="true"] .theme-toggle-icon {
      background: #f8fafc;
      box-shadow: inset -7px -4px 0 #111827;
      transform: rotate(-18deg);
    }

    .user-info {
      align-items: center;
      display: flex;
      gap: 10px;
    }

    .user-badge {
      align-items: center;
      background: var(--interactive-muted);
      border: 1px solid var(--border-dim);
      border-radius: 999px;
      color: var(--text-secondary);
      display: flex;
      font-size: 0.86rem;
      font-weight: 700;
      gap: 8px;
      max-width: 180px;
      overflow: hidden;
      padding: 8px 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-dot {
      background: #16a34a;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.12);
      flex: 0 0 auto;
      height: 8px;
      width: 8px;
    }

    .btn-logout,
    .btn-login {
      align-items: center;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: inline-flex;
      font-size: 0.86rem;
      font-weight: 800;
      gap: 8px;
      min-height: 40px;
      padding: 10px 14px;
      transition: var(--transition);
      white-space: nowrap;
    }

    .btn-logout {
      background: var(--bg-elevated);
      border: 1px solid rgba(220, 38, 38, 0.18);
      color: var(--neon-red);
    }

    .btn-logout:hover {
      background: var(--danger-muted);
      border-color: rgba(220, 38, 38, 0.32);
    }

    .btn-login {
      background: var(--neon-green);
      border: 1px solid var(--neon-green);
      box-shadow: 0 12px 24px rgba(37, 99, 235, 0.2);
      color: #ffffff;
    }

    .btn-login:hover {
      background: #1d4ed8;
      color: #ffffff;
      transform: translateY(-1px);
    }

    .btn-arrow {
      font-family: var(--font-mono);
      font-size: 0.78rem;
    }

    @media (max-width: 860px) {
      .nav-inner {
        align-items: stretch;
        flex-wrap: wrap;
        gap: 12px;
        padding: 14px 16px;
      }

      .navbar,
      .nav-inner {
        min-height: 0;
      }

      .nav-links {
        flex-basis: 100%;
        order: 3;
        overflow-x: auto;
        padding-bottom: 2px;
      }

      .nav-auth { margin-left: auto; }
    }

    @media (max-width: 540px) {
      .logo-sub,
      .user-badge,
      .theme-toggle-text {
        display: none;
      }

      .theme-toggle {
        padding: 7px;
      }

      .nav-link {
        font-size: 0.84rem;
        padding: 8px 10px;
      }
    }
  `]
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
}
