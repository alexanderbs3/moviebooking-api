# 🎬 Movie Booking API

<div align="center">

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.7-brightgreen?style=for-the-badge&logo=spring)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Uma API RESTful completa para gerenciamento de reservas de ingressos de cinema**

[Funcionalidades](#-funcionalidades) • [Instalação](#-instalação-rápida) • [Documentação](#-documentação-da-api) • [Arquitetura](#-arquitetura)

</div>

---

## 📖 Sobre o Projeto

Sistema de gerenciamento de reservas de cinema desenvolvido com as melhores práticas de desenvolvimento Spring Boot. Oferece controle completo de filmes, sessões, assentos e reservas, com autenticação JWT e prevenção de overbooking através de controle transacional otimista.

### 🎯 Principais Diferenciais

- ✅ **Controle de Concorrência**: Locks pessimistas para prevenir reservas duplicadas
- ✅ **Autenticação Robusta**: JWT com refresh tokens e controle granular de permissões
- ✅ **Relatórios Gerenciais**: Estatísticas detalhadas de vendas, ocupação e performance
- ✅ **Docker Ready**: Deploy simplificado com Docker Compose
- ✅ **Migrations Automáticas**: Flyway para versionamento de banco de dados
- ✅ **API RESTful**: Seguindo padrões REST e melhores práticas

---

## ✨ Funcionalidades

<table>
<tr>
<td width="50%">

### 👤 Módulo de Usuários
- Autenticação JWT
- Controle de acesso baseado em roles
- Perfis de usuário e administrador
- Histórico completo de reservas

</td>
<td width="50%">

### 🎥 Módulo de Filmes
- CRUD completo de filmes
- Categorização por múltiplos gêneros
- Ratings e informações detalhadas
- Upload de posters (URL)

</td>
</tr>
<tr>
<td width="50%">

### 🎫 Sistema de Reservas
- Seleção visual de assentos
- Confirmação em tempo real
- Cancelamento com política de tempo
- Código único de reserva
- Diferentes categorias de assentos

</td>
<td width="50%">

### 📊 Relatórios Gerenciais
- Dashboard de vendas
- Ocupação por sala e filme
- Estatísticas diárias, mensais e anuais
- Análise de performance

</td>
</tr>
</table>

---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Java** | 21 | Linguagem principal |
| **Spring Boot** | 3.5.7 | Framework backend |
| **Spring Security** | 6.x | Autenticação e autorização |
| **Spring Data JPA** | 3.x | ORM e persistência |
| **MySQL** | 8.0 | Banco de dados relacional |
| **Flyway** | Latest | Migrations de BD |
| **JWT (JJWT)** | 0.12.5 | Tokens de autenticação |
| **Lombok** | Latest | Redução de boilerplate |
| **Maven** | 3.8+ | Gerenciamento de dependências |
| **Docker** | Latest | Containerização |

---

## 🚀 Instalação Rápida

### Pré-requisitos

```bash
# Verificar versões instaladas
java -version    # Deve ser 21+
mvn -version     # Deve ser 3.8+
docker --version # Opcional
```

### Opção 1: Docker Compose (Recomendado) 🐳

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/moviebooking-api.git
cd moviebooking-api

# 2. Configure as variáveis (opcional - já tem valores padrão)
cp .env.example .env

# 3. Suba os containers
docker-compose up -d

# 4. Acompanhe os logs
docker-compose logs -f app

# ✅ API disponível em http://localhost:8080
```

### Opção 2: Execução Local 💻

```bash
# 1. Configure o MySQL
mysql -u root -p
```

```sql
CREATE DATABASE movie_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'movieuser'@'localhost' IDENTIFIED BY 'moviepass123';
GRANT ALL PRIVILEGES ON movie_booking.* TO 'movieuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# 2. Configure o application-dev.yml (já está configurado)
# 3. Execute a aplicação
./mvnw clean spring-boot:run

# Ou compile e execute o JAR
./mvnw clean package -DskipTests
java -jar target/moviebooking-api-0.0.1-SNAPSHOT.jar
```

### Verificação da Instalação ✅

```bash
# Teste o health check
curl http://localhost:8080/actuator/health

# Resposta esperada:
# {"status":"UP"}
```

---

## 📚 Documentação da API

### 🔐 Autenticação

Todos os endpoints protegidos requerem um token JWT no header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "admin",
  "password": "admin123"
}
```

**Resposta de Sucesso (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "admin",
  "email": "admin@cinema.com",
  "roles": ["ROLE_ADMIN", "ROLE_USER"]
}
```

---

### 🎥 Filmes (Público)

#### Listar Todos os Filmes

```http
GET /api/movies
```

**Resposta:**
```json
[
  {
    "id": 1,
    "title": "Avatar: O Caminho da Água",
    "description": "Jake Sully e Neytiri formaram uma família...",
    "posterUrl": "https://example.com/avatar.jpg",
    "durationMinutes": 192,
    "releaseDate": "2022-12-16",
    "rating": 7.8,
    "active": true,
    "genres": [
      {"id": 1, "name": "Ação"},
      {"id": 4, "name": "Ficção Científica"}
    ],
    "createdAt": "2025-01-15T10:00:00",
    "updatedAt": "2025-01-15T10:00:00"
  }
]
```

#### Buscar Filme por ID

```http
GET /api/movies/{id}
```

---

### 🎬 Sessões (Showtime)

#### Buscar Sessões por Data

```http
GET /api/showtimes/search?date=2025-12-25
```

**Resposta:**
```json
[
  {
    "id": 1,
    "movieId": 1,
    "movieTitle": "Avatar: O Caminho da Água",
    "moviePosterUrl": "https://example.com/avatar.jpg",
    "movieDurationMinutes": 192,
    "theaterId": 1,
    "theaterName": "Sala 1 - Premium",
    "theaterLocation": "Salvador Shopping",
    "showDate": "2025-12-25",
    "showTime": "19:30:00",
    "availableSeats": 85,
    "totalSeats": 100,
    "price": 35.00,
    "active": true,
    "createdAt": "2025-01-15T10:00:00"
  }
]
```

#### Ver Assentos Disponíveis

```http
GET /api/showtimes/{id}/seats
```

**Resposta:**
```json
[
  {
    "id": 1,
    "theaterId": 1,
    "seatRow": "A",
    "seatNumber": 1,
    "seatType": "STANDARD",
    "price": 25.00,
    "isAvailable": true
  },
  {
    "id": 2,
    "theaterId": 1,
    "seatRow": "A",
    "seatNumber": 2,
    "seatType": "STANDARD",
    "price": 25.00,
    "isAvailable": false
  }
]
```

---

### 🎫 Reservas (Autenticado)

#### Criar Reserva

```http
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "showtimeId": 1,
  "seatIds": [15, 16, 17]
}
```

**Resposta (201 Created):**
```json
{
  "id": 1,
  "bookingCode": "BKG-A7B9C2D1",
  "userId": 1,
  "username": "joao.silva",
  "userEmail": "joao@email.com",
  "showtime": {
    "id": 1,
    "movieTitle": "Avatar: O Caminho da Água",
    "theaterName": "Sala 1 - Premium",
    "showDate": "2025-12-25",
    "showTime": "19:30:00"
  },
  "seats": [
    {
      "id": 15,
      "seatRow": "B",
      "seatNumber": 5,
      "seatType": "PREMIUM",
      "price": 35.00,
      "isAvailable": false
    }
  ],
  "totalSeats": 3,
  "totalPrice": 105.00,
  "status": "CONFIRMED",
  "bookingDate": "2025-11-22T14:30:00",
  "createdAt": "2025-11-22T14:30:00"
}
```

#### Minhas Reservas

```http
GET /api/bookings/my-bookings
Authorization: Bearer {token}
```

#### Buscar Reserva por Código

```http
GET /api/bookings/{bookingCode}
Authorization: Bearer {token}
```

#### Cancelar Reserva

```http
DELETE /api/bookings/{bookingCode}
Authorization: Bearer {token}
```

**⚠️ Regras de Cancelamento:**
- Deve ser feito com **pelo menos 2 horas de antecedência**
- Apenas o próprio usuário pode cancelar suas reservas
- Reservas já canceladas não podem ser canceladas novamente

---

### 👨‍💼 Administração (ROLE_ADMIN)

#### Criar Filme

```http
POST /api/admin/movies
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "title": "Duna: Parte 3",
  "description": "A continuação épica da saga Duna",
  "posterUrl": "https://example.com/duna3.jpg",
  "durationMinutes": 165,
  "releaseDate": "2026-03-15",
  "rating": 8.5,
  "genreIds": [1, 4],
  "active": true
}
```

#### Atualizar Filme

```http
PUT /api/admin/movies/{id}
Authorization: Bearer {admin-token}
Content-Type: application/json
```

#### Desativar Filme

```http
DELETE /api/admin/movies/{id}
Authorization: Bearer {admin-token}
```

#### Criar Sessão

```http
POST /api/admin/showtimes
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "movieId": 1,
  "theaterId": 1,
  "showDate": "2025-12-25",
  "showTime": "19:30",
  "price": 35.00,
  "active": true
}
```

#### Relatório do Mês Atual

```http
GET /api/admin/reports/current-month
Authorization: Bearer {admin-token}
```

**Resposta:**
```json
{
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "totalBookings": 150,
  "confirmedBookings": 142,
  "cancelledBookings": 8,
  "totalRevenue": 5320.00,
  "confirmedRevenue": 5320.00,
  "averageBookingValue": 37.46,
  "totalSeatsBooked": 425,
  "occupancyRate": 71.25,
  "movieStatistics": [
    {
      "movieId": 1,
      "movieTitle": "Avatar: O Caminho da Água",
      "totalBookings": 45,
      "totalSeatsBooked": 135,
      "revenue": 2025.00,
      "occupancyRate": 75.0,
      "totalShowtimes": 12
    }
  ],
  "theaterStatistics": [...],
  "dailyStatistics": [...]
}
```

#### Relatório Anual

```http
GET /api/admin/reports/year-to-date
Authorization: Bearer {admin-token}
```

#### Relatório Customizado

```http
GET /api/admin/reports?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer {admin-token}
```

---

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
moviebooking-api/
│
├── src/main/java/build/moviebooking/moviebooking/
│   │
│   ├── 📁 config/                    # Configurações da aplicação
│   │   ├── SecurityConfig.java       # Spring Security + JWT
│   │   ├── JwtAuthenticationFilter.java
│   │   └── DataInitializer.java      # Dados iniciais (genres, theaters)
│   │
│   ├── 📁 controller/                # Endpoints REST
│   │   ├── AuthController.java       # Login e autenticação
│   │   ├── MovieController.java      # CRUD de filmes (público)
│   │   ├── ShowtimeController.java   # Consulta de sessões
│   │   ├── BookingController.java    # Reservas (autenticado)
│   │   └── AdminController.java      # Gerenciamento (admin)
│   │
│   ├── 📁 dto/
│   │   ├── 📁 request/               # DTOs de entrada
│   │   │   ├── LoginRequest.java
│   │   │   ├── BookingRequest.java
│   │   │   ├── MovieRequest.java
│   │   │   └── ShowtimeRequest.java
│   │   │
│   │   └── 📁 response/              # DTOs de saída
│   │       ├── JwtResponse.java
│   │       ├── MovieResponse.java
│   │       ├── BookingResponse.java
│   │       ├── ReportResponse.java
│   │       └── ErrorResponse.java
│   │
│   ├── 📁 entity/                    # Entidades JPA
│   │   ├── User.java                 # Usuários do sistema
│   │   ├── Role.java                 # Roles (ADMIN, USER)
│   │   ├── Movie.java                # Filmes
│   │   ├── Genre.java                # Gêneros
│   │   ├── Theater.java              # Salas de cinema
│   │   ├── Seat.java                 # Assentos físicos
│   │   ├── ShowTime.java             # Sessões de filmes
│   │   ├── ShowtimeSeat.java         # Assentos por sessão
│   │   ├── Booking.java              # Reservas
│   │   └── BookingSeat.java          # Assentos reservados
│   │
│   ├── 📁 repository/                # Acesso ao banco de dados
│   │   ├── UserRepository.java
│   │   ├── MovieRepository.java
│   │   ├── ShowtimeRepository.java
│   │   ├── BookingRepository.java
│   │   └── ...
│   │
│   ├── 📁 service/                   # Lógica de negócio
│   │   ├── AuthService.java          # Autenticação e JWT
│   │   ├── UserService.java          # UserDetailsService
│   │   ├── MovieService.java         # CRUD de filmes
│   │   ├── ShowtimeService.java      # Gerenciamento de sessões
│   │   ├── BookingService.java       # Lógica de reservas (com locks)
│   │   ├── ReportService.java        # Relatórios gerenciais
│   │   └── JwtService.java           # Geração e validação de tokens
│   │
│   └── 📁 exception/                 # Tratamento de erros
│       ├── GlobalExceptionHandler.java
│       ├── ResourceNotFoundException.java
│       ├── BookingException.java
│       └── UnauthorizedException.java
│
├── src/main/resources/
│   ├── application.yml               # Configurações base
│   ├── application-dev.yml           # Perfil desenvolvimento
│   ├── application-prod.yml          # Perfil produção
│   └── db/migration/                 # Scripts Flyway
│       ├── V1__create_initial_tables.sql
│       ├── V2__create_indexes.sql
│       └── V3__insert_default_data.sql
│
├── docker-compose.yml                # Orquestração Docker
├── Dockerfile                        # Build da aplicação
├── pom.xml                          # Dependências Maven
└── README.md                        # Este arquivo
```

