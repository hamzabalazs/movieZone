import { Container, Fab, Grid, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { AlertType, Category } from "../api/types";
import CategoryDeleteDialog from "../components/dialogs/CategoryDeleteDialog";
import CategoryAddModal from "../components/modals/CategoryAddModal";
import CategoryEditModal from "../components/modals/CategoryEditModal";
import NavigationBar from "../components/NavigationBar";
import MyFooter from "../components/MyFooter";
import ScrollTop from "../components/ScrollTop";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CategoryCard from "../components/cards/CategoryCard";
import AlertComponent from "../components/AlertComponent";
import { useTranslation } from "react-i18next";
import LoadingComponent from "../components/LoadingComponent";
import { useQuery, gql, useMutation, useApolloClient } from '@apollo/client'

const GET_CATEGORIES = gql`
  query GetCategories {
  getCategories {
    id
    name
  }
}
`

function Categories() {
  const { t } = useTranslation();
  const {data:categoryData,loading:categoriesLoading} = useQuery(GET_CATEGORIES)
  const client = useApolloClient()
  const [alert, setAlert] = useState<AlertType>({
    isOpen: false,
    message: "",
    type: undefined,
  });

  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined
  );
  const [deletingCategory, setDeletingCategory] = useState<
    Category | undefined
  >(undefined);

  const [isOpenAdd, setIsOpenAdd] = useState(false);

  const handleAddCategory = () => {
    setIsOpenAdd(true);
  };

  async function refetchData(){
    await client.refetchQueries({
      include: [GET_CATEGORIES]
    })
  }

  useEffect(() => {
    if(alert.isOpen){
      refetchData()
    }
  },[alert])

  if(categoriesLoading) return LoadingComponent(categoriesLoading)

  return (
    <>
      <NavigationBar />
      <main style={{ position: "relative", minHeight: "100vh" }}>
        <AlertComponent alert={alert} setAlert={setAlert} />
        <CategoryEditModal
          category={editingCategory}
          onClose={() => setEditingCategory(undefined)}
          setAlert={setAlert}
        />
        <CategoryDeleteDialog
          category={deletingCategory}
          onClose={() => setDeletingCategory(undefined)}
          setAlert={setAlert}
        />
        <div>
          <CategoryAddModal
            isOpenAdd={isOpenAdd}
            setIsOpenAdd={setIsOpenAdd}
            setAlert={setAlert}
          />
          <IconButton
            sx={{
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
            onClick={handleAddCategory}
            data-testid="category-add-button"
          >
            <AddCircleIcon sx={{ fontSize: 40 }} color="primary" />
          </IconButton>
          <Container maxWidth="sm" sx={{ marginBottom: 3 }}>
            <Typography
              variant="h2"
              align="center"
              color="textPrimary"
              gutterBottom
            >
              {t("navbar.Categories")}
            </Typography>
          </Container>
        </div>
        <div>
          <Grid container spacing={4}>
            {categoryData.getCategories.map((category:Category) => (
              <Grid item key={category.id} xs={12}>
                <CategoryCard
                  category={category}
                  onEdit={() => setEditingCategory(category)}
                  onDelete={() => setDeletingCategory(category)}
                />
              </Grid>
            ))}
          </Grid>
        </div>
        <MyFooter />
      </main>
      <ScrollTop>
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </>
  );
}

export default Categories;
