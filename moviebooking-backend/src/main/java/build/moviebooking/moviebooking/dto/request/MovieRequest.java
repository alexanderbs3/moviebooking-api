package build.moviebooking.moviebooking.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

public record MovieRequest(
        @NotBlank(message = "Título é obrigatório")
        String title,

        String description,
        String posterUrl,

        @NotNull(message = "Duração é obrigatória")
        @Min(value = 1, message = "A duração deve ser positiva")
        Integer durationMinutes,

        LocalDate releaseDate,

        @DecimalMin(value = "0.0", message = "Rating deve ser maior ou igual a 0")
        @DecimalMax(value = "10.0", message = "Rating deve ser menor ou igual a 10")
        BigDecimal rating,

        @NotEmpty(message = "Pelo menos um gênero deve ser selecionado")
        Set<Long> genreIds,

        @NotNull(message = "O campo 'active' é obrigatório")
        Boolean active
) {}
