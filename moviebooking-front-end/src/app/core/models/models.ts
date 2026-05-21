// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

// ─── Movie ────────────────────────────────────────────────────────────────────
export type MovieStatus = 'COMING_SOON' | 'NOW_PLAYING' | 'ENDED';
export type AgeRating   = 'L' | '10' | '12' | '14' | '16' | '18';

export interface MovieResponse {
  id: number;
  title: string;
  description?: string;
  posterUrl?: string;
  trailerUrl?: string;
  durationMinutes: number;
  releaseDate?: string;
  rating?: number;
  ageRating: AgeRating;
  movieStatus: MovieStatus;
  director?: string;
  castMembers?: string;
  language?: string;
  active: boolean;
  genres: GenreResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface MovieRequest {
  title: string;
  description?: string;
  posterUrl?: string;
  trailerUrl?: string;
  durationMinutes: number;
  releaseDate?: string;
  rating?: number;
  ageRating: AgeRating;
  movieStatus: MovieStatus;
  director?: string;
  castMembers?: string;
  language?: string;
  genreIds: number[];
  active: boolean;
}

// ─── Genre ────────────────────────────────────────────────────────────────────
export interface GenreResponse {
  id: number;
  name: string;
  description?: string;
}

// ─── Theater ──────────────────────────────────────────────────────────────────
export interface TheaterResponse {
  id: number;
  name: string;
  location?: string;
  totalSeats: number;
  active: boolean;
  createdAt: string;
}

// ─── Showtime ─────────────────────────────────────────────────────────────────
export interface ShowtimeResponse {
  id: number;
  movieId: number;
  movieTitle: string;
  moviePosterUrl?: string;
  movieDurationMinutes: number;
  theaterId: number;
  theaterName: string;
  theaterLocation?: string;
  showDate: string;
  showTime: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
  active: boolean;
  createdAt: string;
}

export interface ShowtimeRequest {
  movieId: number;
  theaterId: number;
  showDate: string;
  showTime: string;
  price: number;
  active: boolean;
}

// ─── Seat ─────────────────────────────────────────────────────────────────────
export type SeatType = 'STANDARD' | 'PREMIUM' | 'VIP';

export interface SeatResponse {
  id: number;
  theaterId?: number;
  seatRow: string;
  seatNumber: number;
  seatType: SeatType;
  price: number;
  isAvailable: boolean;
}

// ─── Booking ──────────────────────────────────────────────────────────────────
export interface BookingRequest {
  showtimeId: number;
  seatIds: number[];
}

export interface BookingResponse {
  id: number;
  bookingCode: string;
  userId: number;
  username: string;
  userEmail: string;
  showtime: ShowtimeResponse;
  seats: SeatResponse[];
  totalSeats: number;
  totalPrice: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  bookingDate: string;
  createdAt: string;
}

// ─── Report ───────────────────────────────────────────────────────────────────
export interface ReportResponse {
  startDate: string;
  endDate: string;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  totalSeatsBooked: number;
  occupancyRate: number;
  movieStatistics: MovieStatistics[];
  theaterStatistics: TheaterStatistics[];
  dailyStatistics: DailyStatistics[];
}

export interface MovieStatistics {
  movieId: number;
  movieTitle: string;
  totalBookings: number;
  totalSeatsBooked: number;
  revenue: number;
  occupancyRate: number;
  totalShowtimes: number;
}

export interface TheaterStatistics {
  theaterId: number;
  theaterName: string;
  totalBookings: number;
  totalSeatsBooked: number;
  revenue: number;
  occupancyRate: number;
  totalShowtimes: number;
}

export interface DailyStatistics {
  date: string;
  bookings: number;
  revenue: number;
  seatsBooked: number;
}

export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}
