const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");

// database configuration
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};
  
const db = pgp(dbConfig);
  
// test your database
db.connect()
    .then(obj => {
        console.log('Database connection successful'); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
});

app.set('view engine', 'ejs');
app.use(bodyParser.json());

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
    })
);
  
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
);

//GET request for "/"
app.get("/", (req, res) => {
    res.redirect("/login");
});

//GET request for "/home"
app.get("/home", (req, res) => {

    var query = `SELECT * FROM resorts ORDER BY resorts.rating;`;

    db.any(query)
        .then(function (data) {
            response.status(200).json({
                status: 'success',
                data: data,
                message: 'Data Retrieved Successfully',
            });
        })
        .catch(function (err) {
            return console.log(err);
        })
});

app.listen(3000);
console.log('Server is listening on port 3000');