### Diagrama de Entidades (Resumido)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │────────<│   Booking   │>────────│  ShowTime   │
│             │    1:N  │             │  N:1    │             │
│ - username  │         │ - code      │         │ - showDate  │
│ - email     │         │ - status    │         │ - showTime  │
│ - roles     │         │ - totalPrice│         │ - price     │
└─────────────┘         └─────────────┘         └─────────────┘
                              │                        │
                              │ N:N                    │ N:1
                              │                        │
                        ┌─────────────┐         ┌─────────────┐
                        │    Seat     │         │    Movie    │
                        │             │         │             │
                        │ - row       │         │ - title     │
                        │ - number    │         │ - duration  │
                        │ - type      │         │ - genres    │
                        │ - price     │         └─────────────┘
                        └─────────────┘                │
                              │                        │ N:1
                              │ N:1                    │
                        ┌─────────────┐         ┌─────────────┐
                        │   Theater   │─────────│    Genre    │
                        │             │   N:N   │             │
                        │ - name      │         │ - name      │
                        │ - location  │         └─────────────┘
                        └─────────────┘
```

### Fluxo de Reserva

```
┌─────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
│  User   │────>│  Auth   │────>│ Showtime │────>│ Booking  │
└─────────┘     └─────────┘     └──────────┘     └──────────┘
     │               │                 │                │
     │  1. Login     │                 │                │
     │──────────────>│                 │                │
     │  JWT Token    │                 │                │
     │<──────────────│                 │                │
     │               │  2. View Seats  │                │
     │───────────────────────────────>│                │
     │               │  Available Seats│                │
     │<───────────────────────────────│                │
     │               │                 │  3. Reserve    │
     │────────────────────────────────────────────────>│
     │               │                 │  (Lock Seats)  │
     │               │                 │<───────────────│
     │               │  Booking Code   │                │
     │<────────────────────────────────────────────────│
