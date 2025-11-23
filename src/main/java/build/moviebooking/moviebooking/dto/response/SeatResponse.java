package build.moviebooking.moviebooking.dto.response;

import jakarta.persistence.Access;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class SeatResponse {
    private Long id;
    private Long theaterId;
    private String seatRow;
    private Integer seatNumber;
    private String seatType;
    private BigDecimal price;
    private Boolean isAvailable;
}
