package build.moviebooking.moviebooking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "Username é obrigatório")
        @Size(min = 3, max = 50)
        String username,

        @NotBlank(message = "Email obrigatório")
        @Email
        String email,

        @NotBlank(message = "Senha obrigatória")
        @Size(min = 6, message = "Senha deve ter 6 caracteres")
        String password,

        @NotBlank(message = "Nome completo é obrigatório")
        String fullName,

        String phone
) {}
