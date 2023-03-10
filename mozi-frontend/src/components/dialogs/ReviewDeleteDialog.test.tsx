import { gql } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";
import {
  act,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Review } from "../../api/types";
import { MockedSessionContext } from "../../common/testing/MockedSessionProvider";
import ReviewDeleteDialog from "./ReviewDeleteDialog";

const DELETE_REVIEW = gql`
  mutation DeleteReview($input: DeleteReviewInput!) {
    deleteReview(input: $input) {
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

const testReview: Review = {
  id: "idC1",
  user: {
    id: "idU2",
    first_name: "first",
    last_name: "last",
    email: "email",
    role: "viewer",
    password: "vivu",
  },
  movie: {
    id: "idM2",
    title: "title",
    description: "WAAA",
    poster: "posterket",
    release_date: "awuuu",
    category: {
      id: "idC1",
      name: "name1",
    },
    rating: "0",
  },
  description: "description1EDITED",
  rating: "5",
};

const deleteMock = {
  request: {
    query: DELETE_REVIEW,
    variables: {
      input: {
        id: testReview.id,
      },
    },
  },
  result: {
    data: {
      deleteReview: {
        id: testReview.id,
        description: testReview.description,
        rating: testReview.rating,
        movie: {
          id: testReview.movie.id,
        },
        user: {
          id: testReview.user.id,
          first_name: testReview.user.first_name,
          last_name: testReview.user.last_name,
        },
      },
    },
  },
};

function renderReviewDeleteDialog(props: {
  review?: Review;
  onClose?: () => void;
}) {
  return render(
    <MockedProvider addTypename={false} mocks={[deleteMock]}>
      <MockedSessionContext>
        <ReviewDeleteDialog
          review={props.review}
          onClose={props.onClose}
          setAlert={jest.fn()}
        />
      </MockedSessionContext>
    </MockedProvider>
  );
}

test("If review is not provided should not open dialog", () => {
  const { queryByTestId } = renderReviewDeleteDialog({});

  const dialog = queryByTestId("review-delete-dialog");

  expect(dialog).not.toBeInTheDocument();
});

test("If review is provided should open dialog", () => {
  const { queryByTestId } = renderReviewDeleteDialog({ review: testReview });

  const dialog = queryByTestId("review-delete-dialog");
  const acceptButton = queryByTestId("review-delete-dialog-accept");
  const quitButton = queryByTestId("review-delete-dialog-quit");

  expect(dialog).toBeInTheDocument();
  expect(acceptButton).toBeInTheDocument();
  expect(quitButton).toBeInTheDocument();
});

test("calls onClose if quitButton is clicked", async () => {
  const onCloseSpy = jest.fn();
  const { getByTestId } = renderReviewDeleteDialog({
    review: testReview,
    onClose: onCloseSpy,
  });

  const quitButton = getByTestId("review-delete-dialog-quit");
  expect(onCloseSpy).not.toHaveBeenCalled();
  act(() => {
    userEvent.click(quitButton);
  });

  await waitFor(() => {
    expect(onCloseSpy).toHaveBeenCalled();
  });
});

test("Should call review delete successfully", async () => {
  const { getByTestId } = renderReviewDeleteDialog({
    review: testReview,
  });

  const acceptButton = getByTestId("review-delete-dialog-accept");
  expect(screen.queryByText("Success")).not.toBeInTheDocument();

  act(() => {
    userEvent.click(acceptButton);
  });

  await waitFor(() => {
    expect(screen.queryByText("Success")).toBeInTheDocument();
  });
});
