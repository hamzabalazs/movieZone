import { useEffect, useState } from "react";
import LockIcon from "@mui/icons-material/Lock";
import {
  Avatar,
  Button,
  TextField,
  Box,
  Container,
  Typography,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FormikErrors, useFormik } from "formik";
import AlertComponent from "../components/AlertComponent";
import { AlertType, User } from "../api/types";
import { useSessionContext } from "../api/SessionContext";
import { gql, useQuery } from "@apollo/client";
import LoadingComponent from "../components/LoadingComponent";

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      id
      first_name
      last_name
      email
      role
    }
  }
`;

interface Values {
  email: string;
}

function Forgotpass() {
  const { t } = useTranslation();
  const context = useSessionContext();
  const navigate = useNavigate();
  const { data: usersData, loading:usersLoading } = useQuery(GET_USERS);
  const [alert,setAlert] = useState<AlertType>({isOpen:false,message:"",type:undefined})

  useEffect(() => {
    if (context.user) {
      navigate("/");
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: async (values) => {
      const email = values.email;
      const isUser = usersData.getUsers.find((x:User) => x.email === email);
      if (!isUser) {
        const msg = t("forgotPass.noUser");
        setAlert({isOpen:true,message:msg,type:"error"})
      } else navigate("/login");
    },
    validate: (values) => {
      let errors: FormikErrors<Values> = {};
      if (!values.email) {
        const msg = t("formikErrors.emailReq");
        errors.email = msg;
      }
      return errors;
    },
  });

  if(usersLoading) return LoadingComponent(usersLoading)
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{ m: 1, bgcolor: "secondary.main", color: "text.secondary" }}
          >
            <LockIcon />
          </Avatar>
          <Typography variant="h5" color="text.primary">
            {t("forgotPass.passwordReset")}
          </Typography>
          <Typography variant="subtitle2" color="text.primary" align="center">
            {t("forgotPass.content")}
          </Typography>

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            noValidate
            sx={{ mt: 1, width: "396px" }}
          >
            <div>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                required
                label={t("forgotPass.email")}
                id="email"
                onChange={formik.handleChange}
                sx={{ borderRadius: 1, border: 1 }}
                inputProps={{ "data-testid": "forgot-email" }}
              />
              {formik.errors.email ? (
                <Typography
                  variant="subtitle2"
                  sx={{ color: "red" }}
                  data-testid="forgot-error-email"
                >
                  {formik.errors.email}
                </Typography>
              ) : null}
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
              {t("forgotPass.passwordReset")}
            </Button>
            <Link href="/login" variant="body2" color="text.secondary">
              {t("forgotPass.hasAccount")}
            </Link>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default Forgotpass;
