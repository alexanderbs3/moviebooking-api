package build.moviebooking.moviebooking.repository;

import build.moviebooking.moviebooking.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat,Long> {

    List<Seat> findByTheaterId(Long theaterId);

    @Query("SELECT s FROM Seat s WHERE s.theater.id = :theaterId ORDER BY s.seatRow, s.seatnumber")
    List<Seat> findByTheaterIdOrderBySeatRowAndNumber(Long theaterId);
}
