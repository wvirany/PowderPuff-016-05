const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require('bcrypt');
var loggedin = false;

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
    res.redirect("/home");
});

// login page
app.get("/login", (req, res) => {
    res.render("pages/login", {
      loggedin: loggedin
    });
});

// create the login page
app.post("/login", async (req, res) => {
    const query = `SELECT * FROM users WHERE users.username = $1`;
    
    db.one(query, [req.body.username])
        .then(async function(data) {
          console.log(data)
            const match = await bcrypt.compare(req.body.password, data.password)
                .then(match => {
                    if(!match) {
                        throw new Error("Incorrect username or password.")
                    }
                
                req.session.user = {
                  user_id : data.user_id,
                  api_key: process.env.API_KEY
                };
                loggedin = true;
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

// render the profile page
app.get("/profile", async (req, res) => {
    var user_id = req.session.user.user_id;
    var user = `SELECT * FROM users WHERE users.user_id = $1`;
    console.log(req.session.user.user_id);

    await db.one(user, [user_id])
      .then(data => {
        console.log(data[0])
        res.render('pages/profile',{
          loggedin: loggedin,
          data,
        });
      })
      .catch(err => {
        res.render('pages/profile',{
          data:[],
          error: true,
          message: err.message,
        });
      });
  });

// Get request for Register
app.get("/register", (req, res) => {
    res.render("pages/register", {
      loggedin: loggedin
    });
});

// Post request for Register
app.post('/register', async (req, res) => {
    //the logic goes here
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const username = req.body.username;
    const password = await bcrypt.hash(req.body.password, 10);
  
    db.tx(async (t) => {
      await t.none(
        "INSERT INTO users (first_name, last_name, email, username, password) VALUES ($1,$2,$3,$4,$5);",
        [first_name, last_name, email, username, password]
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

app.get("/home", (req, res) => {
  
  var resorts = `SELECT * FROM resorts;`;
  
    db.any(resorts)
      .then((resorts) => {
        res.render("pages/home", {
          resorts,
          loggedin: loggedin
        });
      })
      .catch((err) => {
        res.render("pages/home", {
          resorts: [],
          error: true,
          message: err.message,
        });
      });
  });

  app.post("/resort", (req, res) => {
  
    var resort_id = req.body.resort_id;
    var resort = `SELECT * FROM resorts WHERE resort_id = $1;`;
    
      db.one(resort,[resort_id])
        .then((resort) => {
          res.render("pages/resort", {
            resort,
            loggedin: loggedin
          });
        })
        .catch((err) => {
          res.render("pages/resort", {
            resort: [],
            error: true,
            message: err.message,
          });
        });
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
   loggedin = false;
    req.session.destroy();
    res.render("pages/logout", {
      loggedin: loggedin
    });
  });

app.listen(3000);
console.log('Server is listening on port 3000');