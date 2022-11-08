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

//Get request for "/"
app.get("/", (req, res) => {
    res.redirect("/login");
});

// login page
app.get("/login", (req, res) => {
    res.render("pages/login");
});

// create the login page
app.post("/login", async (req, res) => {
    const query = `SELECT * FROM users WHERE users.username = $1`;

    db.any(query, [req.body.username])
        .then(async function(data) {
            const match = await bcrypt.compare(req.body.password, data[0].password)
                .then(match => {
                    if(!match) {
                        throw new Error("Incorrect username or password.")
                    }
                
                req.session.user = {
                    api_key: process.env.API_KEY,
                };
                req.session.save();
                res.redirect("/home");
                })
            })

    .catch((err) => {
        console.log(err);
        res.render("pages/register"),{
            error: true,
            message: err.message,
        }});
});



app.listen(3000);
console.log('Server is listening on port 3000');