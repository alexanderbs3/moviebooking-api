package build.moviebooking.moviebooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Long userId;
    private String username;
    private String userEmail;
    private ShowtimeResponse showtime;
    private List<SeatResponse> seats;
    private Integer totalSeats;
    private BigDecimal totalPrice;
    private String status;
    private LocalDateTime bookingDate;
    private LocalDateTime createdAt;
}
