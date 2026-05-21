package build.moviebooking.moviebooking.service;

import build.moviebooking.moviebooking.dto.response.UserResponse;
import build.moviebooking.moviebooking.entity.User;
import build.moviebooking.moviebooking.exception.ResourceNotFoundException;
import build.moviebooking.moviebooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        log.debug("Tentando carregar usuário: {}", usernameOrEmail);

        User user = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> {
                    log.error("Usuário não encontrado: {}", usernameOrEmail);
                    return new UsernameNotFoundException("Usuário não encontrado: " + usernameOrEmail);
                });

        log.debug("Usuário encontrado: {}, Active: {}", user.getUsername(), user.getActive());

        if (user.getActive() == null || !user.getActive()) {
            log.error("Usuário inativo: {}", usernameOrEmail);
            throw new UsernameNotFoundException("Usuário inativo: " + usernameOrEmail);
        }

        // CARREGAMENTO EXPLÍCITO DAS ROLES (força a inicialização)
        user.getRoles().size();

        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toSet());

        log.debug("Usuário {} carregado com {} roles", user.getUsername(), authorities.size());

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        // Inicializa roles
        user.getRoles().size();
        return convertToResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        // Inicializa roles
        user.getRoles().size();
        return convertToResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Inicializa roles para todos
        users.forEach(u -> u.getRoles().size());
        return users.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        user.setActive(false);
        userRepository.save(user);
        log.info("Usuário desativado: {}", user.getUsername());
    }

    @Transactional
    public void activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        user.setActive(true);
        userRepository.save(user);
        log.info("Usuário ativado: {}", user.getUsername());
    }

    private UserResponse convertToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .active(user.getActive())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}