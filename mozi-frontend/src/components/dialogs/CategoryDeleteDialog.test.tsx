import { gql } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";
import {
  act,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Category } from "../../api/types";
import { MockedSessionContext } from "../../common/testing/MockedSessionProvider";
import CategoryDeleteDialog from "./CategoryDeleteDialog";

const testCategory: Category = {
  id: "idC3",
  name: "categoryName",
};

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($input: DeleteCategoryInput!) {
  deleteCategory(input: $input) {
    id
    name
  }
}
`

const deleteMock = {
  request:{
    query: DELETE_CATEGORY,
    variables:{input:{id:testCategory.id}}
  },
  result:{
    data:{
      deleteCategory:{
        id:testCategory.id,
        name:testCategory.name
      }
    }
  }
}

function renderCategoryDeleteDialog(props: {
  category?: Category;
  onClose?: () => void;
}) {
  return render(
    <MockedProvider addTypename={false} mocks={[deleteMock]}>
      <MockedSessionContext>
        <CategoryDeleteDialog
          category={props.category}
          onClose={props.onClose}
        />
      </MockedSessionContext>
    </MockedProvider>
  );
}

test("If category is not provided should not open", () => {
  const { queryByTestId } = renderCategoryDeleteDialog({});

  const dialog = queryByTestId("category-delete-dialog");

  expect(dialog).not.toBeInTheDocument();
});

test("If category is provided should open dialog", () => {
  const { queryByTestId } = renderCategoryDeleteDialog({
    category: testCategory,
  });

  const dialog = queryByTestId("category-delete-dialog");
  const acceptButton = queryByTestId("category-delete-dialog-accept");
  const quitButton = queryByTestId("category-delete-dialog-quit");

  expect(dialog).toBeInTheDocument();
  expect(acceptButton).toBeInTheDocument();
  expect(quitButton).toBeInTheDocument();
});

test("Should call onClose when quit is clicked", async () => {
  const onCloseSpy = jest.fn();
  const { getByTestId } = renderCategoryDeleteDialog({
    category: testCategory,
    onClose: onCloseSpy,
  });

  const quitButton = getByTestId("category-delete-dialog-quit");
  expect(onCloseSpy).toHaveBeenCalledTimes(0);
  act(() => {
    userEvent.click(quitButton);
  });

  await waitFor(() => {
    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });
});

test("Should call category delete successfully", async () => {
  renderCategoryDeleteDialog({category:testCategory});

  const acceptButton = screen.getByTestId(`category-delete-dialog-accept`)
  expect(screen.queryByText("Success")).not.toBeInTheDocument()
  act(() => {
    userEvent.click(acceptButton)
  })

  await waitFor(() => {
    expect(screen.queryByText("Success")).toBeInTheDocument()
  })

});
