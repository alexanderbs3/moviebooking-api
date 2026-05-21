package build.moviebooking.moviebooking.config;

import build.moviebooking.moviebooking.entity.Genre;
import build.moviebooking.moviebooking.entity.Theater;
import build.moviebooking.moviebooking.entity.Seat;
import build.moviebooking.moviebooking.repository.GenreRepository;
import build.moviebooking.moviebooking.repository.TheaterRepository;
import build.moviebooking.moviebooking.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            GenreRepository genreRepository,
            TheaterRepository theaterRepository,
            SeatRepository seatRepository) {

        return args -> {
            // Criar Gêneros se não existirem
            if (genreRepository.count() == 0) {
                log.info("Criando gêneros iniciais...");

                genreRepository.save(Genre.builder()
                        .name("Ação")
                        .description("Filmes de ação e aventura")
                        .build());

                genreRepository.save(Genre.builder()
                        .name("Comédia")
                        .description("Filmes de comédia")
                        .build());

                genreRepository.save(Genre.builder()
                        .name("Drama")
                        .description("Filmes dramáticos")
                        .build());

                genreRepository.save(Genre.builder()
                        .name("Ficção Científica")
                        .description("Filmes de ficção científica")
                        .build());

                genreRepository.save(Genre.builder()
                        .name("Terror")
                        .description("Filmes de terror")
                        .build());

                genreRepository.save(Genre.builder()
                        .name("Romance")
                        .description("Filmes românticos")
                        .build());

                log.info("✅ Gêneros criados com sucesso!");
            }

            // Criar Teatros se não existirem
            if (theaterRepository.count() == 0) {
                log.info("Criando teatros iniciais...");

                Theater theater1 = theaterRepository.save(Theater.builder()
                        .name("Sala 1 - Premium")
                        .location("Salvador Shopping")
                        .totalSeats(100)
                        .build());

                Theater theater2 = theaterRepository.save(Theater.builder()
                        .name("Sala 2 - Standard")
                        .location("Salvador Shopping")
                        .totalSeats(80)
                        .build());

                Theater theater3 = theaterRepository.save(Theater.builder()
                        .name("Sala 3 - VIP")
                        .location("Paralela Shopping")
                        .totalSeats(50)
                        .build());

                log.info("✅ Teatros criados com sucesso!");

                // Criar assentos para cada teatro
                log.info("Criando assentos...");
                createSeatsForTheater(theater1, 10, 10, seatRepository); // 10 filas x 10 assentos
                createSeatsForTheater(theater2, 8, 10, seatRepository);  // 8 filas x 10 assentos
                createSeatsForTheater(theater3, 5, 10, seatRepository);  // 5 filas x 10 assentos
                log.info("✅ Assentos criados com sucesso!");
            }

            log.info("🎬 Sistema inicializado com sucesso!");
        };
    }

    private void createSeatsForTheater(Theater theater, int rows, int seatsPerRow, SeatRepository seatRepository) {
        String[] rowLetters = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J"};

        for (int i = 0; i < rows; i++) {
            for (int j = 1; j <= seatsPerRow; j++) {
                Seat.SeatType seatType = Seat.SeatType.STANDARD;
                BigDecimal price = new BigDecimal("25.00");

                // Fileiras traseiras são VIP
                if (i >= rows - 2) {
                    seatType = Seat.SeatType.VIP;
                    price = new BigDecimal("45.00");
                }
                // Fileiras do meio são Premium
                else if (i >= 3 && i < rows - 2) {
                    seatType = Seat.SeatType.PREMIUM;
                    price = new BigDecimal("35.00");
                }

                seatRepository.save(Seat.builder()
                        .theater(theater)
                        .seatRow(rowLetters[i])
                        .seatnumber(j)
                        .seatType(seatType)
                        .price(price)
                        .build());
            }
        }
    }
}