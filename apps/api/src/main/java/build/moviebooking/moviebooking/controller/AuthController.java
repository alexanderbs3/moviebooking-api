package build.moviebooking.moviebooking.controller;

import build.moviebooking.moviebooking.dto.request.LoginRequest;
import build.moviebooking.moviebooking.dto.response.JwtResponse;
import build.moviebooking.moviebooking.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*",maxAge = 3600)

public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request){
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
