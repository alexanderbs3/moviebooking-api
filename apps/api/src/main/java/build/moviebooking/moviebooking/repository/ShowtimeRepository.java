package build.moviebooking.moviebooking.repository;

import build.moviebooking.moviebooking.entity.ShowTime;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShowtimeRepository extends JpaRepository<ShowTime, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ShowTime s WHERE s.id = :id")
    Optional<ShowTime> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT s FROM ShowTime s WHERE s.movie.id = :movieId AND s.showDate = :date AND s.active = true")
    List<ShowTime> findByMovieIdAndDate(@Param("movieId") Long movieId, @Param("date") LocalDate date);

    @Query("SELECT s FROM ShowTime s WHERE s.showDate = :date AND s.active = true")
    List<ShowTime> findByDate(@Param("date") LocalDate date);

    @Query("SELECT s FROM ShowTime s WHERE s.showDate >= :startDate AND s.showDate <= :endDate AND s.active = true")
    List<ShowTime> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
