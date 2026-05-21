package build.moviebooking.moviebooking.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ShowRequest(
        @NotNull(message = "ID do filme é obrigatorio")
        Long movieId,

        @NotNull(message = "ID do teatro é obrigatorio")
        Long theaterId,

        @NotNull(message = "Data da sessão é obrigatoria")
        @Future(message = "Data deve ser futura")
        LocalDateTime showDate,

        @NotNull(message = "Hora da sessao é obrigatoria")
        LocalDateTime showTime,

        @NotNull(message = "Preço é obrigatório")
        @DecimalMin(value = "0.0", inclusive = false, message = "Preço deve ser maior que zero")
        BigDecimal price,

        Boolean active
) {

    public ShowRequest {
        if (active == null){
            active = true;
        }
    }
}
