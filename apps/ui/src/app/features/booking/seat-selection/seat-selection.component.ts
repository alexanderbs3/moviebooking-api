import { Component, inject, OnInit, signal, Input, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../core/services/toast.service';
import { SeatResponse, ShowtimeResponse } from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  template: `
    <div class="page-container">

      <a routerLink="/showtimes" class="back-link">← VOLTAR ÀS SESSÕES</a>

      @if (loading()) {
        <app-loading message="CARREGANDO MAPA DE ASSENTOS..." [fullPage]="true" />
      }

      @if (!loading() && showtime()) {
        <div class="seat-layout">

          <!-- Info Panel -->
          <aside class="info-panel">
            <div class="panel-label">// SESSÃO SELECIONADA</div>

            <div class="session-card">
              <div class="movie-title">{{ showtime()!.movieTitle }}</div>
              <div class="session-row">
                <span class="sess-icon">◷</span>
                <span>{{ showtime()!.showTime }} — {{ showtime()!.showDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="session-row">
                <span class="sess-icon">▣</span>
                <span>{{ showtime()!.theaterName }}</span>
              </div>
              <div class="session-row">
                <span class="sess-icon">◎</span>
                <span>{{ showtime()!.theaterLocation }}</span>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Legend -->
            <div class="legend">
              <div class="panel-label">// LEGENDA</div>
              <div class="legend-items">
                <div class="legend-item">
                  <div class="seat-demo available"></div>
                  <span>DISPONÍVEL</span>
                </div>
                <div class="legend-item">
                  <div class="seat-demo selected"></div>
                  <span>SELECIONADO</span>
                </div>
                <div class="legend-item">
                  <div class="seat-demo occupied"></div>
                  <span>OCUPADO</span>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Summary -->
            <div class="summary">
              <div class="panel-label">// RESUMO</div>
              <div class="summary-row">
                <span class="sum-label">ASSENTOS</span>
                <span class="sum-value">{{ selectedSeats().length }} / 10</span>
              </div>
              <div class="summary-row">
                <span class="sum-label">VALOR UNIT.</span>
                <span class="sum-value">R$ {{ showtime()!.price | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row total">
                <span class="sum-label">TOTAL</span>
                <span class="sum-total">R$ {{ totalPrice() | number:'1.2-2' }}</span>
              </div>

              <!-- Selected list -->
              @if (selectedSeats().length > 0) {
                <div class="selected-list">
                  @for (id of selectedSeats(); track id) {
                    <span class="selected-tag" (click)="toggleSeat(id)">
                      {{ getSeatLabel(id) }} ✕
                    </span>
                  }
                </div>
              }
            </div>

            <button
              class="btn-confirm"
              [disabled]="selectedSeats().length === 0 || booking()"
              (click)="confirmBooking()"
            >
              @if (booking()) {
                <span class="cyber-spinner small"></span>
                PROCESSANDO...
              } @else {
                CONFIRMAR RESERVA →
              }
            </button>
          </aside>

          <!-- Seat Map -->
          <main class="seat-map-area">
            <div class="screen-container">
              <div class="screen-label">TELA</div>
              <div class="screen"></div>
              <div class="screen-glow"></div>
            </div>

            <!-- Rows -->
            <div class="seat-rows">
              @for (row of seatRows(); track row.label) {
                <div class="seat-row">
                  <span class="row-label">{{ row.label }}</span>
                  <div class="seats">
                    @for (seat of row.seats; track seat.id) {
                      <button
                        class="seat"
                        [class.available]="seat.isAvailable && !isSelected(seat.id)"
                        [class.selected]="isSelected(seat.id)"
                        [class.occupied]="!seat.isAvailable"
                        [disabled]="!seat.isAvailable"
                        (click)="toggleSeat(seat.id)"
                        [title]="seat.seatRow + seat.seatNumber + ' — ' + seat.seatType"
                      >
                        {{ seat.seatNumber }}
                      </button>
                    }
                  </div>
                  <span class="row-label">{{ row.label }}</span>
                </div>
              }
            </div>
          </main>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1280px; margin: 0 auto; padding: 24px 24px 64px; }

    .back-link {
      display: inline-block;
      margin-bottom: 24px;
      font-family: var(--font-display);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 200ms;
      &:hover { color: var(--neon-green); }
    }

    .seat-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 32px;
      align-items: start;
    }

    /* ── Info Panel ─────────────────────────────────────────── */
    .info-panel {
      background: var(--bg-surface);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-lg);
      padding: 24px;
      position: sticky;
      top: 80px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      &::before {
        content: '';
        position: absolute;
        top: 0; left: 20%; right: 20%;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--neon-green), transparent);
      }
    }

    .panel-label {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      color: var(--neon-green);
      letter-spacing: 0.15em;
      opacity: 0.7;
      margin-bottom: 4px;
    }

    .session-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .movie-title {
      font-family: var(--font-display);
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--text-primary);
      line-height: 1.3;
    }

    .session-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-mono);
      font-size: 0.78rem;
      color: var(--text-secondary);
    }

    .sess-icon { color: var(--neon-green); font-size: 0.8rem; flex-shrink: 0; }

    .divider { height: 1px; background: var(--border-dim); }

    /* Legend */
    .legend-items { display: flex; flex-direction: column; gap: 8px; }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--text-secondary);
    }

    .seat-demo {
      width: 20px; height: 20px;
      border-radius: 4px;
      flex-shrink: 0;
      &.available { background: var(--bg-elevated); border: 1px solid rgba(37,99,235,0.3); }
      &.selected  { background: var(--neon-green); }
      &.occupied  { background: var(--bg-deep); border: 1px solid var(--border-dim); opacity: 0.4; }
    }

    /* Summary */
    .summary { display: flex; flex-direction: column; gap: 10px; }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      &.total { margin-top: 4px; }
    }

    .sum-label { font-family: var(--font-display); font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; color: var(--text-muted); }
    .sum-value { font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-secondary); }
    .sum-total { font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; color: var(--neon-green); text-shadow: var(--neon-green-glow); }

    .selected-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }

    .selected-tag {
      padding: 3px 10px;
      border-radius: 9999px;
      background: rgba(37,99,235,0.1);
      border: 1px solid rgba(37,99,235,0.25);
      color: var(--neon-green);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      cursor: pointer;
      transition: var(--transition);
      &:hover { background: rgba(220,38,38,0.1); border-color: rgba(220,38,38,0.3); color: var(--neon-red); }
    }

    .btn-confirm {
      width: 100%;
      padding: 14px;
      background: var(--neon-green);
      color: #ffffff;
      border: none;
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 8px;

      &:hover:not(:disabled) {
        background: #1d4ed8;
        box-shadow: var(--neon-green-glow);
      }

      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    .cyber-spinner.small { width: 16px; height: 16px; border-width: 2px; }

    /* ── Seat Map ───────────────────────────────────────────── */
    .seat-map-area {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .screen-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .screen-label {
      font-family: var(--font-display);
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: var(--text-muted);
    }

    .screen {
      width: 60%;
      height: 6px;
      border-radius: 3px;
      background: linear-gradient(90deg, transparent, var(--neon-green), transparent);
    }

    .screen-glow {
      width: 60%;
      height: 20px;
      background: radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%);
    }

    /* Rows */
    .seat-rows { display: flex; flex-direction: column; gap: 8px; }

    .seat-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .row-label {
      font-family: var(--font-display);
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }

    .seats {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .seat {
      width: 34px;
      height: 34px;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 0.6rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 150ms ease;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;

      &.available {
        background: var(--bg-elevated);
        color: var(--text-secondary);
        border: 1px solid rgba(37,99,235,0.25);

        &:hover {
          background: rgba(37,99,235,0.15);
          color: var(--neon-green);
          border-color: var(--neon-green);
          box-shadow: 0 0 8px rgba(37,99,235,0.3);
          transform: scale(1.05);
        }
      }

      &.selected {
        background: var(--neon-green);
        color: #ffffff;
        border: 1px solid var(--neon-green);
        box-shadow: 0 0 10px rgba(37,99,235,0.5);
        transform: scale(1.05);
      }

      &.occupied {
        background: var(--bg-deep);
        color: var(--text-muted);
        border: 1px solid var(--border-dim);
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    @media (max-width: 900px) {
      .seat-layout { grid-template-columns: 1fr; }
      .info-panel { position: static; }
    }
  `]
})
export class SeatSelectionComponent implements OnInit {
  @Input() id!: string;

