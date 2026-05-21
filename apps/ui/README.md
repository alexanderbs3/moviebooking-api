# CINEVERSE // FRONTEND

> Frontend Angular 17 para o sistema MovieBooking API  
> Tema: **Cyberpunk Black** — preto puro + neon verde `#00ff87` + neon vermelho `#ff003c`

---

## Stack

| Tech | Versão |
|------|--------|
| Angular | 17.x (Standalone Components) |
| TypeScript | 5.4 |
| RxJS | 7.8 |
| SCSS | CSS Variables + animations |

---

## Pré-requisitos

```bash
node >= 18.x
npm  >= 9.x
```

---

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em modo dev (proxy → localhost:8080)
npm start

# 3. Build produção
npm run build
```

O dev server sobe em **http://localhost:4200**  
As chamadas `/api/**` são redirecionadas ao backend `http://localhost:8080` via `proxy.conf.json`.

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── core/
│   │   ├── models/        # Interfaces TypeScript (DTOs)
│   │   ├── services/      # AuthService, MovieService, ShowtimeService, BookingService, AdminService, ToastService
│   │   ├── interceptors/  # JWT Bearer + Error handler
│   │   └── guards/        # authGuard, adminGuard
│   ├── features/
│   │   ├── auth/login/           # Tela de login
│   │   ├── movies/               # Listagem + Detalhe de filmes
│   │   ├── showtimes/            # Grade de sessões com date-picker
│   │   ├── booking/              # Seleção de assentos, Minhas reservas, Detalhe
│   │   └── admin/                # Dashboard, Gestão de filmes e sessões
│   ├── shared/components/        # Navbar, Toast, Loading
│   ├── app.routes.ts             # Lazy-loaded routes
│   └── app.config.ts             # Providers (router, http, animations)
├── environments/
│   └── environment.ts            # apiUrl: 'http://localhost:8080'
└── styles.scss                   # Design System Cyberpunk + utilitários globais
```

---

## Integração com a API

### Endpoints mapeados

| Serviço | Endpoint | Método |
|---------|----------|--------|
| Login | `POST /api/auth/login` | Público |
| Filmes | `GET /api/movies` | Público |
| Filme por ID | `GET /api/movies/{id}` | Público |
| Sessões por data | `GET /api/showtimes/search?date=` | Público |
| Sessão por ID | `GET /api/showtimes/{id}` | Público |
| Assentos da sessão | `GET /api/showtimes/{id}/seats` | Público |
| Criar reserva | `POST /api/bookings` | Auth |
| Minhas reservas | `GET /api/bookings/my-bookings` | Auth |
| Detalhe reserva | `GET /api/bookings/{code}` | Auth |
| Cancelar reserva | `DELETE /api/bookings/{code}` | Auth |
| Admin: criar filme | `POST /api/admin/movies` | Admin |
| Admin: editar filme | `PUT /api/admin/movies/{id}` | Admin |
| Admin: criar sessão | `POST /api/admin/showtimes` | Admin |
| Admin: relatório mensal | `GET /api/admin/reports/current-month` | Admin |
| Admin: relatório anual | `GET /api/admin/reports/year-to-date` | Admin |

### Autenticação

O `JwtInterceptor` injeta automaticamente o header:
```
Authorization: Bearer <token>
```
em todas as requisições quando o usuário está logado.

---

## Design System

### Paleta Cyberpunk Black

```scss
--bg-void:     #000000   /* fundo principal */
--bg-surface:  #0e0e0e   /* cards */
--neon-green:  #00ff87   /* cor primária — CTAs, seleções, dados */
--neon-red:    #ff003c   /* cor de perigo — admin, cancelamentos */
--neon-cyan:   #00d4ff   /* estados neutros */
--text-primary:#f0f0f0
```

### Fontes

- `Orbitron` — títulos e displays
- `Share Tech Mono` — dados, labels, código
- `Rajdhani` — corpo de texto

### Efeitos visuais

- **Grid background** — grade sutil de 40×40px em todo o body
- **Scanlines** — linhas horizontais animadas (CRT aesthetic)
- **Neon glow** — box-shadow pulsante nos elementos ativos
- **Scan line animada** — barra verde percorrendo o poster no detalhe do filme
- **Corner decorators** — marcações angulares na tela de login

---

## Credenciais de Teste (DEV)

```
admin  / admin123   → acesso total + painel admin
user   / user123    → reservas e histórico
```

---

## CORS

Configure no backend Spring Boot:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        // ...
    }
}
```
