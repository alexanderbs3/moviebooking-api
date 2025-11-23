package build.moviebooking.moviebooking.controller;

import build.moviebooking.moviebooking.dto.request.BookingRequest;
import build.moviebooking.moviebooking.dto.response.ApiResponse;
import build.moviebooking.moviebooking.dto.response.BookingResponse;
import build.moviebooking.moviebooking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")


public class BookingController {
    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    @GetMapping("/{bookingCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> getBookingByCode(@PathVariable String bookingCode) {
        return ResponseEntity.ok(bookingService.getBookingByCode(bookingCode));
    }

    @DeleteMapping("/{bookingCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> cancelBooking(@PathVariable String bookingCode) {
        bookingService.cancelBooking(bookingCode);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Reserva cancelada com sucesso")
                .build());
    }
}
