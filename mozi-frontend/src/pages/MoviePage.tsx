import {
  Button,
  Card,
  CardActions,
  CardContent,
  Fab,
  Grid,
  InputLabel,
  Rating,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertType, Movie, ReviewListReview } from "../api/types";
import AlertComponent from "../components/AlertComponent";
import MoviePageCard from "../components/cards/MoviePageCard";
import MovieDeleteDialog from "../components/dialogs/MovieDeleteDialog";
import ReviewDeleteDialog from "../components/dialogs/ReviewDeleteDialog";
import MovieEditModal from "../components/modals/MovieEditModal";
import ReviewEditModal from "../components/modals/ReviewEditModal";
import NavigationBar from "../components/NavigationBar";
import ScrollTop from "../components/ScrollTop";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ReviewCard from "../components/cards/ReviewCard";
import { useTranslation } from "react-i18next";
import LoadingComponent from "../components/LoadingComponent";
import { useSessionContext } from "../api/SessionContext";
import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";

const GET_MOVIE_BY_ID = gql`
  query GetMovieById($input: MovieInput!) {
    getMovieById(input: $input) {
      id
      title
      poster
      description
      release_date
      rating
      category {
        id
      }
    }
  }
`;

const GET_REVIEWS_OF_MOVIE = gql`
  query GetReviewsOfMovie($input: GetReviewsOfMovieInput!) {
    getReviewsOfMovie(input: $input) {
      id
      rating
      description
      movie {
        id
      }
      user {
        first_name
        last_name
        id
      }
    }
  }
`;

const GET_USERS_REVIEWS_OF_MOVIE = gql`
  query GetReviewsOfUserForMovie($input: GetReviewsOfUserForMovieInput!) {
    getReviewsOfUserForMovie(input: $input) {
      id
      rating
      description
      movie {
        id
      }
      user {
        first_name
        last_name
        id
      }
    }
  }
`;

const ADD_REVIEW = gql`
  mutation CreateReview($input: AddReviewInput!) {
    createReview(input: $input) {
      id
      rating
      description
      movie {
        id
      }
      user {
        first_name
        last_name
        id
      }
    }
  }
`;

