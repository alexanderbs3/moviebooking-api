package build.moviebooking.moviebooking.service;

import build.moviebooking.moviebooking.dto.request.MovieRequest;
import build.moviebooking.moviebooking.dto.response.GenreResponse;
import build.moviebooking.moviebooking.dto.response.MovieResponse;
import build.moviebooking.moviebooking.entity.Genre;
import build.moviebooking.moviebooking.entity.Movie;
import build.moviebooking.moviebooking.repository.GenreRepository;
import build.moviebooking.moviebooking.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class MovieService {
    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;

    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAllActiveWithGenres().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Filme não encontrado"));
        return convertToResponse(movie);
    }

    @Transactional
    public MovieResponse createMovie(MovieRequest request) {
        Set<Genre> genres = request.genreIds().stream()
                .map(id -> genreRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Gênero não encontrado: " + id)))
                .collect(Collectors.toSet());

        Movie movie = Movie.builder()
                .title(request.title())
                .description(request.description())
                .posterUrl(request.posterUrl())
                .durationMinutes(request.durationMinutes())
                .releaseDate(request.releaseDate())
                .rating(request.rating())
                .active(request.active())
                .genres(genres)
                .build();

        return convertToResponse(movieRepository.save(movie));
    }

    @Transactional
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Filme não encontrado"));

        movie.setTitle(request.title());
        movie.setDescription(request.description());
        movie.setPosterUrl(request.posterUrl());
        movie.setDurationMinutes(request.durationMinutes());
        movie.setReleaseDate(request.releaseDate());
        movie.setRating(request.rating());
        movie.setActive(request.active());

        if (request.genreIds() != null) {
            Set<Genre> genres = request.genreIds().stream()
                    .map(gId -> genreRepository.findById(gId)
                            .orElseThrow(() -> new RuntimeException("Gênero não encontrado")))
                    .collect(Collectors.toSet());
            movie.setGenres(genres);
        }

        return convertToResponse(movieRepository.save(movie));
    }

    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Filme não encontrado"));
        movie.setActive(false);
        movieRepository.save(movie);
    }

    private MovieResponse convertToResponse(Movie movie) {
        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .posterUrl(movie.getPosterUrl())
                .durationMinutes(movie.getDurationMinutes())
                .releaseDate(movie.getReleaseDate())
                .rating(movie.getRating())
                .active(movie.getActive())
                .genres(movie.getGenres().stream()
                        .map(g -> GenreResponse.builder()
                                .id(g.getId())
                                .name(g.getName())
                                .description(g.getDescription())
                                .build())
                        .collect(Collectors.toSet()))
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .build();
    }
}
