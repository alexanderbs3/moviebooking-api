import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ReportResponse } from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, LoadingComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-label">// PAINEL DE CONTROLE — ADMIN</div>
        <h1 class="page-title">DASHBOARD <span>OPERACIONAL</span></h1>
      </div>

      <!-- Quick Nav -->
      <div class="quick-nav">
        <a routerLink="/admin/movies" class="nav-card">
          <span class="nav-icon">◈</span>
          <span class="nav-title">GERENCIAR FILMES</span>
          <span class="nav-arrow">→</span>
        </a>
        <a routerLink="/admin/showtimes" class="nav-card">
          <span class="nav-icon">◷</span>
          <span class="nav-title">GERENCIAR SESSÕES</span>
          <span class="nav-arrow">→</span>
        </a>
      </div>

      <!-- Report Controls -->
      <div class="report-section">
        <div class="section-header">
          <h2 class="section-title">RELATÓRIOS</h2>
          <div class="section-line"></div>
        </div>

        <div class="report-btns">
          <button class="report-btn" [class.active]="reportType() === 'month'" (click)="loadMonthReport()">MÊS ATUAL</button>
          <button class="report-btn" [class.active]="reportType() === 'year'"  (click)="loadYearReport()">ANO ATÉ HOJE</button>
        </div>

        @if (loadingReport()) {
          <app-loading message="GERANDO RELATÓRIO..." />
        }

        @if (!loadingReport() && report()) {
          <!-- KPI Cards -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-icon">◈</div>
              <div class="kpi-value">{{ report()!.totalBookings }}</div>
              <div class="kpi-label">RESERVAS</div>
            </div>
            <div class="kpi-card accent-green">
              <div class="kpi-icon">$</div>
              <div class="kpi-value">R$ {{ report()!.totalRevenue | number:'1.0-0' }}</div>
              <div class="kpi-label">RECEITA TOTAL</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon">▣</div>
              <div class="kpi-value">{{ report()!.totalTicketsSold }}</div>
              <div class="kpi-label">INGRESSOS VENDIDOS</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-icon">~</div>
              <div class="kpi-value">R$ {{ report()!.averageTicketPrice | number:'1.2-2' }}</div>
              <div class="kpi-label">TICKET MÉDIO</div>
            </div>
          </div>

          <!-- Top Movies -->
          @if (report()!.movieStatistics && report()!.movieStatistics.length) {
            <div class="table-section">
              <div class="table-label">// TOP FILMES</div>
              <table class="cyber-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>FILME</th>
                    <th>RESERVAS</th>
                    <th>INGRESSOS</th>
                    <th>RECEITA</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of report()!.movieStatistics; track m.movieId; let i = $index) {
                    <tr>
                      <td>{{ i + 1 }}</td>
                      <td style="color: var(--text-primary); font-family: var(--font-display); font-size: 0.8rem;">{{ m.movieTitle }}</td>
                      <td>{{ m.totalBookings }}</td>
                      <td>{{ m.totalSeats }}</td>
                      <td style="color: var(--neon-green);">R$ {{ m.totalRevenue | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- Top Theaters -->
          @if (report()!.theaterStatistics && report()!.theaterStatistics.length) {
            <div class="table-section">
              <div class="table-label">// SALAS</div>
              <table class="cyber-table">
                <thead>
                  <tr>
                    <th>SALA</th>
                    <th>RESERVAS</th>
                    <th>RECEITA</th>
                    <th>OCUPAÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  @for (t of report()!.theaterStatistics; track t.theaterId) {
                    <tr>
                      <td style="color: var(--text-primary);">{{ t.theaterName }}</td>
                      <td>{{ t.totalBookings }}</td>
                      <td style="color: var(--neon-green);">R$ {{ t.totalRevenue | number:'1.2-2' }}</td>
                      <td>
                        <div class="occ-bar">
                          <div class="occ-fill" [style.width.%]="t.occupancyRate"></div>
                        </div>
                        <span style="font-size: 0.7rem; color: var(--text-secondary);">{{ t.occupancyRate | number:'1.1-1' }}%</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1280px; margin: 0 auto; padding: 0 24px 64px; }
    .page-label { font-family: var(--font-mono); font-size: 0.72rem; color: var(--neon-red); letter-spacing: 0.15em; opacity: 0.7; margin-bottom: 8px; }
    .page-header { padding: 40px 0 24px; }
    .page-title { font-family: var(--font-display); font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 900; letter-spacing: 0.06em; color: var(--text-primary); span { color: var(--neon-red); } }

    /* Quick Nav */
    .quick-nav { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }

    .nav-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 24px;
      background: var(--bg-surface);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: var(--transition);
      min-width: 240px;

      .nav-icon  { font-size: 1.2rem; color: var(--neon-red); }
      .nav-title { font-family: var(--font-display); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; color: var(--text-primary); flex: 1; }
      .nav-arrow { color: var(--text-muted); transition: transform 200ms; }

      &:hover {
        border-color: rgba(220,38,38,0.3);
        background: rgba(220,38,38,0.03);
        .nav-arrow { transform: translateX(4px); color: var(--neon-red); }
      }
    }

    /* Report Section */
    .report-section { display: flex; flex-direction: column; gap: 24px; }

    .section-header { display: flex; align-items: center; gap: 20px; }
    .section-title { font-family: var(--font-display); font-size: 0.85rem; font-weight: 800; letter-spacing: 0.15em; color: var(--text-primary); white-space: nowrap; }
    .section-line  { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(220,38,38,0.3), transparent); }

    .report-btns { display: flex; gap: 8px; }

    .report-btn {
      padding: 8px 20px;
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      cursor: pointer;
      background: transparent;
      border: 1px solid var(--border-dim);
      color: var(--text-secondary);
      transition: var(--transition);

      &:hover { border-color: rgba(220,38,38,0.3); color: var(--neon-red); }
      &.active { border-color: var(--neon-red); background: rgba(220,38,38,0.08); color: var(--neon-red); }
    }

    /* KPI */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }

    .kpi-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-lg);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--border-dim), transparent);
      }

      &.accent-green::before {
        background: linear-gradient(90deg, transparent, var(--neon-green), transparent);
      }
    }

    .kpi-icon  { font-family: var(--font-display); font-size: 1rem; color: var(--text-muted); }
    .kpi-value { font-family: var(--font-display); font-size: 1.6rem; font-weight: 900; color: var(--text-primary); letter-spacing: 0.02em; }
    .kpi-label { font-family: var(--font-display); font-size: 0.55rem; font-weight: 700; letter-spacing: 0.2em; color: var(--text-muted); }

    .accent-green .kpi-value { color: var(--neon-green); text-shadow: var(--neon-green-glow); }

    /* Table */
    .table-section { display: flex; flex-direction: column; gap: 14px; }
    .table-label { font-family: var(--font-mono); font-size: 0.65rem; color: var(--neon-green); letter-spacing: 0.15em; opacity: 0.7; }

    .cyber-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--bg-surface);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      overflow: hidden;

      th {
        font-family: var(--font-display);
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--neon-green);
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid rgba(37,99,235,0.15);
        background: rgba(37,99,235,0.02);
      }

      td {
        font-family: var(--font-mono);
        font-size: 0.82rem;
        color: var(--text-secondary);
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-dim);
        &:last-child { border-bottom: none; }
      }

      tr:last-child td { border-bottom: none; }
      tr:hover td { background: rgba(255,255,255,0.01); }
    }

    /* Occupancy bar */
    .occ-bar {
      width: 80px;
      height: 4px;
      background: var(--border-dim);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .occ-fill {
      height: 100%;
      background: var(--neon-green);
      border-radius: 2px;
      transition: width 400ms ease;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  readonly loading       = signal(false);
  readonly loadingReport = signal(false);
  readonly report        = signal<ReportResponse | null>(null);
  readonly reportType    = signal<'month' | 'year'>('month');

  ngOnInit(): void {
    this.loadMonthReport();
  }

  loadMonthReport(): void {
    this.reportType.set('month');
    this.loadingReport.set(true);
    this.adminService.getCurrentMonthReport().subscribe({
      next: (r: any) => { this.report.set(r); this.loadingReport.set(false); },
      error: ()  => this.loadingReport.set(false)
    });
  }

  loadYearReport(): void {
    this.reportType.set('year');
    this.loadingReport.set(true);
    this.adminService.getYearToDateReport().subscribe({
      next: (r: any) => { this.report.set(r); this.loadingReport.set(false); },
      error: ()  => this.loadingReport.set(false)
    });
  }
}
