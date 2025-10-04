import React from "react";
import TEST_ID from "./Home.testid";
import Landing from "../../components/Landing";
import AuthForm from "../../components/AuthForm";
import { useAuth } from "../../context/AuthContext";
const Home = () => {
  const { user } = useAuth();
  return (
    <div data-testid={TEST_ID.container}>
      <Landing />
      {!user && <AuthForm />}
    </div>
  );
};

export default Home;