export default function MoviePage() {
  const { currmovie_id } = useParams();
  const navigate = useNavigate();
  const context = useSessionContext();
  const currUser = context.user!;
  const [AddReviewAPI] = useMutation(ADD_REVIEW);
  const client = useApolloClient()

  
  const { data: movieReviewsData, loading: movieReviewsLoading } = useQuery(
    GET_REVIEWS_OF_MOVIE,
    { variables: {input:{ movie_id: currmovie_id}} }
  );
  const { data: movieData, loading: movieLoading } = useQuery(GET_MOVIE_BY_ID, {
    variables: {input:{ id: currmovie_id }},
  });
  const { data: userReviewsData, loading: userReviewsLoading } = useQuery(
    GET_USERS_REVIEWS_OF_MOVIE, { variables: {input:{ movie_id: currmovie_id, user_id: currUser.id }} }
  );
  
  const { t } = useTranslation();

  const [editingMovie, setEditingMovie] = useState<Movie | undefined>(
    undefined
  );
  const [deletingMovie, setDeletingMovie] = useState<Movie | undefined>(
    undefined
  );
  const [editingReview, setEditingReview] = useState<
    ReviewListReview | undefined
  >(undefined);
  const [deletingReview, setDeletingReview] = useState<
    ReviewListReview | undefined
  >(undefined);

  const [alert, setAlert] = useState<AlertType>({
    isOpen: false,
    message: "",
    type: undefined,
  });
  const [ratingDescription, setRatingDescription] = useState("");
  const [value, setValue] = useState<number | null>(0);

  async function refetchData() {
    await client.refetchQueries({
      include: [GET_REVIEWS_OF_MOVIE,GET_USERS_REVIEWS_OF_MOVIE,GET_MOVIE_BY_ID]
    })
  }

  useEffect(() => {
    if (!currUser) navigate("/login");
  }, []);

  useEffect(() => {
    if (alert.message === "Movie was deleted successfully!") {
      navigate("/");
    }
    if(alert.isOpen && alert.type === "success"){
      refetchData()
    }
  }, [alert.message]);

  const handleAddReview = async () => {
    const movie_id = currmovie_id;
    let rating;
    if (value) {
      rating = value.toString();
    } else rating = "0";
    const description = ratingDescription;
    if (currUser) {
      const user_id = currUser.id;
      if (
        movie_id !== undefined &&
        userReviewsData.getReviewsOfUserForMovie.length === 0 &&
        rating !== "0" &&
        description !== "" &&
        currUser
      ) {
        const result = await AddReviewAPI({variables:{input:{rating,description,movie_id,user_id}}});
        if (!result) return;

        setAlert({ isOpen: true, message: "Review success", type: "success" });
        setRatingDescription("");
        setValue(0);
      } 
    }
  };

  if (movieLoading) return LoadingComponent(movieLoading);
  if (movieReviewsLoading) return LoadingComponent(movieReviewsLoading);
  if (userReviewsLoading) return LoadingComponent(userReviewsLoading);

  return (
    <>
      <NavigationBar />
      <main style={{ position: "relative", minHeight: "100vh" }}>
        <AlertComponent alert={alert} setAlert={setAlert} />
        <div style={{ paddingBottom: "2.5rem" }}>
          <MovieDeleteDialog
            movie={deletingMovie}
            onClose={() => setDeletingMovie(undefined)}
            setAlert={setAlert}
          />
          <MovieEditModal
            movie={editingMovie}
            onClose={() => setEditingMovie(undefined)}
            setAlert={setAlert}
          />
          <ReviewEditModal
            review={editingReview}
            onClose={() => setEditingReview(undefined)}
            setAlert={setAlert}
          />
          <ReviewDeleteDialog
            review={deletingReview}
            onClose={() => setDeletingReview(undefined)}
            setAlert={setAlert}
          />
            <div style={{ display: "flex", justifyContent: "center" }}>
              <MoviePageCard
                movie={movieData.getMovieById}
                onEdit={() => setEditingMovie(movieData.getMovieById)}
                onDelete={() => setDeletingMovie(movieData.getMovieById)}
              />
            </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 10,
              marginBottom: 30,
            }}
          >
            <Grid container spacing={4}>
              {movieReviewsData.getReviewsOfMovie.length !== 0 && (
                <>
                  {movieReviewsData.getReviewsOfMovie.map((review:ReviewListReview) => (
                    <Grid item key={review.id} xs={12}>
                      <ReviewCard
                        review={review}
                        onEdit={() => setEditingReview(review)}
                        onDelete={() => setDeletingReview(review)}
                      />
                    </Grid>
                  ))}
                </>
              )}
              {movieReviewsData.getReviewsOfMovie.length === 0 && (
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    align="center"
                    color="textPrimary"
                    gutterBottom
                  >
                    {t("review.noReviewFoundForMovie")}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </div>
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              marginLeft: 10,
              marginRight: 10,
            }}
          >
            <CardContent>
              <Typography variant="h2">{t("addTitle.review")}</Typography>
              <TextField
                label={t("review.reviewCard.description")}
                value={ratingDescription}
                sx={{
                  marginBottom: 1,
                  border: 1,
                  borderRadius: 1,
                }}
                fullWidth
                onChange={(e) => setRatingDescription(e.target.value)}
                inputProps={{ "data-testid": "moviepage-review-description" }}
              ></TextField>

              <InputLabel id="rating-select">
                {t("review.reviewCard.rating")}
              </InputLabel>
              <Rating
                name="movie-rating"
                value={value}
                onChange={(event, newValue) => {
                  setValue(newValue);
                }}
                data-testid="moviepage-review-rating"
                data-value={value?.toString()}
              />
              <CardActions>
                <Button
                  sx={{
                    marginTop: 2,
                    border: 1,
                    borderRadius: 1,
                    backgroundColor: "secondary.main",
                    color: "#fff",
                  }}
                  onClick={handleAddReview}
                >
                  {t("buttons.add")}
                </Button>
              </CardActions>
            </CardContent>
          </Card>
        </div>
      </main>
      <ScrollTop>
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </>
  );
}