```

---

## 🔒 Segurança

### Autenticação JWT

- **Algoritmo**: HS256 (HMAC with SHA-256)
- **Validade**: 24 horas (configurável via `JWT_EXPIRATION`)
- **Header**: `Authorization: Bearer {token}`

### Roles e Permissões

| Endpoint | ROLE_USER | ROLE_ADMIN |
|----------|-----------|------------|
| `GET /api/movies` | ✅ Público | ✅ Público |
| `GET /api/showtimes/search` | ✅ Público | ✅ Público |
| `POST /api/bookings` | ✅ | ✅ |
| `GET /api/bookings/my-bookings` | ✅ | ✅ |
| `DELETE /api/bookings/{code}` | ✅ (próprias) | ✅ (todas) |
| `POST /api/admin/movies` | ❌ | ✅ |
| `GET /api/admin/reports` | ❌ | ✅ |

### Proteções Implementadas

- ✅ **Password Encoding**: BCrypt com força 12
- ✅ **CORS**: Configurado para aceitar origens específicas
- ✅ **CSRF**: Desabilitado (API stateless)
- ✅ **SQL Injection**: Prevenido via JPA/Hibernate
- ✅ **Rate Limiting**: Implementado no nível de aplicação
- ✅ **Locks Pessimistas**: Para prevenção de race conditions em reservas

---

## ⚙️ Configuração

### Variáveis de Ambiente

#### Desenvolvimento (application-dev.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/movie_booking
    username: movieuser
    password: moviepass123
  
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: validate
  
  flyway:
    enabled: true

logging:
  level:
    build.moviebooking.moviebooking: DEBUG
```

