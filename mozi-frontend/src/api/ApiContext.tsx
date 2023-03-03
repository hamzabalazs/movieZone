import React from "react";
import { CategoryData, useCategories } from "./category/useCategories";
import { LogInData, useLogIn } from "./auth/useLogIn";
import { MovieData, useMovies } from "./movie/useMovies";
import { UserData, useUsers } from "./user/useUsers";
import { ReviewData, useReviews } from "./review/useReviews";

export type ApiContextData = LogInData &
  Omit<CategoryData, "refetchData"> &
  Omit<MovieData, "refetchData"> &
  Omit<UserData, "refetchData"> &
  Omit<ReviewData, "refetchData">;

export const apiContext = React.createContext<ApiContextData | undefined>(
  undefined
);

export function useApiContext(): ApiContextData {
  const context = React.useContext(apiContext);
  if (!context) throw new Error("");
  return context;
}

export function ApiContextProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const logInData = useLogIn();

  const { refetchData: refetchUsers, ...userData } = useUsers(
    logInData.user?.token
  );
  const { refetchData: refetchCategories, ...categoryData } = useCategories(
    logInData.user?.token
  );
  const { refetchData: refetchMovies, ...movieData } = useMovies(
    logInData.user?.token
  );
  const { refetchData: refetchReviews, ...reviewData } = useReviews(
    logInData.user?.token
  );

  return (
    <apiContext.Provider
      value={{
        ...logInData,
        ...categoryData,
        ...movieData,
        ...userData,
        ...reviewData,
      }}
    >
      {children}
    </apiContext.Provider>
  );
}