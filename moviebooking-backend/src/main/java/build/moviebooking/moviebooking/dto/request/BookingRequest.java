package build.moviebooking.moviebooking.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record BookingRequest(
        @NotNull(message = "ID da sessão é obrigatório")
        Long showtimeId,

        @NotEmpty(message = "Deve selecionar pelo menos um assento")
        @Size(max = 10, message = "Máximo de 10 assentos por reserva")
        List<@NotNull Long> seatIds
) {}