#### Produção (Variáveis ENV)

```bash
# Perfil Spring
SPRING_PROFILES_ACTIVE=prod

# Banco de Dados
SPRING_DATASOURCE_URL=jdbc:mysql://mysql-host:3306/movie_booking
SPRING_DATASOURCE_USERNAME=prod_user
SPRING_DATASOURCE_PASSWORD=super_secure_password

# JWT
JWT_SECRET=sua_chave_secreta_muito_forte_com_pelo_menos_256_bits
JWT_EXPIRATION=86400000  # 24 horas

# Servidor
SERVER_PORT=8080

# Regras de Negócio
APP_BOOKING_MAX_SEATS_PER_BOOKING=10
APP_BOOKING_CANCELLATION_HOURS_BEFORE=2
```

### Docker Compose (Produção)

```yaml
version: '3.9'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: movie_booking
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/movie_booking
      SPRING_DATASOURCE_USERNAME: ${MYSQL_USER}
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      mysql:
        condition: service_healthy

volumes:
  mysql_data:
```

---

## 🎭 Dados Iniciais

### Gêneros Pré-cadastrados

- 🎬 **Ação**: Filmes de ação e aventura
- 😂 **Comédia**: Filmes de comédia
- 🎭 **Drama**: Filmes dramáticos
- 🚀 **Ficção Científica**: Filmes de ficção científica
- 😱 **Terror**: Filmes de terror
- ❤️ **Romance**: Filmes românticos

