import React from "react";
import { Link } from "react-router-dom";
import "../Styles/NotFoundPage.css";
import four from "../../public/images/406.gif";
const NotFoundPage = () => {
  return (
    <div className="wrapper">
      <div className="alfour">
        <div className="four">
          <img src={four} alt="" />
        </div>
        <div className="text">
          <h1>Opps! You have found the last world! </h1>
          <p className="e">
            Home is just a click away. Let’s go back and continue our regular
            life
          </p>
          <Link to="/">Go back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
