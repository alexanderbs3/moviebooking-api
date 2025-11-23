package build.moviebooking.moviebooking.service;

import build.moviebooking.moviebooking.dto.response.ReportResponse;
import build.moviebooking.moviebooking.entity.Booking;
import build.moviebooking.moviebooking.entity.Movie;
import build.moviebooking.moviebooking.entity.ShowTime;
import build.moviebooking.moviebooking.entity.Theater;
import build.moviebooking.moviebooking.repository.BookingRepository;
import build.moviebooking.moviebooking.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j

public class ReportService {

    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;

    @Transactional(readOnly = true)
    public ReportResponse generateReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<Booking> bookings = bookingRepository.findByDateRange(startDateTime, endDateTime);

        Long totalBookings = (long) bookings.size();
        Long confirmedBookings = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .count();
        Long cancelledBookings = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CANCELLED)
                .count();

        BigDecimal totalRevenue = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Integer totalSeatsBooked = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .mapToInt(Booking::getTotalSeats)
                .sum();

        Double averageBookingValue = confirmedBookings > 0
                ? totalRevenue.divide(BigDecimal.valueOf(confirmedBookings), 2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        List<ReportResponse.MovieStatistics> movieStats = generateMovieStatistics(bookings, startDate, endDate);
        List<ReportResponse.TheaterStatistics> theaterStats = generateTheaterStatistics(bookings, startDate, endDate);
        List<ReportResponse.DailyStatistics> dailyStats = generateDailyStatistics(bookings);

        List<ShowTime> showtimes = showtimeRepository.findByDateRange(startDate, endDate);
        Integer totalAvailableSeats = showtimes.stream()
                .mapToInt(s -> s.getTheater().getTotalSeats())
                .sum();

        Double occupancyRate = totalAvailableSeats > 0
                ? (totalSeatsBooked.doubleValue() / totalAvailableSeats) * 100
                : 0.0;

        return ReportResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalBookings(totalBookings)
                .confirmedBookings(confirmedBookings)
                .cancelledBookings(cancelledBookings)
                .totalRevenue(totalRevenue)
                .confirmedRevenue(totalRevenue)
                .averageBookingValue(averageBookingValue)
                .totalSeatsBooked(totalSeatsBooked)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                .movieStatistics(movieStats)
                .theaterStatistics(theaterStats)
                .dailyStatistics(dailyStats)
                .build();
    }

    private List<ReportResponse.MovieStatistics> generateMovieStatistics(
            List<Booking> bookings, LocalDate startDate, LocalDate endDate) {

        Map<Movie, List<Booking>> bookingsByMovie = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .collect(Collectors.groupingBy(b -> b.getShowtime().getMovie()));

        return bookingsByMovie.entrySet().stream()
                .map(entry -> {
                    Movie movie = entry.getKey();
                    List<Booking> movieBookings = entry.getValue();

                    Long totalBookings = (long) movieBookings.size();
                    Integer totalSeats = movieBookings.stream()
                            .mapToInt(Booking::getTotalSeats)
                            .sum();

                    BigDecimal revenue = movieBookings.stream()
                            .map(Booking::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    List<ShowTime> movieShowtimes = showtimeRepository
                            .findByDateRange(startDate, endDate).stream()
                            .filter(s -> s.getMovie().getId().equals(movie.getId()))
                            .toList();

                    Integer totalShowtimes = movieShowtimes.size();
                    Integer totalAvailableSeats = movieShowtimes.stream()
                            .mapToInt(s -> s.getTheater().getTotalSeats())
                            .sum();

                    Double occupancyRate = totalAvailableSeats > 0
                            ? (totalSeats.doubleValue() / totalAvailableSeats) * 100
                            : 0.0;

                    return ReportResponse.MovieStatistics.builder()
                            .movieId(movie.getId())
                            .movieTitle(movie.getTitle())
                            .totalBookings(totalBookings)
                            .totalSeatsBooked(totalSeats)
                            .revenue(revenue)
                            .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                            .totalShowtimes(totalShowtimes)
                            .build();
                })
                .sorted(Comparator.comparing(ReportResponse.MovieStatistics::getRevenue).reversed())
                .collect(Collectors.toList());
    }

    private List<ReportResponse.TheaterStatistics> generateTheaterStatistics(
            List<Booking> bookings, LocalDate startDate, LocalDate endDate) {

        Map<Theater, List<Booking>> bookingsByTheater = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .collect(Collectors.groupingBy(b -> b.getShowtime().getTheater()));

        return bookingsByTheater.entrySet().stream()
                .map(entry -> {
                    Theater theater = entry.getKey();
                    List<Booking> theaterBookings = entry.getValue();

                    Long totalBookings = (long) theaterBookings.size();
                    Integer totalSeats = theaterBookings.stream()
                            .mapToInt(Booking::getTotalSeats)
                            .sum();

                    BigDecimal revenue = theaterBookings.stream()
                            .map(Booking::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    List<ShowTime> theaterShowtimes = showtimeRepository
                            .findByDateRange(startDate, endDate).stream()
                            .filter(s -> s.getTheater().getId().equals(theater.getId()))
                            .toList();

                    Integer totalShowtimes = theaterShowtimes.size();
                    Integer totalAvailableSeats = totalShowtimes * theater.getTotalSeats();

                    Double occupancyRate = totalAvailableSeats > 0
                            ? (totalSeats.doubleValue() / totalAvailableSeats) * 100
                            : 0.0;

                    return ReportResponse.TheaterStatistics.builder()
                            .theaterId(theater.getId())
                            .theaterName(theater.getName())
                            .totalBookings(totalBookings)
                            .totalSeatsBooked(totalSeats)
                            .revenue(revenue)
                            .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                            .totalShowtimes(totalShowtimes)
                            .build();
                })
                .sorted(Comparator.comparing(ReportResponse.TheaterStatistics::getRevenue).reversed())
                .collect(Collectors.toList());
    }

    private List<ReportResponse.DailyStatistics> generateDailyStatistics(List<Booking> bookings) {
        Map<LocalDate, List<Booking>> bookingsByDate = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .collect(Collectors.groupingBy(b -> b.getBookingDate().toLocalDate()));

        return bookingsByDate.entrySet().stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<Booking> dayBookings = entry.getValue();

                    Long totalBookings = (long) dayBookings.size();
                    Integer totalSeats = dayBookings.stream()
                            .mapToInt(Booking::getTotalSeats)
                            .sum();

                    BigDecimal revenue = dayBookings.stream()
                            .map(Booking::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return ReportResponse.DailyStatistics.builder()
                            .date(date)
                            .bookings(totalBookings)
                            .revenue(revenue)
                            .seatsBooked(totalSeats)
                            .build();
                })
                .sorted(Comparator.comparing(ReportResponse.DailyStatistics::getDate))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReportResponse generateCurrentMonthReport() {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());
        return generateReport(startOfMonth, endOfMonth);
    }

    @Transactional(readOnly = true)
    public ReportResponse generateYearToDateReport() {
        LocalDate now = LocalDate.now();
        LocalDate startOfYear = now.withDayOfYear(1);
        return generateReport(startOfYear, now);
    }
}
