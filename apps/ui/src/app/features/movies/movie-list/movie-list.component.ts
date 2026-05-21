import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../../core/services/movie.service';
import { MovieResponse } from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LoadingComponent],
  template: `
    <div class="page-container movie-page">
      <section class="hero">
        <div class="hero-copy">
          <div class="hero-label">Operação de bilheteria</div>
          <h1 class="hero-title">Catálogo de filmes</h1>
          <p class="hero-sub">
            Explore títulos em cartaz, acompanhe status e avance rapidamente para sessões disponíveis.
          </p>
        </div>

        <div class="hero-panel">
          <div class="metric">
            <span class="metric-label">Títulos</span>
            <strong>{{ movies().length }}</strong>
          </div>
          <div class="metric">
            <span class="metric-label">Exibindo</span>
            <strong>{{ filteredMovies().length }}</strong>
          </div>
          <div class="metric">
            <span class="metric-label">Em cartaz</span>
            <strong>{{ nowPlayingCount() }}</strong>
          </div>
        </div>
      </section>

      <section class="catalog-toolbar">
        <div class="search-bar">
          <span class="search-icon">⌕</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="filterMovies()"
            class="search-input"
            placeholder="Buscar por título ou gênero"
          />
          @if (searchQuery) {
            <button class="search-clear" type="button" (click)="clearSearch()">Limpar</button>
          }
        </div>
        <a routerLink="/showtimes" class="toolbar-action">Ver sessões -></a>
      </section>

      @if (loading()) {
        <app-loading message="Carregando catálogo..." [fullPage]="true" />
      }

      @if (!loading()) {
        @if (filteredMovies().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">⌕</div>
            <p class="empty-title">Nenhum filme encontrado</p>
            <p class="empty-sub">Ajuste a busca ou limpe o filtro para ver o catálogo completo.</p>
          </div>
        } @else {
          <div class="movie-grid">
            @for (movie of filteredMovies(); track movie.id) {
              <article class="movie-card" [routerLink]="['/movies', movie.id]">
                <div class="card-poster">
                  @if (movie.posterUrl) {
                    <img [src]="movie.posterUrl" [alt]="movie.title" loading="lazy" />
                  } @else {
                    <div class="poster-placeholder">
                      <span class="poster-icon">CV</span>
                      <span class="poster-text">Sem pôster</span>
                    </div>
                  }

                  <div class="poster-gradient"></div>

                  @if (movie.rating) {
                    <div class="rating-badge">
                      <span>★</span>
                      <strong>{{ movie.rating | number:'1.1-1' }}</strong>
                    </div>
                  }

                  @if (movie.ageRating) {
                    <div class="age-badge-card">{{ movie.ageRating }}</div>
                  }
                </div>

                <div class="card-info">
                  <div class="card-topline">
                    <span class="status-pill" [class.soon]="movie.movieStatus === 'COMING_SOON'" [class.ended]="movie.movieStatus === 'ENDED'">
                      {{ statusLabel(movie.movieStatus) }}
                    </span>
                    <span class="duration">{{ movie.durationMinutes }} min</span>
                  </div>

                  <h2 class="card-title">{{ movie.title }}</h2>

                  <div class="card-genres">
                    @for (g of movie.genres.slice(0,2); track g.id) {
                      <span class="badge badge-green">{{ g.name }}</span>
                    }
                  </div>

                  <div class="card-meta">
                    <span>{{ movie.releaseDate | date:'yyyy' }}</span>
                    @if (movie.director) {
                      <span>{{ movie.director }}</span>
                    }
                  </div>
                </div>

                @if (!movie.active) {
                  <div class="inactive-ribbon">Inativo</div>
                }
              </article>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .movie-page {
      padding-bottom: 72px;
    }

    .hero {
      align-items: flex-end;
      display: grid;
      gap: 32px;
      grid-template-columns: minmax(0, 1fr) minmax(320px, 440px);
      padding: 54px 0 28px;
    }

    .hero-copy {
      max-width: 720px;
    }

    .hero-title {
      color: var(--text-primary);
      font-size: clamp(2.35rem, 6vw, 4.9rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-top: 12px;
    }

    .hero-sub {
      color: var(--text-secondary);
      font-size: 1.08rem;
      max-width: 560px;
      margin-top: 16px;
    }

    .hero-panel {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      overflow: hidden;
    }

    .metric {
      padding: 20px;

      & + .metric {
        border-left: 1px solid var(--border-dim);
      }

      strong {
        color: var(--text-primary);
        display: block;
        font-size: 1.8rem;
        font-weight: 800;
        line-height: 1;
        margin-top: 8px;
      }
    }

    .metric-label {
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .catalog-toolbar {
      align-items: center;
      background: rgba(255, 255, 255, 0.86);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      display: flex;
      gap: 16px;
      justify-content: space-between;
      margin-bottom: 24px;
      padding: 10px;
    }

    .search-bar {
      align-items: center;
      display: flex;
      flex: 1;
      gap: 10px;
      min-width: 0;
      padding: 0 10px;
    }

    .search-icon {
      color: var(--text-muted);
      font-size: 1.15rem;
    }

    .search-input {
      background: transparent;
      border: 0;
      color: var(--text-primary);
      flex: 1;
      font-size: 0.98rem;
      min-height: 42px;
      min-width: 0;
      outline: none;

      &::placeholder {
        color: var(--text-muted);
      }
    }

    .search-clear,
    .toolbar-action {
      align-items: center;
      background: #f8fafc;
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      cursor: pointer;
      display: inline-flex;
      flex: 0 0 auto;
      font-size: 0.86rem;
      font-weight: 800;
      min-height: 40px;
      padding: 9px 13px;
      white-space: nowrap;
    }

    .search-clear:hover,
    .toolbar-action:hover {
      border-color: var(--border-neon);
      color: var(--neon-green);
    }

    .movie-grid {
      display: grid;
      gap: 22px;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    }

    .movie-card {
      background: #ffffff;
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      overflow: hidden;
      position: relative;
      transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);

      &:hover {
        border-color: var(--border-neon);
        box-shadow: var(--shadow-lg);
        transform: translateY(-4px);

        img { transform: scale(1.035); }
        .card-title { color: var(--neon-green); }
      }
    }

    .card-poster {
      aspect-ratio: 2 / 3;
      background: #e2e8f0;
      overflow: hidden;
      position: relative;

      img {
        height: 100%;
        object-fit: cover;
        transition: transform 420ms ease;
        width: 100%;
      }
    }

    .poster-gradient {
      background: linear-gradient(to top, rgba(15, 23, 42, 0.48), transparent 48%);
      inset: 0;
      pointer-events: none;
      position: absolute;
    }

    .poster-placeholder {
      align-items: center;
      background: linear-gradient(145deg, #dbeafe, #f8fafc);
      color: var(--text-secondary);
      display: flex;
      flex-direction: column;
      gap: 10px;
      height: 100%;
      justify-content: center;
    }

    .poster-icon {
      align-items: center;
      background: #111827;
      border-radius: 8px;
      color: #ffffff;
      display: flex;
      font-weight: 800;
      height: 52px;
      justify-content: center;
      width: 52px;
    }

    .poster-text {
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 700;
    }

    .rating-badge,
    .age-badge-card {
      align-items: center;
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.58);
      border-radius: 999px;
      color: var(--text-primary);
      display: inline-flex;
      font-size: 0.82rem;
      font-weight: 800;
      gap: 5px;
      min-height: 30px;
      padding: 5px 10px;
      position: absolute;
      top: 12px;
    }

    .rating-badge {
      right: 12px;

      span { color: var(--accent-amber); }
    }

    .age-badge-card {
      left: 12px;
    }

    .card-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-height: 188px;
      padding: 16px;
    }

    .card-topline,
    .card-meta {
      align-items: center;
      display: flex;
      gap: 10px;
      justify-content: space-between;
    }

    .status-pill {
      background: #ecfdf5;
      border: 1px solid rgba(22, 163, 74, 0.18);
      border-radius: 999px;
      color: #15803d;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 4px 9px;

      &.soon {
        background: #fffbeb;
        border-color: rgba(245, 158, 11, 0.22);
        color: #b45309;
      }

      &.ended {
        background: #f1f5f9;
        border-color: var(--border-dim);
        color: var(--text-secondary);
      }
    }

    .duration {
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 600;
    }

    .card-title {
      color: var(--text-primary);
      display: -webkit-box;
      font-size: 1.12rem;
      font-weight: 800;
      line-height: 1.18;
      min-height: 2.64rem;
      overflow: hidden;
      transition: color var(--transition);
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    .card-genres {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .card-meta {
      border-top: 1px solid var(--border-dim);
      color: var(--text-muted);
      font-size: 0.84rem;
      margin-top: auto;
      padding-top: 12px;

      span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .inactive-ribbon {
      background: var(--neon-red);
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 5px 34px;
      position: absolute;
      right: -34px;
      top: 18px;
      transform: rotate(38deg);
    }

    .empty-state {
      align-items: center;
      background: rgba(255, 255, 255, 0.78);
      border: 1px dashed var(--border-dim);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: 10px;
      justify-content: center;
      min-height: 320px;
      padding: 48px 24px;
      text-align: center;
    }

    .empty-icon {
      align-items: center;
      background: #f1f5f9;
      border-radius: 999px;
      color: var(--text-muted);
      display: flex;
      font-size: 1.6rem;
      height: 64px;
      justify-content: center;
      width: 64px;
    }

    .empty-title {
      color: var(--text-primary);
      font-size: 1.1rem;
      font-weight: 800;
    }

    .empty-sub {
      color: var(--text-secondary);
      max-width: 420px;
    }

    @media (max-width: 900px) {
      .hero {
        align-items: stretch;
        grid-template-columns: 1fr;
        padding-top: 36px;
      }
    }

    @media (max-width: 640px) {
      .catalog-toolbar {
        align-items: stretch;
        flex-direction: column;
      }

      .hero-panel {
        grid-template-columns: 1fr;
      }

      .metric + .metric {
        border-left: 0;
        border-top: 1px solid var(--border-dim);
      }

      .movie-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      }

      .card-info {
        min-height: 0;
      }
    }
  `]
})
export class MovieListComponent implements OnInit {
  private movieService = inject(MovieService);

  readonly loading = signal(true);
  readonly movies = signal<MovieResponse[]>([]);
  readonly filteredMovies = signal<MovieResponse[]>([]);
  searchQuery = '';

  ngOnInit(): void {
    this.movieService.getAll().subscribe({
      next: (data: any) => {
        this.movies.set(data);
        this.filteredMovies.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  nowPlayingCount(): number {
    return this.movies().filter(movie => movie.movieStatus === 'NOW_PLAYING').length;
  }

  statusLabel(status: MovieResponse['movieStatus']): string {
    const labels: Record<MovieResponse['movieStatus'], string> = {
      NOW_PLAYING: 'Em cartaz',
      COMING_SOON: 'Em breve',
      ENDED: 'Encerrado'
    };

    return labels[status];
  }

  filterMovies(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredMovies.set(this.movies());
      return;
    }
    this.filteredMovies.set(
      this.movies().filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.genres?.some(g => g.name.toLowerCase().includes(q))
      )
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filterMovies();
  }
}
