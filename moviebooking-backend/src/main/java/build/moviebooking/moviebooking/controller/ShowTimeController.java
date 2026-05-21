package build.moviebooking.moviebooking.controller;

import build.moviebooking.moviebooking.dto.response.SeatResponse;
import build.moviebooking.moviebooking.dto.response.ShowtimeResponse;
import build.moviebooking.moviebooking.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import build.moviebooking.moviebooking.dto.response.SeatResponse;
import build.moviebooking.moviebooking.dto.response.ShowtimeResponse;
import build.moviebooking.moviebooking.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")

public class ShowTimeController {

    private final ShowtimeService showtimeService;

    @GetMapping("/search")
    public ResponseEntity<List<ShowtimeResponse>> getShowtimesByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(showtimeService.getShowtimesByDate(date));
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<List<SeatResponse>> getAvailableSeats(@PathVariable Long id) {
        return ResponseEntity.ok(showtimeService.getAvailableSeats(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowtimeResponse> getShowtimeById(@PathVariable Long id) {
        return ResponseEntity.ok(showtimeService.getShowtimeById(id));
    }
}
