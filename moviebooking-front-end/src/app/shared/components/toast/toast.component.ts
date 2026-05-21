import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type">
          <span class="toast-icon">{{ toast.type === 'success' ? '◈' : '⚠' }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.remove(toast.id)">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-radius: var(--radius-md);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      min-width: 280px;
      max-width: 400px;
      animation: toast-in 0.25s ease;
      background: var(--bg-elevated);

      &.toast-success {
        border: 1px solid rgba(37,99,235,0.4);
        color: var(--neon-green);
        box-shadow: 0 0 16px rgba(37,99,235,0.15);
      }

      &.toast-error {
        border: 1px solid rgba(220,38,38,0.4);
        color: var(--neon-red);
        box-shadow: 0 0 16px rgba(220,38,38,0.15);
      }
    }

    .toast-icon { font-size: 1rem; flex-shrink: 0; }
    .toast-msg  { flex: 1; line-height: 1.4; }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      opacity: 0.5;
      cursor: pointer;
      font-size: 0.75rem;
      flex-shrink: 0;
      transition: opacity 150ms;
      &:hover { opacity: 1; }
    }

    @keyframes toast-in {
      from { opacity: 0; transform: translateX(32px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
