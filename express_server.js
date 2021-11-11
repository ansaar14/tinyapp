const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');


app.use(cookieParser());
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


//function to generate random 6 alphanumeric characters //

const generateRandomString = function() {
  let random = "";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    random += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return random;
}

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

app.get("/urls", (req, res) => {
  console.log(req.cookies);
  const email = req.cookies["email"]
  const user_id = req.cookies["user_id"]

  let error = ""
  if(user_id === undefined){
    error = "Please log in or register before viewing URLs"
  }
    const filteredUrls = {};
    for(const url in urlDatabase){
      if (urlDatabase[url].userID === user_id){
      filteredUrls[url] = {
        longURL: urlDatabase[url].longURL,
        userID: user_id
      }
    }
  }
  console.log("filteredUrls::::",filteredUrls);
  const templateVars = { urls: filteredUrls, user_id: req.cookies["user_id"], email, error: error };
  res.render("urls_index", templateVars);

});


app.get("/urls/new", (req, res) => {
  const email = req.cookies["email"]
  const user_id = req.cookies["user_id"]
  const templateVars = {
    user_id,
    email
  }
  if (!user_id) {
    res.cookie("error", "You can only create tiny URLs if you are logged in")
    res.redirect('/login');
  }
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
  urlDatabase[shortURL] = {
    longURL,
    userID: req.cookies["user_id"],

  };
  console.log("urlDatabase", urlDatabase);
  //  console.log(urlDatabase);
  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});


app.get("/u/:shortURL", (req, res) => {
  let userURLs;
  if (req.cookies["user_id"]) {
    userURLs = urlsForUser(req.cookies["user_id"], urlDatabase);
  } else {
    res.status(401);
    res.send("You are not authorized to view this Short Link, please Log In");
    return;
  };

    
});

app.post("/u/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;

  if(!urlDatabase[shortURL]) {
    res.status(404).send('url not in database');
  } else if(! (req.cookies.user_id === urlDatabase[shortURL].userID)) {
    res.status(403).send('Cannot update URL that you do not own')
  } else {
    urlDatabase[shortURL].longURL = 'http://' + req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
    
}
});

app.post("/urls/:shortURL/delete", (req, res) => {

  const userURLs = urlsForUser(req.cookies["user_id"], urlDatabase);
  for (let short in userURLs) {
    if (short === req.params.shortURL) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
      return;
    }
  }
  res.status(401);
  res.send("You are not authorized to delete this URL");
  return;
});
  


// displays long and shortURL and creates an error message if the id is different //
app.get('/urls/:id', (req, res) => {
  console.log("I am edit!!!!");
  const email = req.cookies["email"]
  const shortURL = req.params.id;
  if(!urlDatabase[shortURL]){
    res.status(404).send("URL does not exist");
  } else {
    // const longURL = urlDatabase[shortURL].longURL;
  // const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  const user_id = req.cookies["user_id"];

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
  console.log("Hello - I am post");
  const shortURL = req.params.id;
  urlDatabase[shortURL] = {
    longURL: req.body.newURL,
    userID: req.cookies['user_id'],
  };
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  
  if (req.cookies["user_id"]) {
    res.redirect('/urls');
    return;
  }
  const templateVars = { user: users[req.cookies.user_id],email: req.cookies.email, 
  error_msg: req.cookies.error };
  res.clearCookie("error");
  res.render("login", templateVars);
})
  



app.post('/login', (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const password = req.body.password

  const user = getUserByEmail(users, email);
  
  if (!user){
    return res.status(403).send("Email cannot be found");
  } 

  const comparePassword = bcrypt.compareSync(password, user.password); // returns true
  if (!comparePassword){
    return res.status(403).send("Incorrect password");
  }


  res.cookie('user_id', user.id);
  res.cookie('email', user.email);

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
  const email = req.cookies["email"]
  let templateVars = { user_id: req.cookies.user_id, email };
  res.render("register", templateVars);

});
//create new account //
app.post("/register", (req, res) => {
  console.log("hello");
  const email = req.body.email;
  const password = req.body.password;
  const hashedPass = bcrypt.hashSync(password, 10);
  if (email === "" || password === "")
    return res.status(400).send("Please type in email and/or password");

  // if(!email || !password) return res.status(401).send("Invalid email or password")

  if (isEmailTaken(email)) return res.status(400).send("Email already registered");

  if (email && password) {
    const newUser = {
      id: generateRandomString(),
      email: req.body.email,
      password: hashedPass
    };
    console.log("checking hash password ++++", users);

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

const getUserByEmail = (users, email) => {

  for (let user in users) {
    if (users[user].email === email) 
    return users[user]
  }
};


app.listen(8080, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


const urlsForUser = (id) => {
  let userUrls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }

  return userUrls;
};

