const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
//function to generate random 6 alphanumeric characters //
function generateRandomString() {
  let random = "";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    random += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return random;
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.listen(8080, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  console.log(req.cookies);
  const email = req.cookies["email"]
  const templateVars = { urls: urlDatabase, username: req.cookies["user_id"], email };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const email = req.cookies["email"]
  const templateVars = {  username: req.cookies["user_id"], email };
  res.render("urls_new", templateVars);
});
// app.get("/urls/:id", (req, res) => {
//   const shortURL = req.params.shortURL;
//   const longURL = urlDatabase[shortURL];
//   //shortened //
//   const templateVars = { shortURL, longURL };
//   res.render("urls_show", templateVars);
// });
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  //  console.log(longURL);
  urlDatabase[shortURL] = longURL;
  //  console.log(urlDatabase);
  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
  console.log("urlDatabase", urlDatabase);
});
app.get('/urls/:id', (req, res) => {
  console.log("hello");
  const email = req.cookies["email"]

  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const username = req.cookies["user_id"];
  console.log("shortURL:", shortURL, "longUrl:", longURL);
  const templateVars = {
    shortURL,
    longURL,
    username,
    email
  };
  res.render('urls_show', templateVars);
});

app.post("/urls/:id", (req, res) => {
  console.log("Hello");
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  
  const templateVars = {  
    user: users[req.cookies.user_id],
    email: req.cookies.email
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const userID = getUserIdByEmail(email);
  if (!userID) return res.status(401).send("Wrong credentials/not registered");

  res.cookie('user_id', userID);
  res.cookie('email', email);

  // res.send(`Username: ${username}`);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  const email = req.cookies["email"]
  res.clearCookie('user_id');
  res.clearCookie('email');
  res.redirect('/urls');
});
//show registration page //
app.get("/register", (req, res) => {
  let templateVars = { username: req.cookies.user_id };
  res.render("register", templateVars);

});
//create new account //
app.post("/register", (req, res) => {
  console.log("hello");
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "")
    return res.status(400).send("Please type in email and/or password");

  // if(!email || !password) return res.status(401).send("Invalid email or password")

  if (isEmailTaken(email)) return res.status(400).send("Email already registered");

  if (email && password) {
    const newUser = {
      id: generateRandomString(),
      email: req.body.email,
      password: req.body.password
    };
    users[newUser.id] = newUser;

    res.cookie('user_id', newUser.id);
    res.cookie('email', email);
    res.redirect('/urls');
    console.log('users incl newly created----->', users);
  }
});
const isEmailTaken = (email) => {
  for (let user in users) {

    if (users[user].email === email) return true;
    return false;
  }
};
const getUserIdByEmail = (email) => {

  for (let user in users) {
    if (users[user].email === email) return users[user].id;
  }
};

const getUserByEmail = (email) => {

  for(let user in users) {
    if(users[user].email === email) return users[user].id
  }

}
