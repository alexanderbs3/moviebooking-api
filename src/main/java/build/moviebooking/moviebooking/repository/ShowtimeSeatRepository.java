package build.moviebooking.moviebooking.repository;

import build.moviebooking.moviebooking.entity.ShowtimeSeat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ShowtimeSeatRepository extends JpaRepository<ShowtimeSeat,Long> {

    @Query("SELECT ss FROM ShowtimeSeat ss WHERE ss.showtime.id = :showtimeId")
    List<ShowtimeSeat> findByShowtimeId(Long showtimeId);

    @Query("SELECT ss FROM ShowtimeSeat ss WHERE ss.showtime.id = :showtimeId AND ss.isAvailable = true")
    List<ShowtimeSeat> findAvailableSeatsByShowtime(Long showtimeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ss FROM ShowtimeSeat ss WHERE ss.showtime.id = :showtimeId AND ss.seat.id IN :seatIds")
    List<ShowtimeSeat> findByShowtimeIdAndSeatIdsWithLock(Long showtimeId, List<Long> seatIds);

    @Query("SELECT COUNT(ss) FROM ShowtimeSeat ss WHERE ss.showtime.id = :showtimeId AND ss.isAvailable = true")
    Long countAvailableSeatsByShowtime(Long showtimeId);
}