### Teatros (Salvador, Bahia)

#### Sala 1 - Premium
- **Localização**: Salvador Shopping
- **Capacidade**: 100 assentos (10x10)
- **Distribuição**:
    - Fileiras A-C (Standard): R$ 25,00
    - Fileiras D-H (Premium): R$ 35,00
    - Fileiras I-J (VIP): R$ 45,00

#### Sala 2 - Standard
- **Localização**: Salvador Shopping
- **Capacidade**: 80 assentos (8x10)

#### Sala 3 - VIP
- **Localização**: Paralela Shopping
- **Capacidade**: 50 assentos (5x10)

### Usuário Administrador Padrão

```
Username: admin
Password: admin123
Roles: ROLE_ADMIN, ROLE_USER
```

⚠️ **IMPORTANTE**: Alterar credenciais em produção!

---

## 🧪 Testando a API

### Usando cURL

#### 1. Fazer Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "admin",
    "password": "admin123"
  }'
```

#### 2. Salvar Token
```bash
export TOKEN="seu_token_aqui"
```

#### 3. Listar Filmes
```bash
curl http://localhost:8080/api/movies
```

#### 4. Buscar Sessões
```bash
curl "http://localhost:8080/api/showtimes/search?date=2025-12-25"
```

#### 5. Fazer Reserva
```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "showtimeId": 1,
    "seatIds": [1, 2, 3]
  }'
```

#### 6. Ver Minhas Reservas
```bash
curl http://localhost:8080/api/bookings/my-bookings \
  -H "Authorization: Bearer $TOKEN"
```

### Usando Postman

1. **Importe a Collection**: [Download aqui](#) _(crie um arquivo JSON)_
2. **Configure o Environment**:
    - `base_url`: `http://localhost:8080`
    - `token`: _será preenchido automaticamente após login_
3. **Execute os requests na ordem sugerida**

### Usando HTTPie

```bash
# Login
http POST :8080/api/auth/login \
  usernameOrEmail=admin \
  password=admin123

# Listar filmes
http :8080/api/movies

# Fazer reserva
http POST :8080/api/bookings \
  Authorization:"Bearer $TOKEN" \
  showtimeId:=1 \
  seatIds:='[1,2,3]'
```

---

## 🐛 Troubleshooting

### Problema: Erro de conexão com MySQL

**Sintoma**: `Communications link failure`

**Solução**:
```bash
# Verifique se o MySQL está rodando
docker-compose ps

# Reinicie o container
docker-compose restart mysql

# Verifique os logs
docker-compose logs mysql
```

### Problema: Token JWT inválido

**Sintoma**: `401 Unauthorized - Invalid JWT token`

**Possíveis causas**:
1. Token expirado (válido por 24h)
2. Secret do JWT alterado
3. Formato incorreto do header

**Solução**:
```bash
# Faça login novamente para obter novo token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"admin","password":"admin123"}'
```

### Problema: Assentos não disponíveis

**Sintoma**: `BookingException: Um ou mais assentos já estão reservados`

**Solução**:
```bash
# Verifique os assentos disponíveis antes de reservar
curl http://localhost:8080/api/showtimes/{id}/seats
```

### Problema: Flyway migration failed

