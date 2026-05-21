package build.moviebooking.moviebooking.service;

import build.moviebooking.moviebooking.dto.request.BookingRequest;
import build.moviebooking.moviebooking.dto.response.BookingResponse;
import build.moviebooking.moviebooking.dto.response.SeatResponse;
import build.moviebooking.moviebooking.dto.response.ShowtimeResponse;
import build.moviebooking.moviebooking.entity.*;
import build.moviebooking.moviebooking.exception.BookingException;
import build.moviebooking.moviebooking.exception.ResourceNotFoundException;
import build.moviebooking.moviebooking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j

public class BookingService {
    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final AuthService authService;

    @Value("${app.booking.max-seats-per-booking:10}")
    private int maxSeatsPerBooking;

    @Value("${app.booking.cancellation-hours-before:2}")
    private int cancellationHoursBefore;

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User currentUser = authService.getCurrentUser();

        if (request.seatIds().size() > maxSeatsPerBooking) {
            throw new BookingException("Máximo de " + maxSeatsPerBooking + " assentos por reserva");
        }

        ShowTime showtime = showtimeRepository.findByIdWithLock(request.showtimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Sessão não encontrada"));

        if (!showtime.getActive()) {
            throw new BookingException("Sessão não está ativa");
        }

        LocalDateTime showtimeDateTime = LocalDateTime.of(showtime.getShowDate(), showtime.getShowTime());
        if (showtimeDateTime.isBefore(LocalDateTime.now())) {
            throw new BookingException("Não é possível reservar para sessões passadas");
        }

        List<ShowtimeSeat> showtimeSeats = showtimeSeatRepository
                .findByShowtimeIdAndSeatIdsWithLock(request.showtimeId(), request.seatIds());

        if (showtimeSeats.size() != request.seatIds().size()) {
            throw new BookingException("Um ou mais assentos não existem para esta sessão");
        }

        List<ShowtimeSeat> unavailableSeats = showtimeSeats.stream()
                .filter(ss -> !ss.getIsAvailable())
                .toList();

        if (!unavailableSeats.isEmpty()) {
            throw new BookingException("Um ou mais assentos já estão reservados");
        }

        BigDecimal totalPrice = showtimeSeats.stream()
                .map(ss -> ss.getSeat().getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Booking booking = Booking.builder()
                .user(currentUser)
                .showtime(showtime)
                .bookingCode(generateBookingCode())
                .totalSeats(request.seatIds().size())
                .totalPrice(totalPrice)
                .status(Booking.BookingStatus.CONFIRMED)
                .bookingDate(LocalDateTime.now())
                .build();

        bookingRepository.save(booking);

        for (ShowtimeSeat showtimeSeat : showtimeSeats) {
            BookingSeat bookingSeat = BookingSeat.builder()
                    .booking(booking)
                    .seat(showtimeSeat.getSeat())
                    .price(showtimeSeat.getSeat().getPrice())
                    .build();
            bookingSeatRepository.save(bookingSeat);

            showtimeSeat.setIsAvailable(false);
            showtimeSeat.setBooking(booking);
            showtimeSeatRepository.save(showtimeSeat);
        }

        showtime.setAvailableSeats(showtime.getAvailableSeats() - request.seatIds().size());
        showtimeRepository.save(showtime);

        log.info("Booking criado: {} para usuário: {}", booking.getBookingCode(), currentUser.getUsername());

        return convertToResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings() {
        User currentUser = authService.getCurrentUser();
        List<Booking> bookings = bookingRepository.findByUserId(currentUser.getId());
        return bookings.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada"));

        User currentUser = authService.getCurrentUser();
        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new BookingException("Você não tem permissão para ver esta reserva");
        }

        return convertToResponse(booking);
    }

    @Transactional
    public void cancelBooking(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada"));

        User currentUser = authService.getCurrentUser();
        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new BookingException("Você não tem permissão para cancelar esta reserva");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BookingException("Esta reserva já foi cancelada");
        }

        LocalDateTime showtimeDateTime = LocalDateTime.of(
                booking.getShowtime().getShowDate(),
                booking.getShowtime().getShowTime());

        if (showtimeDateTime.minusHours(cancellationHoursBefore).isBefore(LocalDateTime.now())) {
            throw new BookingException("Cancelamento deve ser feito com pelo menos " +
                    cancellationHoursBefore + " horas de antecedência");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingId(booking.getId());
        for (BookingSeat bookingSeat : bookingSeats) {
            ShowtimeSeat showtimeSeat = showtimeSeatRepository
                    .findByShowtimeIdAndSeatIdsWithLock(
                            booking.getShowtime().getId(),
                            List.of(bookingSeat.getSeat().getId()))
                    .stream()
                    .findFirst()
                    .orElse(null);

            if (showtimeSeat != null) {
                showtimeSeat.setIsAvailable(true);
                showtimeSeat.setBooking(null);
                showtimeSeatRepository.save(showtimeSeat);
            }
        }

        ShowTime showtime = booking.getShowtime();
        showtime.setAvailableSeats(showtime.getAvailableSeats() + booking.getTotalSeats());
        showtimeRepository.save(showtime);

        log.info("Booking cancelado: {}", bookingCode);
    }

    private String generateBookingCode() {
        return "BKG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private BookingResponse convertToResponse(Booking booking) {
        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingId(booking.getId());

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getUser().getId())
                .username(booking.getUser().getUsername())
                .userEmail(booking.getUser().getEmail())
                .showtime(convertShowtimeToResponse(booking.getShowtime()))
                .seats(bookingSeats.stream()
                        .map(bs -> convertSeatToResponse(bs.getSeat(), true))
                        .collect(Collectors.toList()))
                .totalSeats(booking.getTotalSeats())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus().name())
                .bookingDate(booking.getBookingDate())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    private ShowtimeResponse convertShowtimeToResponse(ShowTime showtime) {
        return ShowtimeResponse.builder()
                .id(showtime.getId())
                .movieId(showtime.getMovie().getId())
                .movieTitle(showtime.getMovie().getTitle())
                .theaterId(showtime.getTheater().getId())
                .theaterName(showtime.getTheater().getName())
                .showDate(showtime.getShowDate())
                .showTime(showtime.getShowTime())
                .availableSeats(showtime.getAvailableSeats())
                .totalSeats(showtime.getTheater().getTotalSeats())
                .price(showtime.getPrice())
                .active(showtime.getActive())
                .build();
    }

    private SeatResponse convertSeatToResponse(Seat seat, boolean isAvailable) {
        return SeatResponse.builder()
                .id(seat.getId())
                .seatRow(seat.getSeatRow())
                .seatNumber(seat.getSeatnumber())
                .seatType(seat.getSeatType().name())
                .price(seat.getPrice())
                .isAvailable(isAvailable)
                .build();
    }
}
