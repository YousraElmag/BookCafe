import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";

const Meta = ({ title, description }) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" href="/favicon.ico" />
  </Helmet>
);

Meta.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default Meta;
