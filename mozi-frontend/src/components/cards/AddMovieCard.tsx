import { PhotoCamera } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField as MuiTextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { isString } from "lodash";
import { Dispatch, SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";
import { gql, useMutation, useQuery } from "@apollo/client";
import { AlertType, Category, Movie } from "../../api/types";
import * as Yup from "yup";
import { datevalidator } from "../../common/datevalidator";
import Resizer from "react-image-file-resizer";
import LoadingComponent from "../LoadingComponent";

interface Props {
  setIsOpenAdd?: Dispatch<SetStateAction<boolean>>;
  setAlert?: Dispatch<SetStateAction<AlertType>>;
}

// File resizer for image compression
export const resizeFile = (file: File) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      640,
      480,
      "JPEG",
      60,
      0,
      (uri) => {
        resolve(uri);
      },
      "base64"
    );
  });

const ADD_MOVIE = gql`
  mutation CreateMovie($input: AddMovieInput!) {
    createMovie(input: $input) {
      id
      title
      description
      poster
      release_date
      category {
        id
        name
      }
      rating
    }
  }
`;
const GET_CATEGORIES = gql`
  query GetCategories {
  getCategories {
    id
    name
  }
}
`
export default function AddMovieCard(props: Props) {
  const { t } = useTranslation();
  const [poster, setPoster] = useState("");
  const [AddMovieAPI,{data}] = useMutation(ADD_MOVIE);
  const {data:categoriesData,loading:categoriesLoading} = useQuery(GET_CATEGORIES)
  const setIsOpenAdd = props.setIsOpenAdd;
  const setAlert = props.setAlert;
  const handleAddMovie = async (
    addedMovie: Omit<Movie, "id" | "rating" | "poster">
  ) => {
    const result = await AddMovieAPI({
      variables: {
        input: {
          title: addedMovie.title,
          description: addedMovie.description,
          poster: poster,
          release_date: addedMovie.release_date,
          category_id: addedMovie.category.id,
        },
      },
    });
    if (result) {
      const msg = t("successMessages.movieAdd");
      setAlert?.({ isOpen: true, message: msg, type: "success" });
      setIsOpenAdd?.(false);
    }
  };

  const formikValues: Omit<Movie, "id" | "rating" | "poster"> = {
    title: "",
    description: "",
    release_date: "",
    category: {
      id: "",
      name: "",
    },
  };

  const schema = useAddMovieSchema();
  const formik = useFormik({
    initialValues: formikValues,
    onSubmit: handleAddMovie,
    enableReinitialize: true,
    validationSchema: schema,
  });

  if(categoriesLoading) return LoadingComponent(categoriesLoading);
  if(data) return <p style={{visibility:"hidden",height:"0px",margin:"0px"}}>Success</p>


  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent>
          <Typography variant="h3" gutterBottom>
            {t("addTitle.movie")}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: "auto" }}>
            {t("movie.title")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            id="title"
            name="title"
            onChange={formik.handleChange}
            value={formik.values.title}
            sx={{ border: 1, borderRadius: 1 }}
            inputProps={{ "data-testid": "movie-add-title" }}
            error={formik.errors.title}
          ></TextField>
          <Typography variant="subtitle1" sx={{ mt: "auto" }}>
            {t("movie.description")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            id="description"
            name="description"
            onChange={formik.handleChange}
            value={formik.values.description}
            sx={{ border: 1, borderRadius: 1 }}
            inputProps={{ "data-testid": "movie-add-description" }}
            error={formik.errors.description}
          ></TextField>
          <Typography variant="subtitle1" sx={{ mt: "auto" }}>
            {t("movie.release_date")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            id="release_date"
            name="release_date"
            sx={{ marginBottom: 1, border: 1, borderRadius: 1 }}
            value={formik.values.release_date}
            onChange={formik.handleChange}
            inputProps={{ "data-testid": "movie-add-release_date" }}
            error={formik.errors.release_date}
          ></TextField>
          <InputLabel id="category-select">{t("movie.category")}</InputLabel>
          <Select
            labelId="category-select"
            label="Category"
            value={formik.values.category.id}
            name="category.id"
            id="category.id"
            onChange={formik.handleChange}
            sx={{ border: 1, borderRadius: 1 }}
            inputProps={{ "data-testid": "movie-add-category" }}
          >
            {categoriesData.getCategories.map((category:Category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="subtitle1" sx={{ mt: "auto", marginTop: 1 }}>
            {t("movie.poster")}
          </Typography>

          <IconButton
            color="primary"
            aria-label="upload picture"
            component="label"
            defaultValue={poster}
          >
            <input
              hidden
              accept="image/*"
              type="file"
              name="poster"
              id="poster"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const image = await resizeFile(file);
                if (isString(image)) setPoster(image);
              }}
              data-testid="movie-add-poster"
            />
            <PhotoCamera />
            <img
              alt=""
              style={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "5px",
                width: "150px",
                marginLeft: 10,
              }}
              src={poster}
            />
          </IconButton>
        </CardContent>
        <CardActions disableSpacing sx={{ mt: "auto" }}>
          <Button
            size="small"
            sx={{ color: "text.secondary", border: 1, borderRadius: 1 }}
            type="submit"
            data-testid="movie-add-button"
          >
            {t("buttons.add")}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

function TextField({
  error,
  ...props
}: Omit<TextFieldProps, "error"> & { error?: string }): JSX.Element {
  return (
    <>
      <MuiTextField {...props} />
      {error ? (
        <Typography
          variant="subtitle2"
          sx={{ color: "red" }}
          data-testid="register-error-first_name"
        >
          {error}
        </Typography>
      ) : null}
    </>
  );
}

function useAddMovieSchema() {
  const { t } = useTranslation();

  return Yup.object({
    title: Yup.string().required(t("formikErrors.titleReq") || ""),
    description: Yup.string().required(t("formikErrors.descriptionReq") || ""),
    release_date: Yup.string()
      .required(t("formikErrors.release_dateReq") || "")
      .matches(datevalidator, t("formikErrors.release_dateFormat") || ""),
    //category: Yup.string().required(t("formikErrors.categoryReq") || ""),
  });
}
