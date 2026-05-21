package build.moviebooking.moviebooking.dto.response;

import jdk.jfr.Name;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowtimeResponse {
    private Long id;
    private Long movieId;
    private String movieTitle;
    private String moviePosterUrl;
    private Integer movieDurationMinutes;
    private Long theaterId;
    private String theaterName;
    private String theaterLocation;
    private LocalDate showDate;
    private LocalTime showTime;
    private Integer availableSeats;
    private Integer totalSeats;
    private BigDecimal price;
    private Boolean active;
    private LocalDateTime createdAt;
}
