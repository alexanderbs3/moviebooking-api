package build.moviebooking.moviebooking.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ShowtimeRequest(
        @NotNull(message = "ID do filme é obrigatório")
        Long movieId,

        @NotNull(message = "ID do teatro é obrigatório")
        Long theaterId,

        @NotNull(message = "Data da sessão é obrigatória")
        @Future(message = "Data deve ser futura")
        LocalDate showDate,

        @NotNull(message = "Hora da sessão é obrigatória")
        LocalTime showTime,

        @NotNull(message = "Preço é obrigatório")
        @DecimalMin(value = "0.0", inclusive = false, message = "Preço deve ser maior que zero")
        BigDecimal price,

        Boolean active
) {
    public ShowtimeRequest {
        if (active == null) {
            active = true;
        }
    }
}