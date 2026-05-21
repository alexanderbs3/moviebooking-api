package build.moviebooking.moviebooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class BookingSummaryResponse {

    private Long id;
    private String bookingCode;
    private String movieTitle;
    private String theaterName;
    private String showDateTime;
    private Integer totalSeats;
    private BigDecimal totalPrice;
    private String status;
    private LocalDateTime bookingDate;
}
