package build.moviebooking.moviebooking.config;

import build.moviebooking.moviebooking.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro de autenticação JWT que intercepta todas as requisições HTTP
 * e verifica se existe um token JWT válido no header Authorization.
 *
 * Este filtro:
 * 1. Extrai o token JWT do header Authorization
 * 2. Valida o token
 * 3. Extrai o username do token
 * 4. Carrega os detalhes do usuário
 * 5. Autentica o usuário no contexto de segurança do Spring
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            // 1. Extrai o token JWT do header Authorization
            String jwt = getJwtFromRequest(request);

            // 2. Verifica se o token existe e é válido
            if (StringUtils.hasText(jwt) && jwtService.validateToken(jwt)) {

                // 3. Extrai o username do token
                String username = jwtService.getUsernameFromToken(jwt);

                // 4. Carrega os detalhes do usuário do banco de dados
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // 5. Cria o objeto de autenticação
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                // 6. Define detalhes adicionais da requisição
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 7. Define o usuário como autenticado no contexto de segurança
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("Usuário '{}' autenticado via JWT. Roles: {}",
                        username, userDetails.getAuthorities());
            }

        } catch (Exception ex) {
            log.error("Não foi possível autenticar o usuário no contexto de segurança: {}",
                    ex.getMessage());
            // Não lança exceção, apenas loga e continua sem autenticar
            // Isso permite que o Spring Security trate como requisição não autenticada
        }

        // 8. Continua a cadeia de filtros
        filterChain.doFilter(request, response);
    }

    /**
     * Extrai o token JWT do header Authorization.
     *
     * O formato esperado é: "Bearer <token>"
     *
     * @param request A requisição HTTP
     * @return O token JWT sem o prefixo "Bearer ", ou null se não existir
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Remove "Bearer " (7 caracteres)
        }

        return null;
    }

    /**
     * Permite pular a autenticação JWT para endpoints públicos.
     *
     * Isso melhora a performance ao não processar JWT em endpoints
     * que não requerem autenticação.
     *
     * @param request A requisição HTTP
     * @return true se o filtro não deve ser aplicado, false caso contrário
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();

        // Lista de endpoints públicos que não precisam de autenticação JWT
        return path.startsWith("/api/auth/") ||              // Login e registro
                path.startsWith("/api/movies") ||             // Listagem de filmes (público)
                path.startsWith("/api/genres") ||             // Listagem de gêneros (público)
                path.startsWith("/api/showtimes/search") ||   // Busca de sessões (público)
                path.equals("/error") ||                      // Página de erro
                path.startsWith("/actuator/health") ||        // Health check
                path.startsWith("/v3/api-docs") ||            // Swagger docs
                path.startsWith("/swagger-ui");               // Swagger UI
    }
}