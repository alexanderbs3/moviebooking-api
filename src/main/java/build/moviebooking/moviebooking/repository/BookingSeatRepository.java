package build.moviebooking.moviebooking.repository;

import build.moviebooking.moviebooking.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat,Long> {
    List<BookingSeat> findByBookingId(Long bookingId);
}
