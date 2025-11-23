package build.moviebooking.moviebooking.repository;

import build.moviebooking.moviebooking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByUserId(Long userId);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status = 'CONFIRMED' ORDER BY b.bookingDate DESC")
    List<Booking> findActiveBookingsByUserId(Long userId);

    @Query("SELECT b FROM Booking b WHERE b.showtime.id = :showtimeId")
    List<Booking> findByShowtimeId(Long showtimeId);

    @Query("SELECT b FROM Booking b WHERE b.bookingDate >= :startDate AND b.bookingDate <= :endDate")
    List<Booking> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.showtime.id = :showtimeId AND b.status = 'CONFIRMED'")
    Long countConfirmedBookingsByShowtime(Long showtimeId);
}
