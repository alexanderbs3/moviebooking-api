import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ShowtimeService } from '../../../core/services/showtime.service';
import { MovieService }    from '../../../core/services/movie.service';
import { TheaterService }  from '../../../core/services/theater.service';
import { ToastService }    from '../../../core/services/toast.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { MovieResponse, TheaterResponse, ShowtimeResponse } from '../../../core/models/models';

@Component({
  selector: 'app-admin-showtimes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, LoadingComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <a routerLink="/admin" class="back-link">← PAINEL ADMIN</a>
        <div class="page-label">// GESTÃO DE SESSÕES</div>
        <h1 class="page-title">SESSÕES <span>ADMIN</span></h1>
      </div>

      <div class="layout">

        <!-- ── Formulário ──────────────────────────────────────────────────── -->
        <aside class="form-panel">
          <div class="form-panel-header">
            <span class="form-icon">{{ editingId() ? '✎' : '+' }}</span>
            <span>{{ editingId() ? 'EDITAR SESSÃO' : 'NOVA SESSÃO' }}</span>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="cyber-form">

            <!-- Filme -->
            <div class="field-group">
              <label class="field-label">FILME *</label>
              @if (loadingMovies()) {
                <div class="cyber-input" style="color:var(--text-muted);font-size:0.75rem">Carregando filmes...</div>
              } @else {
                <select formControlName="movieId" class="cyber-select"
                        [class.error]="isInvalid('movieId')">
                  <option value="">— Selecione um filme —</option>
                  @for (m of movies(); track m.id) {
                    <option [value]="m.id">{{ m.title }}</option>
                  }
                </select>
                @if (isInvalid('movieId')) { <span class="field-error">↳ Selecione um filme</span> }
              }
            </div>

            <!-- Preview do filme selecionado -->
            @if (selectedMovie()) {
              <div class="movie-preview">
                @if (selectedMovie()!.posterUrl) {
                  <img [src]="selectedMovie()!.posterUrl" class="preview-poster" />
                }
                <div class="preview-info">
                  <span class="preview-title">{{ selectedMovie()!.title }}</span>
                  <span class="preview-dur">⏱ {{ selectedMovie()!.durationMinutes }} min</span>
                  <span class="preview-age">{{ selectedMovie()!.ageRating }}</span>
                </div>
              </div>
            }

            <!-- Sala -->
            <div class="field-group">
              <label class="field-label">SALA *</label>
              @if (loadingTheaters()) {
                <div class="cyber-input" style="color:var(--text-muted);font-size:0.75rem">Carregando salas...</div>
              } @else {
                <select formControlName="theaterId" class="cyber-select"
                        [class.error]="isInvalid('theaterId')">
                  <option value="">— Selecione uma sala —</option>
                  @for (t of theaters(); track t.id) {
                    <option [value]="t.id">{{ t.name }} ({{ t.totalSeats }} lugares)</option>
                  }
                </select>
                @if (isInvalid('theaterId')) { <span class="field-error">↳ Selecione uma sala</span> }
              }
            </div>

            <!-- Preview da sala selecionada -->
            @if (selectedTheater()) {
              <div class="theater-preview">
                <span class="preview-label">📍 {{ selectedTheater()!.location }}</span>
                <span class="preview-label">🪑 {{ selectedTheater()!.totalSeats }} assentos</span>
              </div>
            }

            <!-- Data + Horário -->
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">DATA *</label>
                <input formControlName="showDate" type="date" class="cyber-input"
                       [min]="today" [class.error]="isInvalid('showDate')" />
                @if (isInvalid('showDate')) { <span class="field-error">↳ Data obrigatória</span> }
              </div>
              <div class="field-group">
                <label class="field-label">HORÁRIO *</label>
                <input formControlName="showTime" type="time" class="cyber-input"
                       step="300" [class.error]="isInvalid('showTime')" />
                @if (isInvalid('showTime')) { <span class="field-error">↳ Horário obrigatório</span> }
              </div>
            </div>

            <!-- Cálculo de término estimado -->
            @if (estimatedEnd()) {
              <div class="estimate-box">
                <span class="estimate-label">Término estimado:</span>
                <span class="estimate-time">{{ estimatedEnd() }}</span>
                <span class="estimate-hint">(+ 20 min de intervalo)</span>
              </div>
            }

            <!-- Preço -->
            <div class="field-group">
              <label class="field-label">PREÇO (R$) *</label>
              <div class="price-input-wrap">
                <span class="price-prefix">R$</span>
                <input formControlName="price" type="number" step="0.50" min="0"
                       class="cyber-input price-input"
                       placeholder="0,00" [class.error]="isInvalid('price')" />
              </div>
              @if (isInvalid('price')) { <span class="field-error">↳ Preço deve ser maior que zero</span> }
            </div>

            <!-- Status -->
            <div class="field-group">
              <label class="field-label">STATUS</label>
              <div class="toggle-row">
                <span>{{ form.value.active ? 'ATIVA (visível)' : 'INATIVA (oculta)' }}</span>
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
              <button type="submit" class="btn-primary-sm" [disabled]="saving()">
                @if (saving()) { <span class="cyber-spinner small"></span> SALVANDO... }
                @else { {{ editingId() ? 'ATUALIZAR SESSÃO' : 'CRIAR SESSÃO' }} }
              </button>
            </div>
          </form>
        </aside>

        <!-- ── Lista de Sessões ──────────────────────────────────────────── -->
        <main class="list-panel">

          <!-- Filtros -->
          <div class="list-header">
            <span class="list-count">{{ filteredShowtimes().length }} sessões</span>
            <div class="filter-row">
              <input [(ngModel)]="searchDate" type="date" class="cyber-input date-filter"
                     placeholder="Filtrar por data" />
              <select [(ngModel)]="searchMovieId" class="cyber-select movie-filter">
                <option value="">Todos os filmes</option>
                @for (m of movies(); track m.id) {
                  <option [value]="m.id">{{ m.title }}</option>
                }
              </select>
              <button class="btn-ghost-sm" (click)="clearFilters()">LIMPAR</button>
            </div>
          </div>

          @if (loading()) {
            <app-loading />
          } @else if (filteredShowtimes().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">🎟️</div>
              <p>Nenhuma sessão encontrada</p>
              <small>Crie a primeira sessão pelo formulário ao lado</small>
            </div>
          } @else {
            <div class="showtime-list">
              @for (s of filteredShowtimes(); track s.id) {
                <div class="showtime-card" [class.inactive]="!s.active">

                  <!-- Data/Hora -->
                  <div class="st-date-col">
                    <span class="st-date">{{ formatDate(s.showDate) }}</span>
                    <span class="st-time">{{ formatTime(s.showTime) }}</span>
                    <span class="st-day">{{ dayOfWeek(s.showDate) }}</span>
                  </div>

                  <!-- Separador -->
                  <div class="st-divider"></div>

                  <!-- Filme + Sala -->
                  <div class="st-info-col">
                    <div class="st-movie">
                      @if (s.moviePosterUrl) {
                        <img [src]="s.moviePosterUrl" class="st-poster" />
                      }
                      <div>
                        <div class="st-title">{{ s.movieTitle }}</div>
                        <div class="st-meta">
                          <span>⏱ {{ s.movieDurationMinutes }} min</span>
                          <span>📍 {{ s.theaterName }}</span>
                          <span>🪑 {{ s.availableSeats }}/{{ s.totalSeats }} disponíveis</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Preço + Status + Ações -->
                  <div class="st-actions-col">
                    <span class="st-price">R$ {{ s.price | number:'1.2-2' }}</span>
                    <span class="status-dot" [class.active-dot]="s.active">
                      {{ s.active ? 'ATIVA' : 'INATIVA' }}
                    </span>
                    <div class="action-btns">
                      <button class="btn-action edit" (click)="editShowtime(s)">✎</button>
                      <button class="btn-action delete" (click)="confirmDelete(s)">✕</button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </main>
      </div>

      <!-- ── Modal de Confirmação ────────────────────────────────────────── -->
      @if (deleteTarget()) {
        <div class="modal-overlay" (click)="deleteTarget.set(null)">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <h3 class="modal-title">REMOVER SESSÃO</h3>
            <p class="modal-subtitle">
              {{ deleteTarget()!.movieTitle }}<br/>
              {{ formatDate(deleteTarget()!.showDate) }} às {{ formatTime(deleteTarget()!.showTime) }}<br/>
              {{ deleteTarget()!.theaterName }}
            </p>
            <p class="modal-warn">Esta sessão ficará indisponível para reservas.</p>
            <div class="modal-actions">
              <button class="btn-ghost-sm" (click)="deleteTarget.set(null)">CANCELAR</button>
              <button class="btn-danger-sm" (click)="executeDelete()">CONFIRMAR</button>
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
    .layout { display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: start; }
    .form-panel { background: var(--bg-surface); border: 1px solid #1e1e1e; border-radius: var(--radius-lg); position: sticky; top: 24px; }
    .form-panel-header { display: flex; align-items: center; gap: 10px; padding: 16px 20px; border-bottom: 1px solid #1e1e1e; font-family: var(--font-mono); font-size: 0.75rem; color: var(--neon-green); letter-spacing: 0.1em; }
    .cyber-form { padding: 20px; display: flex; flex-direction: column; gap: 14px; max-height: calc(100vh - 200px); overflow-y: auto; }
    .field-group { display: flex; flex-direction: column; gap: 5px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field-label { font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); letter-spacing: 0.08em; }
    .cyber-input, .cyber-select { background: var(--bg-base); border: 1px solid #2a2a2a; border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary); font-size: 0.82rem; transition: border-color 200ms; outline: none; width: 100%; box-sizing: border-box; &:focus { border-color: var(--neon-green); } &.error { border-color: var(--neon-red); } }
    .cyber-select option { background: var(--bg-surface); }
    .field-error { font-family: var(--font-mono); font-size: 0.65rem; color: var(--neon-red); }
    .movie-preview { display: flex; gap: 10px; align-items: center; background: rgba(37,99,235,0.04); border: 1px solid rgba(37,99,235,0.15); border-radius: var(--radius-md); padding: 10px 12px; }
    .preview-poster { width: 36px; height: 52px; object-fit: cover; border-radius: 4px; }
    .preview-info { display: flex; flex-direction: column; gap: 3px; }
    .preview-title { font-family: var(--font-display); font-size: 0.78rem; font-weight: 700; color: var(--text-primary); }
    .preview-dur, .preview-age { font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); }
    .theater-preview { display: flex; gap: 16px; font-family: var(--font-mono); font-size: 0.68rem; color: var(--text-muted); background: #0a0a0a; border-radius: var(--radius-md); padding: 8px 12px; }
    .estimate-box { background: rgba(255,200,0,0.06); border: 1px solid rgba(255,200,0,0.2); border-radius: var(--radius-md); padding: 8px 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .estimate-label { font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); }
    .estimate-time { font-family: var(--font-display); font-size: 0.85rem; font-weight: 700; color: #b45309; }
    .estimate-hint { font-family: var(--font-mono); font-size: 0.6rem; color: var(--text-muted); }
    .price-input-wrap { position: relative; }
    .price-prefix { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); pointer-events: none; }
    .price-input { padding-left: 32px !important; }
    .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted); }
    .toggle-btn { width: 40px; height: 22px; border-radius: 11px; border: 1px solid #333; background: #1a1a1a; cursor: pointer; position: relative; transition: all 200ms; &.on { background: var(--neon-green); border-color: var(--neon-green); } }
    .toggle-knob { position: absolute; width: 16px; height: 16px; background: #fff; border-radius: 50%; top: 2px; left: 2px; transition: left 200ms; .on & { left: calc(100% - 18px); } }
    .form-actions { display: flex; gap: 8px; padding-top: 8px; }
    .btn-primary-sm { flex: 1; padding: 10px; background: var(--neon-green); color: #ffffff; border: none; border-radius: var(--radius-md); font-family: var(--font-display); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; &:disabled { opacity: 0.5; cursor: not-allowed; } &:hover:not(:disabled) { background: #1d4ed8; } }
    .btn-ghost-sm { padding: 10px 16px; background: transparent; border: 1px solid #333; color: var(--text-muted); border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.7rem; cursor: pointer; &:hover { border-color: var(--text-muted); color: var(--text-primary); } }
    .cyber-spinner { width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.3); border-top-color: #ffffff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .list-panel { display: flex; flex-direction: column; gap: 16px; }
    .list-header { display: flex; flex-direction: column; gap: 10px; }
    .list-count { font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); }
    .filter-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .date-filter { max-width: 160px; }
    .movie-filter { flex: 1; min-width: 160px; }
    .showtime-list { display: flex; flex-direction: column; gap: 10px; }
    .showtime-card { display: flex; align-items: center; gap: 16px; background: var(--bg-surface); border: 1px solid #1e1e1e; border-radius: var(--radius-lg); padding: 14px 16px; transition: border-color 200ms; &:hover { border-color: #2a2a2a; } &.inactive { opacity: 0.5; } }
    .st-date-col { text-align: center; min-width: 64px; flex-shrink: 0; }
    .st-date { display: block; font-family: var(--font-display); font-size: 0.85rem; font-weight: 800; color: var(--text-primary); }
    .st-time { display: block; font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: var(--neon-green); }
    .st-day { display: block; font-family: var(--font-mono); font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }
    .st-divider { width: 1px; height: 48px; background: #1e1e1e; flex-shrink: 0; }
    .st-info-col { flex: 1; min-width: 0; }
    .st-movie { display: flex; gap: 10px; align-items: center; }
    .st-poster { width: 32px; height: 46px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
    .st-title { font-family: var(--font-display); font-size: 0.85rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px; }
    .st-meta { display: flex; gap: 12px; flex-wrap: wrap; font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); margin-top: 4px; }
    .st-actions-col { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
    .st-price { font-family: var(--font-display); font-size: 0.9rem; font-weight: 800; color: var(--neon-green); }
    .status-dot { font-family: var(--font-mono); font-size: 0.6rem; padding: 2px 8px; border-radius: 20px; background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid #2a2a2a; &.active-dot { background: rgba(37,99,235,0.1); color: var(--neon-green); border-color: rgba(37,99,235,0.3); } }
    .action-btns { display: flex; gap: 4px; }
    .btn-action { width: 28px; height: 28px; border-radius: var(--radius-md); border: 1px solid; background: transparent; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; transition: all 150ms; &.edit { border-color: #333; color: var(--text-muted); &:hover { border-color: var(--neon-green); color: var(--neon-green); } } &.delete { border-color: rgba(220,38,38,0.3); color: var(--neon-red); &:hover { background: rgba(220,38,38,0.1); } } }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.8rem; .empty-icon { font-size: 2.5rem; margin-bottom: 12px; } small { font-size: 0.7rem; display: block; margin-top: 6px; } }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(4px); }
    .modal-box { background: var(--bg-surface); border: 1px solid #333; border-radius: var(--radius-lg); padding: 32px; max-width: 380px; width: 90%; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .modal-title { font-family: var(--font-display); font-size: 1rem; font-weight: 800; letter-spacing: 0.1em; color: var(--text-primary); }
    .modal-subtitle { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); text-align: center; line-height: 1.6; }
    .modal-warn { font-family: var(--font-mono); font-size: 0.72rem; color: var(--neon-red); }
    .modal-actions { display: flex; gap: 12px; width: 100%; }
    .btn-danger-sm { flex: 1; padding: 10px; background: var(--neon-red); color: #fff; border: none; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; cursor: pointer; }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .form-panel { position: static; } }
  `]
})
export class AdminShowtimesComponent implements OnInit {
  private fb          = inject(FormBuilder);
  private svc         = inject(ShowtimeService);
  private movieSvc    = inject(MovieService);
  private theaterSvc  = inject(TheaterService);
  private toast       = inject(ToastService);

  showtimes     = signal<ShowtimeResponse[]>([]);
  movies        = signal<MovieResponse[]>([]);
  theaters      = signal<TheaterResponse[]>([]);
  loading       = signal(true);
  loadingMovies = signal(true);
  loadingTheaters = signal(true);
  saving        = signal(false);
  editingId     = signal<number | null>(null);
  deleteTarget  = signal<ShowtimeResponse | null>(null);

  searchDate    = '';
  searchMovieId = '';

  readonly today = new Date().toISOString().split('T')[0];

  form = this.fb.group({
    movieId:   ['' as any, Validators.required],
    theaterId: ['' as any, Validators.required],
    showDate:  ['', Validators.required],
    showTime:  ['', Validators.required],
    price:     [null as number | null, [Validators.required, Validators.min(0.01)]],
    active:    [true]
  });

  selectedMovie = computed(() => {
    const id = Number(this.form.value.movieId);
    return id ? this.movies().find(m => m.id === id) ?? null : null;
  });

  selectedTheater = computed(() => {
    const id = Number(this.form.value.theaterId);
    return id ? this.theaters().find(t => t.id === id) ?? null : null;
  });

  estimatedEnd = computed(() => {
    const time  = this.form.value.showTime;
    const movie = this.selectedMovie();
    if (!time || !movie) return null;
    const [h, m] = time.split(':').map(Number);
    const totalMin = h * 60 + m + movie.durationMinutes + 20;
    const eh = Math.floor(totalMin / 60) % 24;
    const em = totalMin % 60;
    return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
  });

  filteredShowtimes = computed(() => {
    return this.showtimes().filter(s => {
      const dateOk  = !this.searchDate    || s.showDate === this.searchDate;
      const movieOk = !this.searchMovieId || String(s.movieId) === String(this.searchMovieId);
      return dateOk && movieOk;
    });
  });

  ngOnInit() {
    this.loadAll();
    this.movieSvc.adminGetAll().subscribe({
      next: m => { this.movies.set(m); this.loadingMovies.set(false); },
      error: () => this.loadingMovies.set(false)
    });
    this.theaterSvc.adminGetAll().subscribe({
      next: t => { this.theaters.set(t); this.loadingTheaters.set(false); },
      error: () => this.loadingTheaters.set(false)
    });
  }

  loadAll() {
    this.loading.set(true);
    this.svc.adminGetAll().subscribe({
      next: s => { this.showtimes.set(s); this.loading.set(false); },
      error: () => { this.toast.error('Erro ao carregar sessões'); this.loading.set(false); }
    });
  }

  isInvalid(f: string) {
    const c = this.form.get(f);
    return c?.invalid && c?.touched;
  }

  editShowtime(s: ShowtimeResponse) {
    this.editingId.set(s.id);
    this.form.patchValue({
      movieId:   s.movieId,
      theaterId: s.theaterId,
      showDate:  s.showDate,
      showTime:  s.showTime.substring(0, 5),
      price:     s.price,
      active:    s.active
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.editingId.set(null);
    this.form.reset({ active: true });
    this.form.markAsUntouched();
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);

    const v = this.form.value;
    const payload = {
      movieId:   Number(v.movieId),
      theaterId: Number(v.theaterId),
      showDate:  v.showDate!,
      showTime:  v.showTime!,
      price:     Number(v.price),
      active:    v.active ?? true
    };

    const op = this.editingId()
      ? this.svc.update(this.editingId()!, payload)
      : this.svc.create(payload);

    op.subscribe({
      next: () => {
        this.toast.success(this.editingId() ? 'Sessão atualizada!' : 'Sessão criada!');
        this.resetForm();
        this.loadAll();
        this.saving.set(false);
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'Erro ao salvar sessão');
        this.saving.set(false);
      }
    });
  }

  confirmDelete(s: ShowtimeResponse) { this.deleteTarget.set(s); }

  executeDelete() {
    const s = this.deleteTarget();
    if (!s) return;
    this.svc.delete(s.id).subscribe({
      next: () => { this.toast.success('Sessão removida!'); this.deleteTarget.set(null); this.loadAll(); },
      error: (e: any) => this.toast.error(e.error?.message || 'Erro ao remover sessão')
    });
  }

  clearFilters() { this.searchDate = ''; this.searchMovieId = ''; }

  formatDate(d: string) {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  formatTime(t: string) { return t ? t.substring(0, 5) : ''; }

  dayOfWeek(d: string) {
    if (!d) return '';
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    return days[new Date(d + 'T12:00:00').getDay()] ?? '';
  }
}
