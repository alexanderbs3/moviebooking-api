package build.moviebooking.moviebooking.dto.response;


import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ApiResponse {

    private Boolean success;
    private String message;
    private Object data;


    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static ApiResponse success(String message) {
        return ApiResponse.builder()
                .success(true)
                .message(message)
                .build();
    }

    public static ApiResponse success(String message, Object data) {
        return ApiResponse.builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static ApiResponse error(String message) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .build();
    }

    public static ApiResponse error(String message, Object data) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .data(data)
                .build();
    }

}
