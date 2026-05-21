import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="loading-wrap" [class.fullpage]="fullPage">
      <div class="cyber-spinner"></div>
      @if (message) {
        <p class="loading-msg">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 48px;

      &.fullpage {
        min-height: 60vh;
      }
    }
    .loading-msg {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--text-muted);
      letter-spacing: 0.08em;
    }
  `]
})
export class LoadingComponent {
  @Input() message = '';
  @Input() fullPage = false;
}
