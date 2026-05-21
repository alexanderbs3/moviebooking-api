package build.moviebooking.moviebooking.repository;

import build.moviebooking.moviebooking.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie,Long> {
    List<Movie> findByActiveTrue();

    @Query("SELECT DISTINCT m FROM Movie m JOIN FETCH m.genres WHERE m.active = true")
    List<Movie> findAllActiveWithGenres();

    @Query("SELECT m FROM Movie m JOIN m.genres g WHERE g.id = :genreId AND m.active = true")
    List<Movie> findByGenreId(Long genreId);
}
