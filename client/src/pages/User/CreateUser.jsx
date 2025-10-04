import React, { useEffect, useState } from "react";
import CategoryModal from "../../components/CategoryModal";
import Input from "../../components/Input";
import useFetch from "../../hooks/useFetch";
import TEST_ID from "./CreateUser.testid";
import { useNavigate } from "react-router-dom";
import { useCategory } from "../../context/CategoryContext";
import "../../Styles/CategoryModal.css";

const CreateUser = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(true);
  const { selectedCategories } = useCategory();

  const onSuccess = () => {
    setName("");
    setEmail("");
    navigate("/reference");
  };
  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    "/user/create",
    onSuccess,
  );

  useEffect(() => {
    return cancelFetch;
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    performFetch({
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        user: { name, email, genres: selectedCategories },
      }),
    });
  };

  let statusComponent = null;
  if (error != null) {
    statusComponent = (
      <div data-testid={TEST_ID.errorContainer}>
        Error while trying to create user: {error.toString()}
      </div>
    );
  } else if (isLoading) {
    statusComponent = (
      <div data-testid={TEST_ID.loadingContainer}>Creating user....</div>
    );
  }

  return (
    <div className="create-user-form" data-testid={TEST_ID.container}>
      <h1>Create New User</h1>
      <form onSubmit={handleSubmit}>
        <Input
          name="name"
          value={name}
          onChange={(value) => setName(value)}
          data-testid={TEST_ID.nameInput}
        />
        <Input
          name="email"
          value={email}
          onChange={(value) => setEmail(value)}
          data-testid={TEST_ID.emailInput}
        />
        <button type="submit" data-testid={TEST_ID.submitButton}>
          Submit
        </button>
      </form>
      {isLoading && <div>Creating user....</div>}
      {error && (
        <div>Error while trying to create user: {error.toString()}</div>
      )}
      {showCategoryModal && (
        <CategoryModal
          open={showCategoryModal}
          handleClose={() => setShowCategoryModal(false)}
        />
      )}
      {statusComponent}
    </div>
  );
};

export default CreateUser;
