import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/guards';

export const routes: Routes = [
  // ─── Públicas — qualquer visitante, sem login ─────────────────────────────
  {
    path: '',
    loadComponent: () => import('./features/movies/movie-list/movie-list.component')
      .then(m => m.MovieListComponent)
  },
  {
    path: 'movies/:id',
    loadComponent: () => import('./features/movies/movie-detail/movie-detail.component')
      .then(m => m.MovieDetailComponent)
  },
  {
    path: 'showtimes',
    loadComponent: () => import('./features/showtimes/showtime-list/showtime-list.component')
      .then(m => m.ShowtimeListComponent)
  },

  // ─── Auth ─────────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },

  // ─── Área do usuário autenticado ──────────────────────────────────────────
  {
    path: 'showtimes/:id/seats',
    canActivate: [authGuard],
    loadComponent: () => import('./features/booking/seat-selection/seat-selection.component')
      .then(m => m.SeatSelectionComponent)
  },
  {
    path: 'my-bookings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/booking/my-bookings/my-bookings.component')
      .then(m => m.MyBookingsComponent)
  },
  {
    path: 'booking/:code',
    canActivate: [authGuard],
    loadComponent: () => import('./features/booking/booking-detail/booking-detail.component')
      .then(m => m.BookingDetailComponent)
  },

  // ─── Área admin (protegida por ROLE_ADMIN) ────────────────────────────────
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent)
  },
  {
    path: 'admin/movies',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/movies/admin-movies.component')
      .then(m => m.AdminMoviesComponent)
  },
  {
    path: 'admin/showtimes',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/showtimes/admin-showtimes.component')
      .then(m => m.AdminShowtimesComponent)
  },

  { path: '**', redirectTo: '' }
];
