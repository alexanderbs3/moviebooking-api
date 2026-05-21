package build.moviebooking.moviebooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class MovieResponse {

    private Long id;
    private String title;
    private String description;
    private String posterUrl;
    private Integer durationMinutes;
    private LocalDate releaseDate;
    private BigDecimal rating;
    private Boolean active;
    private Set<GenreResponse> genres;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
