import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../../core/services/movie.service';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { MovieResponse, ShowtimeResponse } from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, LoadingComponent],
  template: `
    <div class="detail-page">
      @if (loading()) {
        <app-loading message="CARREGANDO DADOS..." [fullPage]="true" />
      }

      @if (!loading() && movie()) {
        <!-- Backdrop -->
        <div class="backdrop" [style.background-image]="movie()!.posterUrl ? 'url(' + movie()!.posterUrl + ')' : 'none'"></div>
        <div class="backdrop-overlay"></div>

        <div class="page-container detail-content">

          <!-- Back -->
          <a routerLink="/" class="back-link">← VOLTAR AO CATÁLOGO</a>

          <div class="detail-layout">
            <!-- Poster -->
            <div class="poster-col">
              <div class="poster-frame">
                @if (movie()!.posterUrl) {
                  <img [src]="movie()!.posterUrl" [alt]="movie()!.title" class="detail-poster" />
                } @else {
                  <div class="poster-no-img">
                    <span>◈</span>
                    <span>NO SIGNAL</span>
                  </div>
                }
                <div class="poster-scan"></div>
              </div>
            </div>

            <!-- Info -->
            <div class="info-col">
              <!-- Label -->
              <div class="info-label">// FICHA TÉCNICA</div>

              <!-- Title -->
              <h1 class="detail-title">{{ movie()!.title }}</h1>

              <!-- Stats Row -->
              <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-icon">★</span>
                  <span class="stat-val">{{ movie()!.rating | number:'1.1-1' }}</span>
                  <span class="stat-unit">/10</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-icon">◷</span>
                  <span class="stat-val">{{ movie()!.durationMinutes }}</span>
                  <span class="stat-unit">MIN</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-icon">◈</span>
                  <span class="stat-val">{{ movie()!.releaseDate | date:'yyyy' }}</span>
                </div>
              </div>

              <!-- Genres -->
              <div class="genres-row">
                @for (g of movie()!.genres; track g.id) {
                  <span class="badge badge-green">{{ g.name }}</span>
                }
              </div>

              <!-- Classificação indicativa + status -->
              <div class="meta-chips">
                @if (movie()!.ageRating) {
                  <span class="chip-age">{{ movie()!.ageRating === 'L' ? 'Livre' : movie()!.ageRating + ' anos' }}</span>
                }
                @if (movie()!.movieStatus === 'NOW_PLAYING') {
                  <span class="chip-status now">EM CARTAZ</span>
                } @else if (movie()!.movieStatus === 'COMING_SOON') {
                  <span class="chip-status soon">EM BREVE</span>
                } @else {
                  <span class="chip-status ended">ENCERRADO</span>
                }
                @if (movie()!.language) {
                  <span class="chip-lang">{{ movie()!.language }}</span>
                }
              </div>

              <!-- Diretor + Elenco -->
              @if (movie()!.director) {
                <div class="detail-row">
                  <span class="detail-key">DIREÇÃO</span>
                  <span class="detail-val">{{ movie()!.director }}</span>
                </div>
              }
              @if (movie()!.castMembers) {
                <div class="detail-row">
                  <span class="detail-key">ELENCO</span>
                  <span class="detail-val">{{ movie()!.castMembers }}</span>
                </div>
              }

              <!-- Description -->
              @if (movie()!.description) {
                <div class="description-block">
                  <div class="desc-label">SINOPSE</div>
                  <p class="desc-text">{{ movie()!.description }}</p>
                </div>
              }

              <!-- Trailer -->
              @if (movie()!.trailerUrl) {
                <div class="trailer-block">
                  <div class="desc-label">TRAILER</div>
                  <a [href]="movie()!.trailerUrl" target="_blank" rel="noopener" class="trailer-link-btn">
                    <span class="trailer-play">▶</span>
                    <span>ASSISTIR TRAILER</span>
                  </a>
                </div>
              }

              <!-- CTA -->
              <div class="cta-block">
                @if (movie()!.movieStatus !== 'ENDED') {
                  <a routerLink="/showtimes" class="btn-book">
                    <span class="btn-icon">▶</span>
                    <span>VER SESSÕES</span>
                  </a>
                }
                <span class="status-badge" [class.status-active]="movie()!.active" [class.status-inactive]="!movie()!.active">
                  {{ movie()!.active ? 'DISPONÍVEL' : 'INDISPONÍVEL' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Showtimes Section -->
          @if (showtimes().length > 0) {
            <div class="showtimes-section">
              <div class="section-header">
                <h2 class="section-title">PRÓXIMAS SESSÕES</h2>
                <div class="section-line"></div>
              </div>

              <div class="showtime-cards">
                @for (st of showtimes(); track st.id) {
                  <div class="showtime-card" [routerLink]="['/showtimes', st.id, 'seats']">
                    <div class="st-date">{{ st.showDate | date:'dd/MM' }}</div>
                    <div class="st-time">{{ st.showTime }}</div>
                    <div class="st-theater">{{ st.theaterName }}</div>
                    <div class="st-seats">
                      <span [class.seats-ok]="st.availableSeats > 0" [class.seats-full]="st.availableSeats === 0">
                        {{ st.availableSeats }}/{{ st.totalSeats }} LUGARES
                      </span>
                    </div>
                    <div class="st-price">R$ {{ st.price | number:'1.2-2' }}</div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      @if (!loading() && !movie()) {
        <div class="not-found">
          <div class="nf-code">404</div>
          <p>FILME NÃO ENCONTRADO NO SISTEMA</p>
          <a routerLink="/" class="btn-outline">← VOLTAR</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page { position: relative; min-height: 100vh; }

    /* Backdrop */
    .backdrop {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 60vh;
      background-size: cover;
      background-position: center top;
      filter: blur(40px) saturate(0.2);
      opacity: 0.12;
      pointer-events: none;
      z-index: 0;
    }

    .backdrop-overlay {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 60vh;
      background: linear-gradient(to bottom, rgba(0,0,0,0.6), var(--bg-void));
      pointer-events: none;
      z-index: 0;
    }

    .detail-content { position: relative; z-index: 1; padding-bottom: 64px; }

    .back-link {
      display: inline-block;
      margin-top: 24px;
      font-family: var(--font-display);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 200ms;
      &:hover { color: var(--neon-green); }
    }

    /* Layout */
    .detail-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 48px;
      margin-top: 32px;
    }

    /* Poster */
    .poster-frame {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid rgba(37,99,235,0.15);
      box-shadow: 0 0 40px rgba(0,0,0,0.8);
    }

    .detail-poster {
      width: 100%;
      display: block;
      aspect-ratio: 2/3;
      object-fit: cover;
    }

    .poster-no-img {
      aspect-ratio: 2/3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: var(--bg-surface);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-muted);
      letter-spacing: 0.15em;
      span:first-child { font-size: 2.5rem; color: var(--border-dim); }
    }

    .poster-scan {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: rgba(37,99,235,0.6);
      animation: scan-move 4s linear infinite;
      box-shadow: 0 0 8px rgba(37,99,235,0.8);
    }

    @keyframes scan-move {
      0%   { top: 0; opacity: 1; }
      80%  { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }

    /* Info */
    .info-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-top: 8px;
    }

    .info-label {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--neon-green);
      letter-spacing: 0.15em;
      opacity: 0.7;
    }

    .detail-title {
      font-family: var(--font-display);
      font-size: clamp(1.4rem, 3vw, 2.4rem);
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.1;
      color: var(--text-primary);
    }

    .stats-row {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .stat-item {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .stat-icon { color: var(--neon-green); font-size: 0.9rem; }
    .stat-val  { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; color: var(--text-primary); }
    .stat-unit { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); }
    .stat-divider { width: 1px; height: 20px; background: var(--border-dim); }

    .genres-row { display: flex; flex-wrap: wrap; gap: 6px; }

    .description-block {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 20px;
      background: var(--bg-surface);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      border-left: 2px solid rgba(37,99,235,0.3);
    }

    .desc-label {
      font-family: var(--font-display);
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: var(--neon-green);
      opacity: 0.7;
    }

    .desc-text {
      font-family: var(--font-body);
      font-size: 0.92rem;
      color: var(--text-secondary);
      line-height: 1.7;
    }

    .cta-block {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 8px;
    }

    .btn-book {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      background: var(--neon-green);
      color: #ffffff;
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-decoration: none;
      transition: var(--transition);
      &:hover {
        background: #1d4ed8;
        box-shadow: var(--neon-green-glow);
        transform: translateY(-1px);
      }
    }

    .btn-icon { font-size: 0.8rem; }

    .meta-chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 4px 0 12px; }
    .chip-age { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; padding: 3px 10px; border-radius: 4px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; }
    .chip-status { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; &.now { background: rgba(37,99,235,0.12); border: 1px solid rgba(37,99,235,0.3); color: var(--neon-green); } &.soon { background: rgba(255,200,0,0.12); border: 1px solid rgba(255,200,0,0.3); color: #b45309; } &.ended { background: rgba(255,255,255,0.06); border: 1px solid #333; color: var(--text-muted); } }
    .chip-lang { font-family: var(--font-mono); font-size: 0.65rem; padding: 3px 10px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid #2a2a2a; color: var(--text-muted); }
    .detail-row { display: flex; gap: 12px; align-items: baseline; margin-bottom: 6px; }
    .detail-key { font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); min-width: 70px; letter-spacing: 0.05em; }
    .detail-val { font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-secondary); }
    .trailer-block { margin: 8px 0; }
    .trailer-link-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,0,0,0.08); border: 1px solid rgba(255,0,0,0.3); color: #ff4444; padding: 8px 16px; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; text-decoration: none; transition: all 200ms; letter-spacing: 0.1em; &:hover { background: rgba(255,0,0,0.15); } }
    .trailer-play { font-size: 1rem; }
    .status-badge {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      padding: 6px 14px;
      border-radius: 9999px;
      letter-spacing: 0.08em;
      &.status-active  { background: rgba(37,99,235,0.1); color: var(--neon-green); border: 1px solid rgba(37,99,235,0.25); }
      &.status-inactive{ background: rgba(220,38,38,0.1);  color: var(--neon-red);   border: 1px solid rgba(220,38,38,0.25); }
    }

    /* Showtimes Section */
    .showtimes-section { margin-top: 64px; }

    .section-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 0.9rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: var(--text-primary);
      white-space: nowrap;
    }

    .section-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, rgba(37,99,235,0.3), transparent);
    }

    .showtime-cards {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .showtime-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 16px 20px;
      background: var(--bg-surface);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: var(--transition);
      min-width: 160px;

      &:hover {
        border-color: rgba(37,99,235,0.3);
        background: rgba(37,99,235,0.03);
      }
    }

    .st-date   { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); }
    .st-time   { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--neon-green); }
    .st-theater{ font-family: var(--font-body); font-size: 0.8rem; color: var(--text-secondary); }
    .st-seats  {
      font-family: var(--font-mono); font-size: 0.7rem;
      .seats-ok  { color: var(--neon-green); }
      .seats-full{ color: var(--neon-red); }
    }
    .st-price  { font-family: var(--font-display); font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }

    /* Not found */
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 16px;
      text-align: center;

      .nf-code {
        font-family: var(--font-display);
        font-size: 6rem;
        font-weight: 900;
        color: var(--text-muted);
        opacity: 0.2;
        line-height: 1;
      }

      p {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--text-muted);
        letter-spacing: 0.1em;
      }
    }

    @media (max-width: 768px) {
      .detail-layout { grid-template-columns: 1fr; }
      .poster-col { max-width: 240px; margin: 0 auto; }
    }
  `]
})
export class MovieDetailComponent implements OnInit {
  @Input() id!: string;

  private movieService   = inject(MovieService);
  private showtimeService = inject(ShowtimeService);

  readonly loading   = signal(true);
  readonly movie     = signal<MovieResponse | null>(null);
  readonly showtimes = signal<ShowtimeResponse[]>([]);

  ngOnInit(): void {
    const movieId = Number(this.id);
    this.movieService.getById(movieId).subscribe({
      next: (m: any) => {
        this.movie.set(m);
        this.loading.set(false);
        // Load today's showtimes
        const today = new Date().toISOString().split('T')[0];
        this.showtimeService.getByDate(today).subscribe({
          next: (list: any) => this.showtimes.set(list.filter((s: any) => s.movieId === movieId)),
          error: () => {}
        });
      },
      error: () => this.loading.set(false)
    });
  }
}
