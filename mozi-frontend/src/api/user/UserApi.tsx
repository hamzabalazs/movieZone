import { API_URL } from "../constants";
import { CurrUser, User } from "../types";
const USER_KEY = "user-info";

interface AddUserProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function PostUserAPI(props: AddUserProps) {
  const firstName = props.firstName;
  const lastName = props.lastName;
  const email = props.email;
  const password = props.password;
  let item = { firstName, lastName, email, password };
  try {
    const response = await fetch(API_URL + "/user", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(item),
    });
    return response.status === 200;
  } catch (err) {}
  return false;
}

export async function getUserByIdForMovie(userId: string) {
  const res = await fetch(API_URL + "/user/" + userId, {
    method: "GET",
  });
  if (res.status === 200) {
    const data = await res.json();
    return data.data;
  } else return;
}

// User DELETE by ID
export async function DeleteUserAPI(id: string, token: string) {
  try {
    const response = await fetch(API_URL + "/user/" + id, {
      method: "DELETE",
      headers: {
        "auth-token": token,
      },
    });
    return response.status === 200;
  } catch (err) {}
  return false;
}

// User PATCH by ID
export async function UpdateUserAPI(user: Omit<User, "role"> & Partial<Pick<User, "role">>, token: string) {
  try {
    const response = await fetch(API_URL + "/user/" + user.id, {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
        "auth-token": token,
      },
      body: JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        role: user.role,
      }),
    });
    return response.status === 200;
  } catch (err) {}
  return false;
}

export async function UpdateCurrentUserAPI(user: User, token: string) {
  try {
    const response = await fetch(API_URL + "/user/" + user.id, {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
        "auth-token": token,
      },
      body: JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
      }),
    });
    if(response.status === 200){
      const currUser:CurrUser = {
        id:user.id,
        firstName:user.firstName,
        lastName:user.lastName,
        email:user.email,
        password:user.password,
        role:user.role,
        token:token

      }
      localStorage.setItem(USER_KEY,JSON.stringify(currUser))
    }
    return response.status === 200;
  } catch (err) {}
  return false;
}

//User GET by ID
export const getUserById = async (userId: string, token: string) => {
  const testresponse = await fetch(API_URL + "/user/" + userId, {
    method: "GET",
    headers: {
      "auth-token": token,
    },
  });
  if (testresponse.status === 200) {
    const res = await fetch(API_URL + "/user/" + userId, {
      method: "GET",
      headers: {
        "auth-token": token,
      },
    });
    const body = await res.json();
    return body.data;
  }
};

//User GET ALL
export async function getUserList() {
  console.log(API_URL);
  const res = await fetch(API_URL + "/users", {
    method: "GET",
  });
  const data = await res.json();
  return data.data;
}