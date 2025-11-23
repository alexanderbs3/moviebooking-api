package build.moviebooking.moviebooking.repository;

import build.moviebooking.moviebooking.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TheaterRepository extends JpaRepository<Theater,Long> {
    Optional<Theater> findByName(String name);

    @Query("SELECT t FROM Theater t ORDER BY t.name")
    List<Theater> findAllOrderByName();

    @Query("SELECT t FROM Theater t WHERE t.location = :location")
    List<Theater> findByLocation(String location);

    @Query("SELECT COUNT(t) FROM Theater t")
    Long countTheaters();
}
