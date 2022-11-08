DROP TABLE IF EXISTS resorts CASCADE;
CREATE TABLE resorts(
    resort_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    location VARCHAR(70) NOT NULL,
    elavation int NOT NULL,
    annual_snowfall int,
    terrain_parks int,
    website VARCHAR(500) NOT NULL,
    image VARCHAR(1000)

);

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL
);

DROP TABLE IF EXISTS runs CASCADE;
CREATE TABLE runs(
    run_id NUMERIC PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL
);

DROP TABLE IF EXISTS resorts_to_runs;
CREATE TABLE resorts_to_runs(
    resort_id INTEGER NOT NULL REFERENCES resorts (resort_id),
    run_id INTEGER NOT NULL REFERENCES runs (run_id)
);

DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE reviews(
    review_id NUMERIC PRIMARY KEY,
    description VARCHAR(2048),
    rating int NOT NULL
);

DROP TABLE IF EXISTS users_to_reviews;
CREATE TABLE users_to_runs(
    review_id INTEGER NOT NULL REFERENCES reviews (review_id),
    user_id INTEGER NOT NULL REFERENCES users (user_id)
);

DROP TABLE IF EXISTS resorts_to_reviews;
CREATE TABLE resort_to_reviews(
    review_id INTEGER NOT NULL REFERENCES reviews (review_id),
    user_id INTEGER NOT NULL REFERENCES  users(user_id)
);
