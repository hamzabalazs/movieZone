import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedApiContext } from "../common/testing/MockedApiProvider";
import Register from "./Register";

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

function renderRegister() {
  return render(
    <MockedApiContext>
      <Register />
    </MockedApiContext>
  );
}

test("register error if firstName is empty", async () => {
  renderRegister();

  const registerFormFirstName = screen.getByTestId(
    "register-firstName"
  ) as HTMLInputElement;
  const registerButton = screen.getByRole("button", {
    name: "register.register",
  });
  expect(registerFormFirstName.value).toBe("");

  act(() => {
    userEvent.click(registerButton);
  });
  await waitFor(() => {
    const registerErrorFirstName = screen.getByTestId(
      "register-error-firstName"
    );
    expect(registerErrorFirstName).toHaveTextContent(
      "formikErrors.firstNameReq"
    );
  });
});

test("register error if lastName is empty", async () => {
  renderRegister();

  const registerFormLastName = screen.getByTestId(
    "register-lastName"
  ) as HTMLInputElement;
  const registerButton = screen.getByRole("button", {
    name: "register.register",
  });
  expect(registerFormLastName.value).toBe("");

  act(() => {
    userEvent.click(registerButton);
  });
  await waitFor(() => {
    const registerErrorLastName = screen.getByTestId("register-error-lastName");
    expect(registerErrorLastName).toHaveTextContent("formikErrors.lastNameReq");
  });
});

test("register error if email is empty", async () => {
  renderRegister();

  const registerFormEmail = screen.getByTestId(
    "register-email"
  ) as HTMLInputElement;
  const registerButton = screen.getByRole("button", {
    name: "register.register",
  });
  expect(registerFormEmail.value).toBe("");

  act(() => {
    userEvent.click(registerButton);
  });
  await waitFor(() => {
    const registerErrorEmail = screen.getByTestId("register-error-email");
    expect(registerErrorEmail).toHaveTextContent("formikErrors.emailReq");
  });
});

test("register error if password is empty", async () => {
  renderRegister();

  const registerFormPassword = screen.getByTestId(
    "register-password"
  ) as HTMLInputElement;
  const registerButton = screen.getByRole("button", {
    name: "register.register",
  });
  expect(registerFormPassword.value).toBe("");

  act(() => {
    userEvent.click(registerButton);
  });
  await waitFor(() => {
    const registerErrorPassword = screen.getByTestId("register-error-password");
    expect(registerErrorPassword).toHaveTextContent("formikErrors.passwordReq");
  });
});

test("register login link has correct href", async () => {
  renderRegister();
  const registerLoginLink = screen.getByRole("link", {
    name: "register.hasAccount",
  });
  expect(registerLoginLink).toBeVisible();
  expect(registerLoginLink).toHaveAttribute("href", "/login");
});

test("register form works fine", () => {
  renderRegister();

  const registerFormFirstName = screen.getByTestId(
    "register-firstName"
  ) as HTMLInputElement;
  const registerFormLastName = screen.getByTestId(
    "register-lastName"
  ) as HTMLInputElement;
  const registerFormEmail = screen.getByTestId(
    "register-email"
  ) as HTMLInputElement;
  const registerFormPassword = screen.getByTestId(
    "register-password"
  ) as HTMLInputElement;

  expect(registerFormFirstName.value).toBe("");
  expect(registerFormLastName.value).toBe("");
  expect(registerFormEmail.value).toBe("");
  expect(registerFormPassword.value).toBe("");

  fireEvent.change(registerFormFirstName, {
    target: { value: "changeFirstName" },
  });
  fireEvent.change(registerFormLastName, {
    target: { value: "changeLastName" },
  });
  fireEvent.change(registerFormEmail, { target: { value: "changeEmail" } });
  fireEvent.change(registerFormPassword, {
    target: { value: "changePassword" },
  });

  expect(registerFormFirstName.value).toBe("changeFirstName");
  expect(registerFormLastName.value).toBe("changeLastName");
  expect(registerFormEmail.value).toBe("changeEmail");
  expect(registerFormPassword.value).toBe("changePassword");
});