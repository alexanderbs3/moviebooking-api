package build.moviebooking.moviebooking.controller;

import build.moviebooking.moviebooking.dto.request.MovieRequest;
import build.moviebooking.moviebooking.dto.request.ShowtimeRequest;
import build.moviebooking.moviebooking.dto.response.ApiResponse;
import build.moviebooking.moviebooking.dto.response.MovieResponse;
import build.moviebooking.moviebooking.dto.response.ReportResponse;
import build.moviebooking.moviebooking.dto.response.ShowtimeResponse;
import build.moviebooking.moviebooking.service.MovieService;
import build.moviebooking.moviebooking.service.ReportService;
import build.moviebooking.moviebooking.service.ShowtimeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")

public class AdminController {

    private final MovieService movieService;
    private final ShowtimeService showtimeService;
    private final ReportService reportService;

    // Movie Management
    @PostMapping("/movies")
    public ResponseEntity<MovieResponse> createMovie(@Valid @RequestBody MovieRequest request) {
        return ResponseEntity.ok(movieService.createMovie(request));
    }

    @PutMapping("/movies/{id}")
    public ResponseEntity<MovieResponse> updateMovie(
            @PathVariable Long id,
            @Valid @RequestBody MovieRequest request) {
        return ResponseEntity.ok(movieService.updateMovie(id, request));
    }

    @DeleteMapping("/movies/{id}")
    public ResponseEntity<ApiResponse> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.success("Filme desativado com sucesso"));
    }

    // Showtime Management
    @PostMapping("/showtimes")
    public ResponseEntity<ShowtimeResponse> createShowtime(@Valid @RequestBody ShowtimeRequest request) {
        return ResponseEntity.ok(showtimeService.createShowtime(request));
    }

    @PutMapping("/showtimes/{id}")
    public ResponseEntity<ShowtimeResponse> updateShowtime(
            @PathVariable Long id,
            @Valid @RequestBody ShowtimeRequest request) {
        return ResponseEntity.ok(showtimeService.updateShowtime(id, request));
    }

    @DeleteMapping("/showtimes/{id}")
    public ResponseEntity<ApiResponse> deleteShowtime(@PathVariable Long id) {
        showtimeService.deleteShowtime(id);
        return ResponseEntity.ok(ApiResponse.success("Sessão desativada com sucesso"));
    }

    // Reports
    @GetMapping("/reports")
    public ResponseEntity<ReportResponse> getReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.generateReport(startDate, endDate));
    }

    @GetMapping("/reports/current-month")
    public ResponseEntity<ReportResponse> getCurrentMonthReport() {
        return ResponseEntity.ok(reportService.generateCurrentMonthReport());
    }

    @GetMapping("/reports/year-to-date")
    public ResponseEntity<ReportResponse> getYearToDateReport() {
        return ResponseEntity.ok(reportService.generateYearToDateReport());
    }

    // Bookings Overview
    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        // Implementar listagem de todas as reservas com filtros
        return ResponseEntity.ok(ApiResponse.success("Endpoint em desenvolvimento"));
    }
}