package build.moviebooking.moviebooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class TheaterResponse {
    private Long id;
    private String name;
    private String location;
    private Integer totalSeats;
    private LocalDateTime createdAt;
}
