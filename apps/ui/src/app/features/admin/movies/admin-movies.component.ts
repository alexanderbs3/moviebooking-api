import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { GenreService } from '../../../core/services/genre.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { MovieResponse, GenreResponse, AgeRating, MovieStatus } from '../../../core/models/models';

const AGE_RATINGS: AgeRating[] = ['L', '10', '12', '14', '16', '18'];
const LANGUAGES = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano', 'Japonês', 'Coreano'];

@Component({
  selector: 'app-admin-movies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <a routerLink="/admin" class="back-link">← PAINEL ADMIN</a>
        <div class="page-label">// GESTÃO DE FILMES</div>
        <h1 class="page-title">CATÁLOGO <span>ADMIN</span></h1>
      </div>

      <div class="layout">

        <!-- ── Formulário ─────────────────────────────────────────────────── -->
        <aside class="form-panel">
          <div class="form-panel-header">
            <span class="form-icon">{{ editingId() ? '✎' : '+' }}</span>
            <span>{{ editingId() ? 'EDITAR FILME' : 'NOVO FILME' }}</span>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="cyber-form">

            <!-- Título -->
            <div class="field-group">
              <label class="field-label">TÍTULO *</label>
              <input formControlName="title" type="text" class="cyber-input"
                     placeholder="Nome do filme"
                     [class.error]="isInvalid('title')" />
              @if (isInvalid('title')) {
                <span class="field-error">↳ Título obrigatório</span>
              }
            </div>

            <!-- Descrição -->
            <div class="field-group">
              <label class="field-label">DESCRIÇÃO / SINOPSE</label>
              <textarea formControlName="description" class="cyber-input cyber-textarea"
                        placeholder="Sinopse do filme..." rows="3"></textarea>
            </div>

            <!-- Poster + Trailer -->
            <div class="field-group">
              <label class="field-label">URL DO POSTER</label>
              <input formControlName="posterUrl" type="url" class="cyber-input"
                     placeholder="https://cdn.exemplo.com/poster.jpg" />
            </div>
            <div class="field-group">
              <label class="field-label">TRAILER (YouTube / Vimeo)</label>
              <input formControlName="trailerUrl" type="url" class="cyber-input"
                     placeholder="https://www.youtube.com/watch?v=..." />
              @if (form.value.trailerUrl) {
                <a [href]="form.value.trailerUrl" target="_blank" class="preview-link">▶ Pré-visualizar trailer</a>
              }
            </div>

            <!-- Duração + Rating -->
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">DURAÇÃO (MIN) *</label>
                <input formControlName="durationMinutes" type="number" class="cyber-input"
                       placeholder="120" min="1" max="600"
                       [class.error]="isInvalid('durationMinutes')" />
                @if (isInvalid('durationMinutes')) {
                  <span class="field-error">↳ Obrigatório (1–600 min)</span>
                }
              </div>
              <div class="field-group">
                <label class="field-label">RATING (0–10)</label>
                <input formControlName="rating" type="number" step="0.1" min="0" max="10"
                       class="cyber-input" placeholder="8.5" />
              </div>
            </div>

            <!-- Classificação Indicativa + Status -->
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">CLASSIFICAÇÃO *</label>
                <select formControlName="ageRating" class="cyber-select">
                  @for (r of ageRatings; track r) {
                    <option [value]="r">{{ r === 'L' ? 'Livre (L)' : r + ' anos' }}</option>
                  }
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">STATUS *</label>
                <select formControlName="movieStatus" class="cyber-select">
                  <option value="NOW_PLAYING">Em cartaz</option>
                  <option value="COMING_SOON">Em breve</option>
                  <option value="ENDED">Encerrado</option>
                </select>
              </div>
            </div>

            <!-- Diretor + Elenco -->
            <div class="field-group">
              <label class="field-label">DIRETOR</label>
              <input formControlName="director" type="text" class="cyber-input"
                     placeholder="Nome do diretor" />
            </div>
            <div class="field-group">
              <label class="field-label">ELENCO PRINCIPAL</label>
              <input formControlName="castMembers" type="text" class="cyber-input"
                     placeholder="Ator 1, Atriz 2, ..." />
            </div>

            <!-- Idioma + Data de estreia -->
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">IDIOMA</label>
                <select formControlName="language" class="cyber-select">
                  @for (l of languages; track l) {
                    <option [value]="l">{{ l }}</option>
                  }
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">DATA DE ESTREIA</label>
                <input formControlName="releaseDate" type="date" class="cyber-input" />
              </div>
            </div>

            <!-- Gêneros -->
            <div class="field-group">
              <label class="field-label">
                GÊNEROS *
                @if (selectedGenreIds().length === 0) {
                  <span class="field-error"> (selecione ao menos 1)</span>
                }
              </label>
              @if (loadingGenres()) {
                <span class="field-hint">Carregando gêneros...</span>
              } @else {
                <div class="genre-chips">
                  @for (g of genres(); track g.id) {
                    <button type="button" class="genre-chip"
                            [class.active]="isGenreSelected(g.id)"
                            (click)="toggleGenre(g.id)">
                      {{ g.name }}
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Ativo -->
            <div class="field-group">
              <label class="field-label">VISIBILIDADE</label>
              <div class="toggle-row">
                <span>{{ form.value.active ? 'ATIVO (visível no catálogo)' : 'INATIVO (oculto)' }}</span>
                <button type="button" class="toggle-btn" [class.on]="form.value.active"
                        (click)="form.patchValue({ active: !form.value.active })">
                  <span class="toggle-knob"></span>
                </button>
              </div>
            </div>

            <!-- Ações -->
            <div class="form-actions">
              @if (editingId()) {
                <button type="button" class="btn-ghost-sm" (click)="resetForm()">CANCELAR</button>
              }
              <button type="submit" class="btn-primary-sm" [disabled]="saving() || selectedGenreIds().length === 0">
                @if (saving()) { <span class="cyber-spinner small"></span> SALVANDO... }
                @else { {{ editingId() ? 'ATUALIZAR FILME' : 'CADASTRAR FILME' }} }
              </button>
            </div>
          </form>
        </aside>

        <!-- ── Lista de Filmes ─────────────────────────────────────────────── -->
        <main class="list-panel">
          <div class="list-header">
            <span class="list-count">{{ movies().length }} filmes cadastrados</span>
            <div class="status-filters">
              <button class="filter-btn" [class.active]="statusFilter() === 'ALL'"    (click)="statusFilter.set('ALL')">Todos</button>
              <button class="filter-btn" [class.active]="statusFilter() === 'NOW_PLAYING'" (click)="statusFilter.set('NOW_PLAYING')">Em cartaz</button>
              <button class="filter-btn" [class.active]="statusFilter() === 'COMING_SOON'" (click)="statusFilter.set('COMING_SOON')">Em breve</button>
              <button class="filter-btn" [class.active]="statusFilter() === 'ENDED'"   (click)="statusFilter.set('ENDED')">Encerrados</button>
            </div>
          </div>

          @if (loading()) {
            <app-loading />
          } @else if (filteredMovies().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">🎬</div>
              <p>Nenhum filme encontrado</p>
            </div>
          } @else {
            <div class="movie-admin-grid">
              @for (movie of filteredMovies(); track movie.id) {
                <div class="movie-admin-card" [class.inactive]="!movie.active">

                  <div class="card-poster-col">
                    @if (movie.posterUrl) {
                      <img [src]="movie.posterUrl" [alt]="movie.title" class="card-poster" />
                    } @else {
                      <div class="card-poster-placeholder">🎬</div>
                    }
                    <span class="age-badge" [attr.data-rating]="movie.ageRating">{{ movie.ageRating }}</span>
                  </div>

                  <div class="card-info-col">
                    <div class="card-top">
                      <h3 class="card-title">{{ movie.title }}</h3>
                      <div class="card-meta">
                        <span class="status-badge" [class]="'status-' + movie.movieStatus.toLowerCase()">
                          {{ statusLabel(movie.movieStatus) }}
                        </span>
                        @if (!movie.active) {
                          <span class="inactive-badge">INATIVO</span>
                        }
                      </div>
                    </div>

                    <div class="card-details">
                      <span>⏱ {{ movie.durationMinutes }} min</span>
                      @if (movie.director) { <span>🎬 {{ movie.director }}</span> }
                      @if (movie.rating)   { <span>⭐ {{ movie.rating }}/10</span> }
                      @if (movie.trailerUrl) {
                        <a [href]="movie.trailerUrl" target="_blank" class="trailer-link">▶ Trailer</a>
                      }
                    </div>

                    <div class="card-genres">
                      @for (g of movie.genres; track g.id) {
                        <span class="genre-tag">{{ g.name }}</span>
                      }
                    </div>

                    <div class="card-actions">
                      <button class="btn-action edit" (click)="editMovie(movie)">✎ EDITAR</button>
                      <button class="btn-action status-toggle" (click)="openStatusModal(movie)">⟳ STATUS</button>
                      <button class="btn-action delete" (click)="confirmDelete(movie)">✕ REMOVER</button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </main>
      </div>

      <!-- ── Modal de Alteração de Status ──────────────────────────────────── -->
      @if (statusModalMovie()) {
        <div class="modal-overlay" (click)="closeStatusModal()">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <h3 class="modal-title">ALTERAR STATUS</h3>
            <p class="modal-subtitle">{{ statusModalMovie()!.title }}</p>
            <div class="status-options">
              <button class="status-option now-playing"
                      [class.current]="statusModalMovie()!.movieStatus === 'NOW_PLAYING'"
                      (click)="applyStatus('NOW_PLAYING')">
                ▶ EM CARTAZ
              </button>
              <button class="status-option coming-soon"
                      [class.current]="statusModalMovie()!.movieStatus === 'COMING_SOON'"
                      (click)="applyStatus('COMING_SOON')">
                🕐 EM BREVE
              </button>
              <button class="status-option ended"
                      [class.current]="statusModalMovie()!.movieStatus === 'ENDED'"
                      (click)="applyStatus('ENDED')">
                ✕ ENCERRADO
              </button>
            </div>
            <button class="btn-ghost-sm" (click)="closeStatusModal()">CANCELAR</button>
          </div>
        </div>
      }

      <!-- ── Modal de Confirmação de Exclusão ────────────────────────────── -->
      @if (deleteConfirmMovie()) {
        <div class="modal-overlay" (click)="deleteConfirmMovie.set(null)">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <h3 class="modal-title">CONFIRMAR REMOÇÃO</h3>
            <p class="modal-subtitle">
              Deseja desativar o filme<br/>
              <strong>{{ deleteConfirmMovie()!.title }}</strong>?
            </p>
            <p class="modal-warn">O filme ficará oculto do catálogo público.</p>
            <div class="modal-actions">
              <button class="btn-ghost-sm" (click)="deleteConfirmMovie.set(null)">CANCELAR</button>
              <button class="btn-danger-sm" (click)="executeDelete()">CONFIRMAR REMOÇÃO</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 32px; }
    .back-link { font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); text-decoration: none; &:hover { color: var(--neon-green); } }
    .page-label { font-family: var(--font-mono); font-size: 0.7rem; color: var(--neon-green); letter-spacing: 0.15em; margin: 8px 0 4px; }
    .page-title { font-family: var(--font-display); font-size: 2rem; font-weight: 900; letter-spacing: 0.1em; color: var(--text-primary); span { color: var(--neon-green); } }
    .layout { display: grid; grid-template-columns: 380px 1fr; gap: 24px; align-items: start; }
    .form-panel { background: var(--bg-surface); border: 1px solid #1e1e1e; border-radius: var(--radius-lg); position: sticky; top: 24px; }
    .form-panel-header { display: flex; align-items: center; gap: 10px; padding: 16px 20px; border-bottom: 1px solid #1e1e1e; font-family: var(--font-mono); font-size: 0.75rem; color: var(--neon-green); letter-spacing: 0.1em; }
    .form-icon { font-size: 1rem; }
    .cyber-form { padding: 20px; display: flex; flex-direction: column; gap: 14px; max-height: calc(100vh - 200px); overflow-y: auto; }
    .field-group { display: flex; flex-direction: column; gap: 5px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field-label { font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); letter-spacing: 0.08em; }
    .cyber-input, .cyber-select, .cyber-textarea { width: 100%; background: var(--bg-base); border: 1px solid #2a2a2a; border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary); font-size: 0.82rem; transition: border-color 200ms; outline: none; box-sizing: border-box; &:focus { border-color: var(--neon-green); } &.error { border-color: var(--neon-red); } }
    .cyber-textarea { resize: vertical; min-height: 80px; }
    .cyber-select option { background: var(--bg-surface); }
    .field-error { font-family: var(--font-mono); font-size: 0.65rem; color: var(--neon-red); }
    .field-hint { font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); }
    .preview-link { font-family: var(--font-mono); font-size: 0.65rem; color: var(--neon-green); text-decoration: none; }
    .genre-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .genre-chip { padding: 4px 10px; border-radius: 20px; border: 1px solid #333; background: transparent; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.65rem; cursor: pointer; transition: all 200ms; &.active { background: var(--neon-green); border-color: var(--neon-green); color: #ffffff; font-weight: 700; } &:hover:not(.active) { border-color: var(--neon-green); color: var(--neon-green); } }
    .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; }
    .toggle-btn { width: 40px; height: 22px; border-radius: 11px; border: 1px solid #333; background: #1a1a1a; cursor: pointer; position: relative; transition: all 200ms; &.on { background: var(--neon-green); border-color: var(--neon-green); } }
    .toggle-knob { position: absolute; width: 16px; height: 16px; background: #fff; border-radius: 50%; top: 2px; left: 2px; transition: left 200ms; .on & { left: calc(100% - 18px); } }
    .form-actions { display: flex; gap: 8px; padding-top: 8px; }
    .btn-primary-sm { flex: 1; padding: 10px; background: var(--neon-green); color: #ffffff; border: none; border-radius: var(--radius-md); font-family: var(--font-display); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; &:disabled { opacity: 0.5; cursor: not-allowed; } &:hover:not(:disabled) { background: #1d4ed8; } }
    .btn-ghost-sm { padding: 10px 16px; background: transparent; border: 1px solid #333; color: var(--text-muted); border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.7rem; cursor: pointer; &:hover { border-color: var(--text-muted); color: var(--text-primary); } }
    .cyber-spinner { width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.3); border-top-color: #ffffff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .list-panel { display: flex; flex-direction: column; gap: 16px; }
    .list-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .list-count { font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); }
    .status-filters { display: flex; gap: 6px; flex-wrap: wrap; }
    .filter-btn { padding: 5px 12px; border-radius: 20px; border: 1px solid #333; background: transparent; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.65rem; cursor: pointer; transition: all 200ms; &.active { border-color: var(--neon-green); color: var(--neon-green); } &:hover { border-color: var(--text-muted); } }
    .movie-admin-grid { display: flex; flex-direction: column; gap: 12px; }
    .movie-admin-card { display: flex; gap: 16px; background: var(--bg-surface); border: 1px solid #1e1e1e; border-radius: var(--radius-lg); padding: 16px; transition: border-color 200ms; &:hover { border-color: #333; } &.inactive { opacity: 0.55; } }
    .card-poster-col { position: relative; flex-shrink: 0; }
    .card-poster { width: 70px; height: 100px; object-fit: cover; border-radius: var(--radius-md); }
    .card-poster-placeholder { width: 70px; height: 100px; background: #1a1a1a; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .age-badge { position: absolute; top: -4px; right: -4px; background: var(--bg-base); border: 1px solid #333; border-radius: 4px; font-family: var(--font-mono); font-size: 0.55rem; font-weight: 700; color: var(--text-muted); padding: 1px 4px; }
    .card-info-col { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
    .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .card-title { font-family: var(--font-display); font-size: 0.9rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .card-meta { display: flex; gap: 6px; flex-shrink: 0; }
    .status-badge { font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; &.status-now_playing { background: rgba(37,99,235,0.12); color: var(--neon-green); border: 1px solid rgba(37,99,235,0.3); } &.status-coming_soon { background: rgba(255,200,0,0.12); color: #b45309; border: 1px solid rgba(255,200,0,0.3); } &.status-ended { background: rgba(255,255,255,0.06); color: var(--text-muted); border: 1px solid #2a2a2a; } }
    .inactive-badge { font-family: var(--font-mono); font-size: 0.6rem; padding: 2px 8px; border-radius: 20px; background: rgba(220,38,38,0.1); color: var(--neon-red); border: 1px solid rgba(220,38,38,0.3); }
    .card-details { display: flex; gap: 12px; flex-wrap: wrap; font-family: var(--font-mono); font-size: 0.68rem; color: var(--text-muted); }
    .trailer-link { color: var(--neon-green); text-decoration: none; &:hover { text-shadow: var(--neon-green-glow); } }
    .card-genres { display: flex; gap: 6px; flex-wrap: wrap; }
    .genre-tag { font-family: var(--font-mono); font-size: 0.6rem; color: var(--text-muted); border: 1px solid #2a2a2a; border-radius: 20px; padding: 1px 8px; }
    .card-actions { display: flex; gap: 6px; margin-top: auto; flex-wrap: wrap; }
    .btn-action { padding: 5px 10px; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.62rem; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 150ms; &.edit { border-color: #333; color: var(--text-muted); background: transparent; &:hover { border-color: var(--neon-green); color: var(--neon-green); } } &.status-toggle { border-color: #333; color: var(--text-muted); background: transparent; &:hover { border-color: #b45309; color: #b45309; } } &.delete { border-color: rgba(220,38,38,0.3); color: var(--neon-red); background: transparent; &:hover { background: rgba(220,38,38,0.08); } } }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.8rem; .empty-icon { font-size: 2.5rem; margin-bottom: 12px; } }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(4px); }
    .modal-box { background: var(--bg-surface); border: 1px solid #333; border-radius: var(--radius-lg); padding: 32px; max-width: 400px; width: 90%; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .modal-title { font-family: var(--font-display); font-size: 1rem; font-weight: 800; letter-spacing: 0.1em; color: var(--text-primary); }
    .modal-subtitle { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); text-align: center; }
    .modal-warn { font-family: var(--font-mono); font-size: 0.72rem; color: var(--neon-red); }
    .modal-actions { display: flex; gap: 12px; width: 100%; }
    .status-options { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    .status-option { padding: 12px 20px; border-radius: var(--radius-md); border: 1px solid #333; background: transparent; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 150ms; text-align: center; &.now-playing { &:hover, &.current { background: rgba(37,99,235,0.12); border-color: var(--neon-green); color: var(--neon-green); } } &.coming-soon { &:hover, &.current { background: rgba(255,200,0,0.12); border-color: #b45309; color: #b45309; } } &.ended { &:hover, &.current { background: rgba(255,255,255,0.06); border-color: var(--text-muted); color: var(--text-primary); } } }
    .btn-danger-sm { flex: 1; padding: 10px; background: var(--neon-red); color: #fff; border: none; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; cursor: pointer; &:hover { filter: brightness(1.2); } }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .form-panel { position: static; } }
  `]
})
export class AdminMoviesComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(MovieService);
  private genreSvc = inject(GenreService);
  private toast  = inject(ToastService);

  readonly ageRatings = AGE_RATINGS;
  readonly languages  = LANGUAGES;

  movies         = signal<MovieResponse[]>([]);
  genres         = signal<GenreResponse[]>([]);
  loading        = signal(true);
  loadingGenres  = signal(true);
  saving         = signal(false);
  editingId      = signal<number | null>(null);
  statusFilter   = signal<string>('ALL');
  statusModalMovie   = signal<MovieResponse | null>(null);
  deleteConfirmMovie = signal<MovieResponse | null>(null);

  selectedGenreIds = signal<number[]>([]);

  filteredMovies = computed(() => {
    const f = this.statusFilter();
    return f === 'ALL' ? this.movies() : this.movies().filter(m => m.movieStatus === f);
  });

  form = this.fb.group({
    title:           ['', Validators.required],
    description:     [''],
    posterUrl:       [''],
    trailerUrl:      [''],
    durationMinutes: [null as number | null, [Validators.required, Validators.min(1)]],
    releaseDate:     [''],
    rating:          [null as number | null],
    ageRating:       ['L' as AgeRating],
    movieStatus:     ['NOW_PLAYING' as MovieStatus],
    director:        [''],
    castMembers:     [''],
    language:        ['Português'],
    active:          [true]
  });

  ngOnInit() {
    this.loadMovies();
    this.loadGenres();
  }

  loadMovies() {
    this.loading.set(true);
    this.svc.adminGetAll().subscribe({
      next: m => { this.movies.set(m); this.loading.set(false); },
      error: () => { this.toast.error('Erro ao carregar filmes'); this.loading.set(false); }
    });
  }

  loadGenres() {
    this.loadingGenres.set(true);
    this.genreSvc.getAll().subscribe({
      next: g => { this.genres.set(g); this.loadingGenres.set(false); },
      error: () => this.loadingGenres.set(false)
    });
  }

  isInvalid(f: string) {
    const c = this.form.get(f);
    return c?.invalid && c?.touched;
  }

  isGenreSelected(id: number) { return this.selectedGenreIds().includes(id); }

  toggleGenre(id: number) {
    const cur = this.selectedGenreIds();
    this.selectedGenreIds.set(cur.includes(id) ? cur.filter(g => g !== id) : [...cur, id]);
  }

  editMovie(movie: MovieResponse) {
    this.editingId.set(movie.id);
    this.selectedGenreIds.set(movie.genres.map(g => g.id));
    this.form.patchValue({
      title:           movie.title,
      description:     movie.description ?? '',
      posterUrl:       movie.posterUrl ?? '',
      trailerUrl:      movie.trailerUrl ?? '',
      durationMinutes: movie.durationMinutes,
      releaseDate:     movie.releaseDate ?? '',
      rating:          movie.rating ?? null,
      ageRating:       movie.ageRating as AgeRating,
      movieStatus:     movie.movieStatus as MovieStatus,
      director:        movie.director ?? '',
      castMembers:     movie.castMembers ?? '',
      language:        movie.language ?? 'Português',
      active:          movie.active
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.editingId.set(null);
    this.selectedGenreIds.set([]);
    this.form.reset({ ageRating: 'L', movieStatus: 'NOW_PLAYING', language: 'Português', active: true });
    this.form.markAsUntouched();
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.selectedGenreIds().length === 0) return;
    this.saving.set(true);

    const payload = {
      ...this.form.value,
      durationMinutes: Number(this.form.value.durationMinutes),
      rating:          this.form.value.rating ? Number(this.form.value.rating) : undefined,
      releaseDate:     this.form.value.releaseDate || undefined,
      trailerUrl:      this.form.value.trailerUrl || undefined,
      posterUrl:       this.form.value.posterUrl  || undefined,
      director:        this.form.value.director   || undefined,
      castMembers:     this.form.value.castMembers|| undefined,
      genreIds:        this.selectedGenreIds(),
      ageRating:       (this.form.value.ageRating ?? 'L') as AgeRating,
      movieStatus:     (this.form.value.movieStatus ?? 'NOW_PLAYING') as MovieStatus,
      active:          this.form.value.active ?? true
    } as any;

    const op = this.editingId()
      ? this.svc.update(this.editingId()!, payload)
      : this.svc.create(payload);

    op.subscribe({
      next: () => {
        this.toast.success(this.editingId() ? 'Filme atualizado!' : 'Filme cadastrado!');
        this.resetForm();
        this.loadMovies();
        this.saving.set(false);
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'Erro ao salvar filme');
        this.saving.set(false);
      }
    });
  }

  openStatusModal(movie: MovieResponse)  { this.statusModalMovie.set(movie); }
  closeStatusModal()                     { this.statusModalMovie.set(null); }

  applyStatus(status: MovieStatus) {
    const movie = this.statusModalMovie();
    if (!movie) return;
    this.svc.changeStatus(movie.id, status).subscribe({
      next: () => { this.toast.success('Status alterado!'); this.closeStatusModal(); this.loadMovies(); },
      error: (e: any) => this.toast.error(e.error?.message || 'Erro ao alterar status')
    });
  }

  confirmDelete(movie: MovieResponse) { this.deleteConfirmMovie.set(movie); }

  executeDelete() {
    const movie = this.deleteConfirmMovie();
    if (!movie) return;
    this.svc.delete(movie.id).subscribe({
      next: () => { this.toast.success('Filme removido do catálogo!'); this.deleteConfirmMovie.set(null); this.loadMovies(); },
      error: (e: any) => this.toast.error(e.error?.message || 'Erro ao remover filme')
    });
  }

  statusLabel(s: MovieStatus): string {
    return { NOW_PLAYING: 'EM CARTAZ', COMING_SOON: 'EM BREVE', ENDED: 'ENCERRADO' }[s] ?? s;
  }
}