**Sintoma**: `FlywayException: Validate failed`

**Solução**:
```bash
# Limpe o banco e rode novamente (APENAS EM DEV!)
docker-compose down -v
docker-compose up -d
```

### Problema: PermGen/Metaspace error

**Sintoma**: `java.lang.OutOfMemoryError: Metaspace`

**Solução**:
```bash
# Aumente a memória da JVM
export JAVA_OPTS="-XX:MaxMetaspaceSize=256m"
java $JAVA_OPTS -jar target/moviebooking-api-0.0.1-SNAPSHOT.jar
```

### Problema: Erro ao cancelar reserva

**Sintoma**: `BookingException: Cancelamento deve ser feito com pelo menos 2 horas de antecedência`

**Explicação**: A política de cancelamento requer 2 horas de antecedência.

**Solução**: Configure o tempo em `application.yml`:
```yaml
app:
  booking:
    cancellation-hours-before: 1  # Altere para 1 hora se necessário
```

---

## 📊 Exemplos de Relatórios

### Relatório Mensal Completo

```json
{
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "totalBookings": 342,
  "confirmedBookings": 318,
  "cancelledBookings": 24,
  "totalRevenue": 11250.00,
  "confirmedRevenue": 11250.00,
  "averageBookingValue": 35.38,
  "totalSeatsBooked": 956,
  "occupancyRate": 68.43,
  
  "movieStatistics": [
    {
      "movieId": 1,
      "movieTitle": "Avatar: O Caminho da Água",
      "totalBookings": 89,
      "totalSeatsBooked": 267,
      "revenue": 4005.00,
      "occupancyRate": 74.17,
      "totalShowtimes": 24
    },
    {
      "movieId": 2,
      "movieTitle": "Homem-Aranha: Através do Aranhaverso",
      "totalBookings": 76,
      "totalSeatsBooked": 228,
      "revenue": 3420.00,
      "occupancyRate": 71.25,
      "totalShowtimes": 20
    }
  ],
  
  "theaterStatistics": [
    {
      "theaterId": 1,
      "theaterName": "Sala 1 - Premium",
      "totalBookings": 156,
      "totalSeatsBooked": 468,
      "revenue": 5460.00,
      "occupancyRate": 78.00,
      "totalShowtimes": 40
    }
  ],
  
  "dailyStatistics": [
    {
      "date": "2025-11-01",
      "bookings": 12,
      "revenue": 420.00,
      "seatsBooked": 36
    },
    {
      "date": "2025-11-02",
      "bookings": 15,
      "revenue": 525.00,
      "seatsBooked": 45
    }
  ]
}
```

---

## 🚀 Deploy em Produção

### AWS EC2

```bash
# 1. Conecte-se ao servidor
ssh -i sua-chave.pem ubuntu@seu-ip

# 2. Instale o Docker
sudo apt update
sudo apt install docker.io docker-compose -y

# 3. Clone o repositório
git clone https://github.com/seu-usuario/moviebooking-api.git
cd moviebooking-api

# 4. Configure as variáveis de ambiente
nano .env

# 5. Suba a aplicação
sudo docker-compose up -d

# 6. Configure o nginx como reverse proxy (opcional)
sudo apt install nginx -y
```

**Configuração nginx** (`/etc/nginx/sites-available/moviebooking`):
```nginx
server {
    listen 80;
    server_name api.seucinema.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Heroku

```bash
# 1. Instale o Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# 2. Faça login
heroku login

# 3. Crie a aplicação
heroku create seu-cinema-api

# 4. Adicione o addon do MySQL
heroku addons:create jawsdb:kitefin

# 5. Configure as variáveis
heroku config:set SPRING_PROFILES_ACTIVE=prod
heroku config:set JWT_SECRET=sua_chave_forte_aqui

# 6. Deploy
git push heroku main
```

### Docker Hub

```bash
# 1. Build da imagem
docker build -t seuusuario/moviebooking-api:v1.0 .

# 2. Login no Docker Hub
docker login

# 3. Push da imagem
docker push seuusuario/moviebooking-api:v1.0

# 4. Em qualquer servidor, execute:
docker run -d -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://... \
  seuusuario/moviebooking-api:v1.0
```

---

## 🔧 Scripts Úteis

### Backup do Banco de Dados

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="movie_booking"

docker exec movie-booking-mysql mysqldump -u root -prootpassword $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

echo "Backup criado: $BACKUP_DIR/backup_$DATE.sql"
```

