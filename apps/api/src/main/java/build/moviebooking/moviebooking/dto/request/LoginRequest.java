package build.moviebooking.moviebooking.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Username ou email é obrigatório")
        String usernameOrEmail,

        @NotBlank(message = "Senha é obrigatoria")
        String password
        ) {
}
