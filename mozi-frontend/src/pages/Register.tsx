import { useEffect, useState } from "react";
import { useFormik } from "formik";
import LockIcon from "@mui/icons-material/Lock";
import {
  Avatar,
  Button,
  TextField as MuiTextField,
  Grid,
  Box,
  Container,
  Typography,
  Link,
  TextFieldProps,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AlertComponent from "../components/AlertComponent";
import { useTranslation } from "react-i18next";
import { useApiContext } from "../api/ApiContext";
import { AlertType } from "../api/types";
import * as Yup from "yup";

function Register() {
  const { t } = useTranslation();
  const context = useApiContext();
  const navigate = useNavigate();
  const [alert,setAlert] = useState<AlertType>({isOpen:false,message:"",type:undefined})
  
  useEffect(() => {
    if (context.user) {
      navigate("/");
    }
  });

  const schema = useEditUserSchema()

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      const firstName = values.firstName;
      const lastName = values.lastName;
      const email = values.email;
      const password = values.password;
      const result = await context.registerUser({
        firstName,
        lastName,
        email,
        password,
      });
      if (!result) {
        const msg = t("register.accountExists");
        setAlert({isOpen:true,message:msg,type:"error"})
        return;
      }
      navigate("/login");
    },
    validationSchema:schema
  });

  return (
    <>
      <AlertComponent
        alert={alert}
        setAlert={setAlert}
      />
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            flexDirection: "column",
            alignItems: "center",
            display: "flex",
          }}
        >
          <Avatar sx={{ bgcolor: "secondary.main", color: "text.secondary" }}>
            <LockIcon />
          </Avatar>
          <Typography variant="h5" color="text.primary">
            {t("register.register")}
          </Typography>
          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <div>
              <TextField
                sx={{
                  border: 1,
                  borderRadius: 1,
                  width: 400,
                }}
                id="firstName"
                name="firstName"
                margin="normal"
                multiline
                required
                label={t("register.firstName")}
                onChange={formik.handleChange}
                value={formik.values.firstName}
                inputProps={{ "data-testid": "register-firstName" }}
                error={formik.errors.firstName}
              />
              <TextField
                sx={{
                  border: 1,
                  borderRadius: 1,
                }}
                id="lastName"
                name="lastName"
                margin="normal"
                multiline
                fullWidth
                required
                label={t("register.lastName")}
                onChange={formik.handleChange}
                value={formik.values.lastName}
                inputProps={{ "data-testid": "register-lastName" }}
                error={formik.errors.lastName}
              />
              <TextField
                margin="normal"
                fullWidth
                required
                label={t("register.email")}
                id="email"
                name="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                sx={{ border: 1, borderRadius: 1 }}
                inputProps={{ "data-testid": "register-email" }}
                error={formik.errors.email}
              />
              <TextField
                margin="normal"
                fullWidth
                required
                label={t("register.password")}
                type="password"
                id="password"
                name="password"
                onChange={formik.handleChange}
                value={formik.values.password}
                sx={{ border: 1, borderRadius: 1 }}
                inputProps={{ "data-testid": "register-password" }}
                error={formik.errors.password}
              />
            </div>
            <Button
              sx={{
                borderRadius: 4,
                marginTop: 1,
                marginBottom: 1,
                backgroundColor: "secondary.main",
                color: "#fff",
              }}
              variant="contained"
              fullWidth
              type="submit"
            >
              {t("register.register")}
            </Button>
            <Grid container>
              <Grid item>
                <Link href="/login" variant="body2" color="text.secondary">
                  {t("register.hasAccount")}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
}
export default Register;

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
          data-testid="register-error-firstName"
        >
          {error}
        </Typography>
      ) : null}
    </>
  );
}

function useEditUserSchema() {
  const { t } = useTranslation();

  return Yup.object({
    firstName: Yup.string().required(t("formikErrors.firstNameReq") || ""),
    lastName: Yup.string().required(t("formikErrors.lastNameReq") || ""),
    email: Yup.string()
      .required(t("formikErrors.emailReq") || "")
      .email(t("formikErrors.emailFormat") || ""),
    password: Yup.string()
      .required(t("formikErrors.passwordReq") || "")
      .test(
        "len",
        t("formikErrors.passwordLength") || "",
        (val) => val.length > 5
      ),
  });
}