  private showtimeService = inject(ShowtimeService);
  private bookingService  = inject(BookingService);
  private toast           = inject(ToastService);
  private router          = inject(Router);

  readonly loading       = signal(true);
  readonly booking       = signal(false);
  readonly showtime      = signal<ShowtimeResponse | null>(null);
  readonly seats         = signal<SeatResponse[]>([]);
  readonly selectedSeats = signal<number[]>([]);

  readonly totalPrice = computed(() =>
    (this.showtime()?.price ?? 0) * this.selectedSeats().length
  );

  readonly seatRows = computed(() => {
    const map = new Map<string, SeatResponse[]>();
    for (const seat of this.seats()) {
      const row = seat.seatRow ?? 'A';
      if (!map.has(row)) map.set(row, []);
      map.get(row)!.push(seat);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, seats]) => ({ label, seats: seats.sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber)) }));
  });

  ngOnInit(): void {
    const stId = Number(this.id);
    this.showtimeService.getById(stId).subscribe({
      next: (st: any) => {
        this.showtime.set(st);
        this.showtimeService.getSeats(stId).subscribe({
          next: (s)  => { this.seats.set(s); this.loading.set(false); },
          error: ()  => this.loading.set(false)
        });
      },
      error: () => this.loading.set(false)
    });
  }

  isSelected(id: number): boolean {
    return this.selectedSeats().includes(id);
  }

  toggleSeat(id: number): void {
    const seat = this.seats().find(s => s.id === id);
    if (!seat?.isAvailable) return;

    if (this.isSelected(id)) {
      this.selectedSeats.update(s => s.filter(x => x !== id));
    } else {
      if (this.selectedSeats().length >= 10) {
        this.toast.error('Máximo de 10 assentos por reserva');
        return;
      }
      this.selectedSeats.update(s => [...s, id]);
    }
  }

  getSeatLabel(id: number): string {
    const s = this.seats().find(x => x.id === id);
    return s ? `${s.seatRow ?? ''}${s.seatNumber}` : `#${id}`;
  }

  confirmBooking(): void {
    if (!this.selectedSeats().length) return;
    this.booking.set(true);

    this.bookingService.create({
      showtimeId: Number(this.id),
      seatIds: this.selectedSeats()
    }).subscribe({
      next: (res: any) => {
        this.toast.success('Reserva confirmada com sucesso!');
        this.router.navigate(['/booking', res.bookingCode]);
      },
      error: (err: any) => {
        this.booking.set(false);
        this.toast.error(err.error?.message || 'Erro ao confirmar reserva');
      }
    });
  }
}
