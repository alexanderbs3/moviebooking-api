package build.moviebooking.moviebooking.service;

import build.moviebooking.moviebooking.dto.request.ShowtimeRequest;
import build.moviebooking.moviebooking.dto.response.SeatResponse;
import build.moviebooking.moviebooking.dto.response.ShowtimeResponse;
import build.moviebooking.moviebooking.entity.*;
import build.moviebooking.moviebooking.exception.ResourceNotFoundException;
import build.moviebooking.moviebooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class ShowtimeService {
    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;
    private final SeatRepository seatRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;

    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getShowtimesByDate(LocalDate date) {
        return showtimeRepository.findByDate(date).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getShowtimesByMovieAndDate(Long movieId, LocalDate date) {
        return showtimeRepository.findByMovieIdAndDate(movieId, date).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShowtimeResponse getShowtimeById(Long id) {
        ShowTime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sessão não encontrada"));
        return convertToResponse(showtime);
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getAvailableSeats(Long showtimeId) {
        ShowTime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Sessão não encontrada"));

        List<ShowtimeSeat> showtimeSeats = showtimeSeatRepository.findByShowtimeId(showtimeId);

        return showtimeSeats.stream()
                .map(ss -> SeatResponse.builder()
                        .id(ss.getSeat().getId())
                        .theaterId(ss.getSeat().getTheater().getId())
                        .seatRow(ss.getSeat().getSeatRow())
                        .seatNumber(ss.getSeat().getSeatnumber())
                        .seatType(ss.getSeat().getSeatType().name())
                        .price(ss.getSeat().getPrice())
                        .isAvailable(ss.getIsAvailable())
                        .build())
                .sorted(Comparator.comparing(SeatResponse::getSeatRow)
                        .thenComparing(SeatResponse::getSeatNumber))
                .collect(Collectors.toList());
    }

    @Transactional
    public ShowtimeResponse createShowtime(ShowtimeRequest request) {
        Movie movie = movieRepository.findById(request.movieId())
                .orElseThrow(() -> new ResourceNotFoundException("Filme não encontrado"));

        Theater theater = theaterRepository.findById(request.theaterId())
                .orElseThrow(() -> new ResourceNotFoundException("Teatro não encontrado"));

        ShowTime showtime = ShowTime.builder()
                .movie(movie)
                .theater(theater)
                .showDate(request.showDate())
                .showTime(request.showTime())
                .availableSeats(theater.getTotalSeats())
                .price(request.price())
                .active(request.active())
                .build();

        showtime = showtimeRepository.save(showtime);

        List<Seat> seats = seatRepository.findByTheaterId(theater.getId());
        for (Seat seat : seats) {
            ShowtimeSeat showtimeSeat = ShowtimeSeat.builder()
                    .showtime(showtime)
                    .seat(seat)
                    .isAvailable(true)
                    .build();
            showtimeSeatRepository.save(showtimeSeat);
        }

        return convertToResponse(showtime);
    }

    @Transactional
    public ShowtimeResponse updateShowtime(Long id, ShowtimeRequest request) {
        ShowTime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sessão não encontrada"));

        if (request.movieId() != null) {
            Movie movie = movieRepository.findById(request.movieId())
                    .orElseThrow(() -> new ResourceNotFoundException("Filme não encontrado"));
            showtime.setMovie(movie);
        }

        if (request.theaterId() != null) {
            Theater theater = theaterRepository.findById(request.theaterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teatro não encontrado"));
            showtime.setTheater(theater);
        }

        showtime.setShowDate(request.showDate());
        showtime.setShowTime(request.showTime());
        showtime.setPrice(request.price());
        showtime.setActive(request.active());

        return convertToResponse(showtimeRepository.save(showtime));
    }

    @Transactional
    public void deleteShowtime(Long id) {
        ShowTime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sessão não encontrada"));
        showtime.setActive(false);
        showtimeRepository.save(showtime);
    }

    private ShowtimeResponse convertToResponse(ShowTime showtime) {
        return ShowtimeResponse.builder()
                .id(showtime.getId())
                .movieId(showtime.getMovie().getId())
                .movieTitle(showtime.getMovie().getTitle())
                .moviePosterUrl(showtime.getMovie().getPosterUrl())
                .movieDurationMinutes(showtime.getMovie().getDurationMinutes())
                .theaterId(showtime.getTheater().getId())
                .theaterName(showtime.getTheater().getName())
                .theaterLocation(showtime.getTheater().getLocation())
                .showDate(showtime.getShowDate())
                .showTime(showtime.getShowTime())
                .availableSeats(showtime.getAvailableSeats())
                .totalSeats(showtime.getTheater().getTotalSeats())
                .price(showtime.getPrice())
                .active(showtime.getActive())
                .createdAt(showtime.getCreatedAt())
                .build();
    }

}
