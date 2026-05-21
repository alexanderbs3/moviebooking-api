import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../core/services/toast.service';
import { SeatResponse } from '../../../core/models/models';
import { BookingResponse } from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [RouterLink, CommonModule, LoadingComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-label">// HISTÓRICO DO USUÁRIO</div>
        <h1 class="page-title">MINHAS <span>RESERVAS</span></h1>
        <p class="page-subtitle">{{ bookings().length }} reservas registradas no sistema</p>
      </div>

      @if (loading()) {
        <app-loading message="CARREGANDO HISTÓRICO..." [fullPage]="true" />
      }

      @if (!loading()) {
        @if (bookings().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">◈</div>
            <p class="empty-title">SEM RESERVAS</p>
            <p class="empty-sub">Você ainda não realizou nenhuma reserva</p>
            <a routerLink="/showtimes" class="btn-outline">VER SESSÕES →</a>
          </div>
        } @else {
          <div class="bookings-list">
            @for (b of bookings(); track b.id) {
              <div class="booking-card" [class.cancelled]="b.status === 'CANCELLED'">
                <!-- Status stripe -->
                <div class="status-stripe" [class]="'stripe-' + b.status.toLowerCase()"></div>

                <!-- Poster -->
                <div class="booking-poster">
                  @if (b.showtime.moviePosterUrl) {
                    <img [src]="b.showtime.moviePosterUrl" [alt]="b.showtime.movieTitle" />
                  } @else {
                    <div class="no-poster">◈</div>
                  }
                </div>

                <!-- Content -->
                <div class="booking-content">
                  <div class="booking-top">
                    <div>
                      <div class="booking-code">{{ b.bookingCode }}</div>
                      <h2 class="booking-movie">{{ b.showtime.movieTitle }}</h2>
                    </div>
                    <div class="booking-status">
                      <span class="badge" [ngClass]="{
                        'badge-green': b.status === 'CONFIRMED',
                        'badge-red':   b.status === 'CANCELLED',
                        'badge-cyan':  b.status === 'PENDING'
                      }">{{ statusLabel(b.status) }}</span>
                    </div>
                  </div>

                  <div class="booking-info-grid">
                    <div class="info-block">
                      <span class="info-label">DATA / HORA</span>
                      <span class="info-value">{{ b.showtime.showDate | date:'dd/MM/yyyy' }} às {{ b.showtime.showTime }}</span>
                    </div>
                    <div class="info-block">
                      <span class="info-label">SALA</span>
                      <span class="info-value">{{ b.showtime.theaterName }}</span>
                    </div>
                    <div class="info-block">
                      <span class="info-label">ASSENTOS</span>
                      <span class="info-value">{{ formatSeats(b.seats) }}</span>
                    </div>
                    <div class="info-block">
                      <span class="info-label">TOTAL</span>
                      <span class="info-value price">R$ {{ b.totalPrice | number:'1.2-2' }}</span>
                    </div>
                  </div>

                  <div class="booking-actions">
                    <a [routerLink]="['/booking', b.bookingCode]" class="btn-ghost btn-sm">DETALHES →</a>
                    @if (b.status === 'CONFIRMED') {
                      <button class="btn-danger btn-sm" (click)="cancel(b.bookingCode)" [disabled]="cancelling() === b.bookingCode">
                        @if (cancelling() === b.bookingCode) {
                          CANCELANDO...
                        } @else {
                          CANCELAR RESERVA
                        }
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; padding: 0 24px 64px; }

    .page-label { font-family: var(--font-mono); font-size: 0.72rem; color: var(--neon-green); letter-spacing: 0.15em; opacity: 0.7; margin-bottom: 8px; }
    .page-header { padding: 40px 0 32px; }
    .page-title { font-family: var(--font-display); font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 900; letter-spacing: 0.06em; color: var(--text-primary); span { color: var(--neon-green); } }
    .page-subtitle { font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted); margin-top: 6px; }

    .bookings-list { display: flex; flex-direction: column; gap: 12px; }

    .booking-card {
      display: grid;
      grid-template-columns: 6px 100px 1fr;
      background: var(--bg-surface);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: var(--transition);

      &:hover { border-color: rgba(37,99,235,0.2); }
      &.cancelled { opacity: 0.55; }
    }

    .status-stripe {
      &.stripe-confirmed { background: var(--neon-green); box-shadow: 0 0 8px rgba(37,99,235,0.5); }
      &.stripe-cancelled { background: var(--neon-red); }
      &.stripe-pending   { background: var(--neon-cyan); }
    }

    .booking-poster {
      background: var(--bg-deep);
      img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .no-poster {
        width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.5rem; color: var(--border-dim);
      }
    }

    .booking-content {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .booking-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .booking-code {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: var(--neon-green);
      letter-spacing: 0.08em;
      margin-bottom: 4px;
    }

    .booking-movie {
      font-family: var(--font-display);
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--text-primary);
    }

    .booking-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
    }

    .info-block { display: flex; flex-direction: column; gap: 3px; }
    .info-label { font-family: var(--font-display); font-size: 0.55rem; font-weight: 700; letter-spacing: 0.15em; color: var(--text-muted); }
    .info-value { font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-secondary); &.price { color: var(--neon-green); font-size: 0.95rem; } }

    .booking-actions { display: flex; gap: 8px; }

    .btn-sm { padding: 8px 16px !important; font-size: 0.62rem !important; }

    .btn-ghost {
      display: inline-flex; align-items: center;
      padding: 8px 16px;
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--text-secondary);
      background: transparent;
      border: 1px solid var(--border-dim);
      text-decoration: none;
      cursor: pointer;
      transition: var(--transition);
      &:hover { border-color: var(--text-secondary); color: var(--text-primary); }
    }

    .btn-danger {
      display: inline-flex; align-items: center;
      padding: 8px 16px;
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--neon-red);
      background: transparent;
      border: 1px solid rgba(220,38,38,0.3);
      cursor: pointer;
      transition: var(--transition);
      &:hover:not(:disabled) { background: rgba(220,38,38,0.08); border-color: var(--neon-red); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    .btn-outline {
      display: inline-flex; align-items: center;
      padding: 10px 22px;
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--neon-green);
      background: transparent;
      border: 1px solid var(--neon-green);
      text-decoration: none;
      transition: var(--transition);
      &:hover { background: rgba(37,99,235,0.08); box-shadow: var(--neon-green-glow); }
    }

    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 80px 24px; gap: 16px; text-align: center;
      .empty-icon  { font-size: 3rem; color: var(--text-muted); opacity: 0.3; }
      .empty-title { font-family: var(--font-display); font-size: 1rem; font-weight: 700; letter-spacing: 0.15em; color: var(--text-secondary); }
      .empty-sub   { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; }
    }
  `]
})
export class MyBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private toast          = inject(ToastService);

  readonly loading    = signal(true);
  readonly bookings   = signal<BookingResponse[]>([]);
  readonly cancelling = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (data: any) => { this.bookings.set(data); this.loading.set(false); },
      error: ()     => this.loading.set(false)
    });
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = { CONFIRMED: 'CONFIRMADA', CANCELLED: 'CANCELADA', PENDING: 'PENDENTE' };
    return map[s] ?? s;
  }

  formatSeats(seats: SeatResponse[]): string {
    return seats.map(s => (s.seatRow ?? '') + s.seatNumber).join(', ');
  }

  cancel(code: string): void {
    if (!confirm('Confirma cancelamento desta reserva?')) return;
    this.cancelling.set(code);
    this.bookingService.cancel(code).subscribe({
      next: () => {
        this.toast.success('Reserva cancelada com sucesso');
        this.cancelling.set(null);
        this.load();
      },
      error: (err: any) => {
        this.cancelling.set(null);
        this.toast.error(err.error?.message || 'Erro ao cancelar reserva');
      }
    });
  }
}
