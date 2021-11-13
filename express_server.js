const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { isEmailTaken, getUserByEmail, urlsForUser, generateRandomString, isValidHttpUrl} = require('./helpers');


app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


// object databases //
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//render urls page for logged in user //
//displays url if user is logged in //
app.get("/urls", (req, res) => {
  const email = req.session.email;
  const user_id = req.session.user_id;

  let error = "";
  if (user_id === undefined) {
    error = "Please log in or register before viewing URLs";
  }

  const filteredUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === user_id) {
        filteredUrls[url] = {
        longURL: urlDatabase[url].longURL,
        userID: user_id
      };
    }
  }
  const templateVars = { 
    urls: filteredUrls, 
    user_id: req.session.user_id, 
    email, 
    error: error };

  res.render("urls_index", templateVars);

});

// permissions and render new urls page"
app.get("/urls/new", (req, res) => {
  const email = req.session.email;
  const user_id = req.session.user_id;
  const templateVars = {
    user_id,
    email
  };

  if (!user_id) {
    req.session.error = "You can only create tiny URLs if you are logged in";
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);

});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL,
    userID: req.session.user_id

  };
  
  res.redirect(`/urls/${shortURL}`);    
});

// permissions and short URL redirection //
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  

  
  let userURLs;
  if (!urlDatabase[shortURL]){
    res.send("short URL not valid");
    return;

  }
  const longURL = urlDatabase[shortURL].longURL;
  if (!isValidHttpUrl(longURL)) {

      res.send("You do not have a valid URL");
      return;
      
    }
    res.redirect(longURL);



});


// permission //
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.status(404).send('url not in database');

  } else if (! (req.session.user_id === urlDatabase[shortURL].userID)) {
    res.status(403).send('Cannot update URL that you do not own');

  } else {
    urlDatabase[shortURL].longURL =  req.body.longURL;
    res.redirect(`/urls`);
    
  }
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);

  for (let short in userURLs) {

    if (short === req.params.shortURL) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
      return;
    } else {

    }
  }
  return;
});
  

// displays long and shortURL and creates an error message if the id is different //
app.get('/urls/:id', (req, res) => {
  const email = req.session.email;
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    res.status(404).send("short URL does not exist");
  } else {
    
    const longURL = urlDatabase[shortURL].longURL;
    const user_id = req.session.user_id;

    const templateVars = {
      shortURL,
      longURL,
      user_id,
      email
    };
    res.render('urls_show', templateVars);
  }
});


app.post("/urls/:id", (req, res) => {
  
  const shortURL = req.params.id;
  urlDatabase[shortURL] = {
    longURL: req.body.newURL,
    userID: req.session.user_id
  };

  res.redirect('/urls');
});


app.get('/login', (req, res) => {
  
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }

  const templateVars = { 
    user: users[req.session.user_id], 
    email: req.session.email,
    error_msg: req.session.error 
  };
  
  delete req.session.error;
  res.render("login", templateVars);
});
  


//submits login page //
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  const user = getUserByEmail(users, email);

  console.log("82378123719 userrrr", user )

  console.log("82378123719 password", password)

  if (!user) {
    return res.status(403).send("Email cannot be found");
  }

  const comparePassword = bcrypt.compareSync(password, user.password); // returns true

  console.log("compare passs", comparePassword)

  if (!comparePassword) {

    return res.status(403).send("Incorrect password");
  }

  req.session.user_id = user.id;
  req.session.email = user.email;

  res.redirect("/urls");
  

});


app.post("/logout", (req, res) => {

  const email = req.session.email;
  delete req.session.user_id;
  delete req.session.email;
  res.redirect('/urls');
});


//show registration page //
app.get("/register", (req, res) => {
  const email = req.session.email;
  let templateVars = { 
    user_id: req.session.user_id, 
    email };

  res.render("register", templateVars);

});

//create new account //
app.post("/register", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const hashedPass = bcrypt.hashSync(password, 10);

  if (email === "" || password === "")
    return res.status(400).send("Please type in email and/or password");

  if (isEmailTaken(users, email))
    return res.status(400).send("Email already registered");

  if (email && password) {
    const newUser = {
      id: generateRandomString(),
      email: req.body.email,
      password: hashedPass
    };
    console.log("checking hash password ++++", users);

    users[newUser.id] = newUser;

    req.session.user_id = newUser.id;
    req.session.email = email;
    res.redirect('/urls');
  }
});


app.listen(8080, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

