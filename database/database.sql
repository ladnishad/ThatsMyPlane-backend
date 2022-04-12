CREATE DATABASE trackMyFlights;

--\c into trackMyFlights

CREATE TABLE users(
  user_id SERIAL PRIMARY KEY,
  firstName VARCHAR(40),
  lastName VARCHAR(40),
  email VARCHAR(40),
  signupDate BIGINT
);
