import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastContainerComponent } from './shared/components/toast/toast.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastContainerComponent],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
    <app-toast-container />
  `,
  styles: [`
    .main-content {
      animation: page-enter 360ms ease both;
      min-height: calc(100vh - 64px);
      position: relative;
      z-index: 1;
    }

    @keyframes page-enter {
      from {
        opacity: 0;
        transform: translateY(8px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .main-content {
        animation: none;
      }
    }
  `]
})
export class AppComponent {
  private readonly theme = inject(ThemeService);
}

