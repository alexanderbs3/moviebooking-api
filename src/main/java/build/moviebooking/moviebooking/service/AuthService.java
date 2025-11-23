package build.moviebooking.moviebooking.service;

import build.moviebooking.moviebooking.dto.request.LoginRequest;
import build.moviebooking.moviebooking.dto.request.SignupRequest;
import build.moviebooking.moviebooking.dto.response.JwtResponse;
import build.moviebooking.moviebooking.entity.Role;
import build.moviebooking.moviebooking.entity.User;
import build.moviebooking.moviebooking.exception.UnauthorizedException;
import build.moviebooking.moviebooking.repository.RoleRepository;
import build.moviebooking.moviebooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public JwtResponse signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username já está em uso");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email já está em uso");
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Role USER não encontrada"));

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .phone(request.phone())
                .active(true)
                .roles(Set.of(userRole))
                .build();

        userRepository.save(user);
        log.info("Novo usuário registrado: {}", user.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtService.generateToken(authentication);

        Set<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return JwtResponse.builder()
                .token(jwt)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roles)
                .build();
    }

    public JwtResponse login(LoginRequest request) {
        try {
            // Tenta autenticar com o username/email fornecido
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.usernameOrEmail(),
                            request.password()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtService.generateToken(authentication);

            // Busca o usuário pelo username autenticado
            User user = userRepository.findByUsername(authentication.getName())
                    .or(() -> userRepository.findByEmail(authentication.getName()))
                    .orElseThrow(() -> new UnauthorizedException("Usuário não encontrado"));

            Set<String> roles = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet());

            log.info("Usuário autenticado: {}", user.getUsername());

            return JwtResponse.builder()
                    .token(jwt)
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .roles(roles)
                    .build();

        } catch (BadCredentialsException e) {
            log.error("Credenciais inválidas para: {}", request.usernameOrEmail());
            throw new UnauthorizedException("Usuário ou senha inválidos");
        } catch (AuthenticationException e) {
            log.error("Erro de autenticação para: {}", request.usernameOrEmail(), e);
            throw new UnauthorizedException("Erro ao autenticar usuário");
        }
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Usuário não autenticado");
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Usuário não encontrado"));
    }
}