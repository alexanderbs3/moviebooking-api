package build.moviebooking.moviebooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder


public class ReportResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private Long totalBookings;
    private Long confirmedBookings;
    private Long cancelledBookings;
    private BigDecimal totalRevenue;
    private BigDecimal confirmedRevenue;
    private Double averageBookingValue;
    private Integer totalSeatsBooked;
    private Double occupancyRate;
    private List<MovieStatistics> movieStatistics;
    private List<TheaterStatistics> theaterStatistics;
    private List<DailyStatistics> dailyStatistics;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MovieStatistics {
        private Long movieId;
        private String movieTitle;
        private Long totalBookings;
        private Integer totalSeatsBooked;
        private BigDecimal revenue;
        private Double occupancyRate;
        private Integer totalShowtimes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TheaterStatistics {
        private Long theaterId;
        private String theaterName;
        private Long totalBookings;
        private Integer totalSeatsBooked;
        private BigDecimal revenue;
        private Double occupancyRate;
        private Integer totalShowtimes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyStatistics {
        private LocalDate date;
        private Long bookings;
        private BigDecimal revenue;
        private Integer seatsBooked;
    }
}


