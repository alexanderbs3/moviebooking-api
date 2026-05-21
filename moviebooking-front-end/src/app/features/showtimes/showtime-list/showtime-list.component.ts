import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { ShowtimeResponse } from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-showtime-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LoadingComponent],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="page-label">// GRADE DE PROGRAMAÇÃO</div>
        <h1 class="page-title">SESSÕES <span>DISPONÍVEIS</span></h1>
        <p class="page-subtitle">{{ showtimes().length }} sessões encontradas em {{ selectedDate }}</p>
      </div>

      <!-- Date Picker -->
      <div class="date-row">
        @for (d of dateOptions; track d.value) {
          <button
            class="date-chip"
            [class.active]="selectedDate === d.value"
            (click)="selectDate(d.value)">
            <span class="chip-day">{{ d.day }}</span>
            <span class="chip-label">{{ d.label }}</span>
          </button>
        }
        <input
          type="date"
          [(ngModel)]="customDate"
          (change)="selectDate(customDate)"
          class="cyber-input date-input"
          [min]="today"
        />
      </div>

      <!-- Loading -->
      @if (loading()) {
        <app-loading message="CONSULTANDO GRADE..." />
      }

      <!-- Showtimes -->
      @if (!loading()) {
        @if (showtimes().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">◷</div>
            <p class="empty-title">SEM SESSÕES</p>
            <p class="empty-sub">Nenhuma sessão disponível para a data selecionada</p>
          </div>
        } @else {
          <div class="showtime-grid">
            @for (st of showtimes(); track st.id) {
              <div class="st-card" [class.sold-out]="st.availableSeats === 0">
                <!-- Movie Poster -->
                <div class="st-poster">
                  @if (st.moviePosterUrl) {
                    <img [src]="st.moviePosterUrl" [alt]="st.movieTitle" />
                  } @else {
                    <div class="poster-placeholder">◈</div>
                  }
                </div>

                <!-- Main Content -->
                <div class="st-body">
                  <div class="st-header">
                    <div>
                      <p class="st-movie">{{ st.movieTitle }}</p>
                      <p class="st-duration">◷ {{ st.movieDurationMinutes }} min</p>
                    </div>
                    <div class="st-time-block">
                      <span class="st-time">{{ st.showTime }}</span>
                      <span class="st-date">{{ st.showDate | date:'dd/MM/yyyy' }}</span>
                    </div>
                  </div>

                  <div class="st-divider"></div>

                  <div class="st-details">
                    <div class="detail-row">
                      <span class="detail-label">SALA</span>
                      <span class="detail-value">{{ st.theaterName }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">LOCAL</span>
                      <span class="detail-value">{{ st.theaterLocation }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">LUGARES</span>
                      <span class="detail-value" [class.seats-ok]="st.availableSeats > 0" [class.seats-full]="st.availableSeats === 0">
                        {{ st.availableSeats }} / {{ st.totalSeats }}
                      </span>
                    </div>
                  </div>

                  <div class="st-footer">
                    <div class="st-price">
                      <span class="price-label">VALOR</span>
                      <span class="price-val">R$ {{ st.price | number:'1.2-2' }}</span>
                    </div>
                    @if (st.availableSeats > 0) {
                      <a [routerLink]="['/showtimes', st.id, 'seats']" class="btn-reserve">
                        RESERVAR →
                      </a>
                    } @else {
                      <span class="btn-esgotado">ESGOTADO</span>
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
    .page-container { max-width: 1280px; margin: 0 auto; padding: 0 24px 64px; }

    .page-label {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--neon-green);
      letter-spacing: 0.15em;
      opacity: 0.7;
      margin-bottom: 8px;
    }

    .page-header { padding: 40px 0 24px; }

    .page-title {
      font-family: var(--font-display);
      font-size: clamp(1.6rem, 4vw, 2.8rem);
      font-weight: 900;
      letter-spacing: 0.06em;
      color: var(--text-primary);
      span { color: var(--neon-green); }
    }

    .page-subtitle {
      font-family: var(--font-mono);
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 6px;
      letter-spacing: 0.06em;
    }

    /* ── Date Row ──────────────────────────────────────────── */
    .date-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }

    .date-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 18px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-dim);
      cursor: pointer;
      transition: var(--transition);
      gap: 2px;

      .chip-day   { font-family: var(--font-display); font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; color: var(--text-muted); }
      .chip-label { font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-secondary); }

      &:hover { border-color: rgba(37,99,235,0.3); }

      &.active {
        border-color: var(--neon-green);
        background: rgba(37,99,235,0.06);
        box-shadow: 0 0 12px rgba(37,99,235,0.1);
        .chip-day, .chip-label { color: var(--neon-green); }
      }
    }

    .date-input {
      width: auto;
      padding: 10px 14px;
      font-size: 0.8rem;
    }

    /* ── Showtime Grid ─────────────────────────────────────── */
    .showtime-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .st-card {
      display: grid;
      grid-template-columns: 80px 1fr;
      background: var(--bg-surface);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: var(--transition);

      &:hover {
        border-color: rgba(37,99,235,0.3);
        box-shadow: 0 0 0 1px rgba(37,99,235,0.08);
      }

      &.sold-out { opacity: 0.5; }
    }

    /* Poster */
    .st-poster {
      background: var(--bg-deep);
      overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; }
      .poster-placeholder {
        width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.5rem; color: var(--border-dim);
      }
    }

    /* Body */
    .st-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }

    .st-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .st-movie {
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--text-primary);
    }

    .st-duration {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .st-time-block {
      text-align: right;
      flex-shrink: 0;
    }

    .st-time {
      display: block;
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--neon-green);
      letter-spacing: 0.05em;
    }

    .st-date {
      display: block;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .st-divider {
      height: 1px;
      background: var(--border-dim);
    }

    .st-details { display: flex; gap: 24px; flex-wrap: wrap; }

    .detail-row { display: flex; flex-direction: column; gap: 2px; }

    .detail-label {
      font-family: var(--font-display);
      font-size: 0.55rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: var(--text-muted);
    }

    .detail-value {
      font-family: var(--font-mono);
      font-size: 0.82rem;
      color: var(--text-secondary);
      &.seats-ok   { color: var(--neon-green); }
      &.seats-full { color: var(--neon-red); }
    }

    .st-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
    }

    .st-price {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .price-label {
      font-family: var(--font-display);
      font-size: 0.55rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: var(--text-muted);
    }

    .price-val {
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .btn-reserve {
      padding: 10px 22px;
      background: var(--neon-green);
      color: #ffffff;
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-decoration: none;
      transition: var(--transition);
      &:hover { background: #1d4ed8; box-shadow: var(--neon-green-glow); }
    }

    .btn-esgotado {
      padding: 10px 22px;
      border: 1px solid rgba(220,38,38,0.3);
      color: var(--neon-red);
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.12em;
    }

    /* Empty */
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 80px 24px; gap: 16px; text-align: center;
      .empty-icon  { font-size: 3rem; color: var(--text-muted); opacity: 0.3; }
      .empty-title { font-family: var(--font-display); font-size: 1rem; font-weight: 700; letter-spacing: 0.15em; color: var(--text-secondary); }
      .empty-sub   { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); }
    }
  `]
})
export class ShowtimeListComponent implements OnInit {
  private showtimeService = inject(ShowtimeService);

  readonly loading   = signal(true);
  readonly showtimes = signal<ShowtimeResponse[]>([]);

  today        = new Date().toISOString().split('T')[0];
  selectedDate = this.today;
  customDate   = '';

  dateOptions = this.buildDateOptions();

  ngOnInit(): void {
    this.load(this.today);
  }

  selectDate(date: string): void {
    if (!date) return;
    this.selectedDate = date;
    this.load(date);
  }

  private load(date: string): void {
    this.loading.set(true);
    this.showtimeService.getByDate(date).subscribe({
      next: (data: any) => { this.showtimes.set(data); this.loading.set(false); },
      error: ()     => this.loading.set(false)
    });
  }

  private buildDateOptions(): { value: string; day: string; label: string }[] {
    const opts = [];
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      opts.push({
        value: d.toISOString().split('T')[0],
        day:   days[d.getDay()],
        label: `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
      });
    }
    return opts;
  }
}
