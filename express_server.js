const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')


app.use(cookieParser())
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
  console.log(req.cookies)
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {  username: req.cookies["username"] };
  res.render("urls_new", templateVars );
});

// app.get("/urls/:id", (req, res) => {
//   const shortURL = req.params.shortURL;
//   const longURL = urlDatabase[shortURL];
//   //shortened //
//   const templateVars = { shortURL, longURL };

//   res.render("urls_show", templateVars);
// });


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
   const longURL = req.body.longURL
  //  console.log(longURL);
   urlDatabase[shortURL] = longURL
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
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls`);    
  console.log( "urlDatabase", urlDatabase);
});

app.get('/urls/:id', (req, res) => {
  console.log("hello")
const shortURL = req.params.id
const longURL = urlDatabase[shortURL]
const username = req.cookies["username"]

console.log("shortURL:", shortURL, "longUrl:", longURL)
const templateVars = {
  shortURL,
  longURL,
  username
}
res.render('urls_show', templateVars)
})

app.post("/urls/:id", (req, res) => {
  console.log("Hello")
    const shortURL = req.params.id;
    urlDatabase[shortURL] = req.body.newURL;
    res.redirect('/urls')
  
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  // res.send(`Username: ${username}`);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

//show registration page //
app.get("/register", (req, res) => {
  let templateVars = { username: req.cookies.username };
  res.render("register", templateVars);
});

//create new account //

// app.post("/register", (req, res) => {

// })