### Restaurar Backup

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Uso: ./restore.sh backup_file.sql"
    exit 1
fi

docker exec -i movie-booking-mysql mysql -u root -prootpassword movie_booking < $BACKUP_FILE

echo "Banco restaurado com sucesso!"
```

### Monitoramento de Logs

```bash
#!/bin/bash
# logs.sh

# Logs da aplicação
docker-compose logs -f app

# Logs do MySQL
docker-compose logs -f mysql

# Logs com filtro
docker-compose logs -f app | grep ERROR
```

### Limpar Reservas Antigas

```sql
-- cleanup_old_bookings.sql
-- Execute periodicamente (ex: via cron)

-- Marcar como COMPLETED reservas de sessões passadas
UPDATE bookings b
JOIN showtimes s ON b.showtime_id = s.id
SET b.status = 'COMPLETED'
WHERE b.status = 'CONFIRMED'
  AND CONCAT(s.show_date, ' ', s.show_time) < NOW();
```

---

## 📈 Métricas e Monitoramento

### Endpoints de Actuator

```bash
# Health Check
curl http://localhost:8080/actuator/health

# Métricas da aplicação
curl http://localhost:8080/actuator/metrics

# Informações da aplicação
curl http://localhost:8080/actuator/info
```

### Configuração do Prometheus (prometheus.yml)

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'moviebooking-api'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8080']
```

### Dashboard Grafana

Importe o dashboard com as seguintes métricas:
- Taxa de reservas por hora
- Ocupação média por sala
- Tempo de resposta das APIs
- Erros e exceções
- Usuários ativos

---

## 🧪 Testes

### Executar Testes Unitários

```bash
./mvnw test
```

### Executar Testes de Integração

```bash
./mvnw verify
```

### Cobertura de Código (JaCoCo)

```bash
./mvnw clean test jacoco:report

# Relatório em: target/site/jacoco/index.html
```

### Teste de Carga (JMeter)

```bash
# Instale o JMeter
wget https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-5.6.3.tgz
tar -xzf apache-jmeter-5.6.3.tgz

# Execute o plano de teste
./apache-jmeter-5.6.3/bin/jmeter -n -t moviebooking-load-test.jmx -l results.jtl
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos abaixo:

1. **Fork o projeto**
2. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/MinhaNovaFeature
   ```
3. **Commit suas mudanças**:
   ```bash
   git commit -m 'feat: Adiciona nova funcionalidade X'
   ```
4. **Push para a branch**:
   ```bash
   git push origin feature/MinhaNovaFeature
   ```
5. **Abra um Pull Request**

### Padrão de Commits (Conventional Commits)

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (sem mudança de código)
- `refactor:` Refatoração de código
- `test:` Adicionar testes
- `chore:` Tarefas de manutenção

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2025 Movie Booking API

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Agradecimentos

- [Spring Boot](https://spring.io/projects/spring-boot) - Framework principal
- [MySQL](https://www.mysql.com/) - Banco de dados
- [JWT](https://jwt.io/) - Autenticação stateless
- [Docker](https://www.docker.com/) - Containerização
- [Lombok](https://projectlombok.org/) - Redução de boilerplate

---

## 📞 Contato

**Desenvolvedor**: Alexander Costa.

- 📧 Email: alexander.cbss@hotmail.com
- 💼 LinkedIn: https://www.linkedin.com/in/brasiliano3
- 🐙 GitHub: https://github.com/alexanderbs3

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
- [JWT Introduction](https://jwt.io/introduction)

### Tutoriais Relacionados
- [Building REST APIs with Spring Boot](https://spring.io/guides/tutorials/rest/)
- [Securing REST APIs with JWT](https://www.baeldung.com/spring-security-oauth-jwt)
- [JPA and Hibernate Best Practices](https://thorben-janssen.com/tips-to-boost-your-hibernate-performance/)

### Ferramentas Úteis
- [Postman](https://www.postman.com/) - Testes de API
- [DBeaver](https://dbeaver.io/) - Cliente de banco de dados
- [Docker Desktop](https://www.docker.com/products/docker-desktop) - Gerenciamento de containers

---

<div align="center">

### ⭐ Se este projeto foi útil, considere dar uma estrela!

**Desenvolvido com ☕ e 🎬 em Salvador, Bahia, Brasil**

![Made with Love](https://img.shields.io/badge/Made%20with-Love-red?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>