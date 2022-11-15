const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require('bcrypt');

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

// login page
app.get("/login", (req, res) => {
    res.render("pages/login");
});

// create the login page
app.post("/login", async (req, res) => {
    const query = `SELECT * FROM users WHERE users.username = $1`;

    db.any(query, [req.body.username])
        .then(async function(data) {
            const match = await bcrypt.compare(req.body.password, data.password)
                .then(match => {
                    if(!match) {
                        throw new Error("Incorrect username or password.")
                    }
                
                req.session.user = {
                    api_key: process.env.API_KEY,
                };
                req.session.save();
                res.redirect("/");
                })
            })

    .catch((err) => {
        console.log(err);
        res.render("pages/login"),{
            error: true,
            message: err.message,
        }});
});


// Get request for Register
app.get("/register", (req, res) => {
    res.render("pages/register");
});

// Post request for Register
app.post('/register', async (req, res) => {
    //the logic goes here
    const First_name = req.body.first_name;
    const Last_name = req.body.last_name;
    const email = req.body.email;
    const username = req.body.username;
    const password = await bcrypt.hash(req.body.password, 10);
  
    db.tx(async (t) => {
      await t.none(
        "INSERT INTO users (First_name, Last_name, email, username, password) VALUES ($1,$2,$3,$4,$5);",
        [First_name, Last_name, email, username, password]
      );
      return "Register Successfully";
    })
    .then((data) => {
      console.log(data);
      res.redirect("/login");
    })
    .catch((err) => {
      console.log("Error:" + err);
      res.redirect("/register");
    });
});

//GET request for "/home"
app.get("/home", (req, res) => {

    var query = `SELECT * FROM resorts ORDER BY resorts.rating;`;

    db.any(query)
        .then(() => {
            res.render("pages/home");
        })
        .catch((err) => {
            return console.log(err);
        })
});

// Authentication Middleware.
const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to register page.
      return res.redirect('/register');
    }
    next();
};

// Authentication Required
app.use(auth);

//GET request for "/logout"
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render("pages/logout");
  });

app.listen(3000);
console.log('Server is listening on port 3000');