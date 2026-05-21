import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../core/services/toast.service';
import { BookingResponse } from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, LoadingComponent],
  template: `
    <div class="page-container">
      <a routerLink="/my-bookings" class="back-link">← MINHAS RESERVAS</a>

      @if (loading()) {
        <app-loading message="CARREGANDO RESERVA..." [fullPage]="true" />
      }

      @if (!loading() && booking()) {
        <div class="detail-wrapper">
          <!-- Header -->
          <div class="detail-header">
            <div class="header-left">
              <div class="hdr-label">// COMPROVANTE DE RESERVA</div>
              <h1 class="hdr-code">{{ booking()!.bookingCode }}</h1>
              <span class="hdr-status badge" [ngClass]="{
                'badge-green': booking()!.status === 'CONFIRMED',
                'badge-red':   booking()!.status === 'CANCELLED',
                'badge-cyan':  booking()!.status === 'PENDING'
              }">{{ statusLabel(booking()!.status) }}</span>
            </div>
            <div class="header-qr">
              <div class="qr-placeholder">
                <span class="qr-icon">◈◈◈</span>
                <span class="qr-text">QR CODE</span>
                <span class="qr-code">{{ booking()!.bookingCode }}</span>
              </div>
            </div>
          </div>

          <div class="cyber-divider"></div>

          <!-- Content Grid -->
          <div class="content-grid">
            <!-- Movie Info -->
            <div class="info-section">
              <div class="section-label">// FILME</div>
              <div class="movie-block">
                @if (booking()!.showtime.moviePosterUrl) {
                  <img [src]="booking()!.showtime.moviePosterUrl" class="movie-thumb" [alt]="booking()!.showtime.movieTitle" />
                }
                <div>
                  <h2 class="movie-name">{{ booking()!.showtime.movieTitle }}</h2>
                  <p class="movie-duration">◷ {{ booking()!.showtime.movieDurationMinutes }} minutos</p>
                </div>
              </div>
            </div>

            <!-- Session Info -->
            <div class="info-section">
              <div class="section-label">// SESSÃO</div>
              <div class="data-rows">
                <div class="data-row">
                  <span class="data-k">DATA</span>
                  <span class="data-v">{{ booking()!.showtime.showDate | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="data-row">
                  <span class="data-k">HORÁRIO</span>
                  <span class="data-v">{{ booking()!.showtime.showTime }}</span>
                </div>
                <div class="data-row">
                  <span class="data-k">SALA</span>
                  <span class="data-v">{{ booking()!.showtime.theaterName }}</span>
                </div>
                <div class="data-row">
                  <span class="data-k">LOCALIZAÇÃO</span>
                  <span class="data-v">{{ booking()!.showtime.theaterLocation }}</span>
                </div>
              </div>
            </div>

            <!-- Seats -->
            <div class="info-section">
              <div class="section-label">// ASSENTOS ({{ booking()!.totalSeats }})</div>
              <div class="seats-grid">
                @for (seat of booking()!.seats; track seat.id) {
                  <div class="seat-chip">
                    <span class="seat-num">{{ seat.row }}{{ seat.seatNumber }}</span>
                    <span class="seat-type">{{ seat.seatType }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- User & Payment -->
            <div class="info-section">
              <div class="section-label">// COMPRADOR</div>
              <div class="data-rows">
                <div class="data-row">
                  <span class="data-k">USUÁRIO</span>
                  <span class="data-v">{{ booking()!.username }}</span>
                </div>
                <div class="data-row">
                  <span class="data-k">EMAIL</span>
                  <span class="data-v">{{ booking()!.userEmail }}</span>
                </div>
                <div class="data-row">
                  <span class="data-k">DATA RESERVA</span>
                  <span class="data-v">{{ booking()!.bookingDate | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="cyber-divider"></div>

          <!-- Total & Actions -->
          <div class="footer-row">
            <div class="total-block">
              <span class="total-label">VALOR TOTAL</span>
              <span class="total-val">R$ {{ booking()!.totalPrice | number:'1.2-2' }}</span>
            </div>
            <div class="actions">
              <a routerLink="/showtimes" class="btn-outline-sm">NOVA RESERVA</a>
              @if (booking()!.status === 'CONFIRMED') {
                <button class="btn-danger-sm" (click)="cancel()" [disabled]="cancelling()">
                  {{ cancelling() ? 'CANCELANDO...' : 'CANCELAR RESERVA' }}
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; padding: 24px 24px 64px; }

    .back-link {
      display: inline-block; margin-bottom: 24px;
      font-family: var(--font-display); font-size: 0.65rem; font-weight: 700;
      letter-spacing: 0.12em; color: var(--text-muted); text-decoration: none; transition: color 200ms;
      &:hover { color: var(--neon-green); }
    }

    .detail-wrapper {
      background: var(--bg-surface);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-lg);
      padding: 32px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0; left: 15%; right: 15%;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--neon-green), transparent);
      }
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 24px;
    }

    .hdr-label {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: var(--neon-green);
      letter-spacing: 0.15em;
      opacity: 0.7;
      margin-bottom: 8px;
    }

    .hdr-code {
      font-family: var(--font-display);
      font-size: 1.8rem;
      font-weight: 900;
      letter-spacing: 0.1em;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .hdr-status { font-size: 0.65rem; }

    /* QR Placeholder */
    .qr-placeholder {
      width: 100px; height: 100px;
      background: var(--bg-elevated);
      border: 1px solid rgba(37,99,235,0.2);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .qr-icon  { font-family: var(--font-mono); font-size: 0.8rem; color: var(--neon-green); letter-spacing: 4px; }
    .qr-text  { font-family: var(--font-display); font-size: 0.5rem; letter-spacing: 0.15em; color: var(--text-muted); }
    .qr-code  { font-family: var(--font-mono); font-size: 0.55rem; color: var(--text-muted); }

    /* Divider */
    .cyber-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(37,99,235,0.2), transparent);
      margin: 24px 0;
    }

    /* Content grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    .info-section { display: flex; flex-direction: column; gap: 14px; }

    .section-label {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      color: var(--neon-green);
      letter-spacing: 0.15em;
      opacity: 0.7;
    }

    /* Movie block */
    .movie-block { display: flex; gap: 14px; align-items: flex-start; }

    .movie-thumb {
      width: 60px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      aspect-ratio: 2/3;
      flex-shrink: 0;
    }

    .movie-name {
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.3;
    }

    .movie-duration {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 6px;
    }

    /* Data rows */
    .data-rows { display: flex; flex-direction: column; gap: 10px; }

    .data-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-dim);
      &:last-child { border-bottom: none; }
    }

    .data-k { font-family: var(--font-display); font-size: 0.55rem; font-weight: 700; letter-spacing: 0.12em; color: var(--text-muted); flex-shrink: 0; }
    .data-v { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary); text-align: right; }

    /* Seats grid */
    .seats-grid { display: flex; flex-wrap: wrap; gap: 8px; }

    .seat-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 8px 12px;
      background: rgba(37,99,235,0.06);
      border: 1px solid rgba(37,99,235,0.2);
      border-radius: var(--radius-md);
    }

    .seat-num  { font-family: var(--font-display); font-size: 0.85rem; font-weight: 800; color: var(--neon-green); }
    .seat-type { font-family: var(--font-mono); font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.06em; }

    /* Footer */
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .total-block { display: flex; flex-direction: column; gap: 4px; }
    .total-label { font-family: var(--font-display); font-size: 0.6rem; font-weight: 700; letter-spacing: 0.15em; color: var(--text-muted); }
    .total-val   { font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--neon-green); text-shadow: var(--neon-green-glow); }

    .actions { display: flex; gap: 10px; }

    .btn-outline-sm, .btn-danger-sm {
      display: inline-flex; align-items: center;
      padding: 10px 20px;
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      cursor: pointer;
      transition: var(--transition);
      text-decoration: none;
    }

    .btn-outline-sm {
      color: var(--neon-green);
      background: transparent;
      border: 1px solid var(--neon-green);
      &:hover { background: rgba(37,99,235,0.08); box-shadow: var(--neon-green-glow); }
    }

    .btn-danger-sm {
      color: var(--neon-red);
      background: transparent;
      border: 1px solid rgba(220,38,38,0.3);
      &:hover:not(:disabled) { background: rgba(220,38,38,0.08); border-color: var(--neon-red); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    @media (max-width: 768px) {
      .content-grid { grid-template-columns: 1fr; }
      .footer-row   { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class BookingDetailComponent implements OnInit {
  @Input() code!: string;

  private bookingService = inject(BookingService);
  private toast          = inject(ToastService);
  private router         = inject(Router);

  readonly loading    = signal(true);
  readonly booking    = signal<BookingResponse | null>(null);
  readonly cancelling = signal(false);

  ngOnInit(): void {
    this.bookingService.getByCode(this.code).subscribe({
      next: (b: any) => { this.booking.set(b); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = { CONFIRMED: 'CONFIRMADA', CANCELLED: 'CANCELADA', PENDING: 'PENDENTE' };
    return map[s] ?? s;
  }

  cancel(): void {
    if (!confirm('Confirma cancelamento desta reserva?')) return;
    this.cancelling.set(true);
    this.bookingService.cancel(this.code).subscribe({
      next: () => {
        this.toast.success('Reserva cancelada');
        this.router.navigate(['/my-bookings']);
      },
      error: (err: any) => {
        this.cancelling.set(false);
        this.toast.error(err.error?.message || 'Erro ao cancelar');
      }
    });
  }
}
