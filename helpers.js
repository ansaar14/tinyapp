
const urlsForUser = (id, urlDatabase) => {
  let userUrls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};


const getUserByEmail = (users, email) => {
   
  for (let key in users) {
    if (users[key].email === email)
      return users[key];

  }
};


const isEmailTaken = (users, email) => {
  for (let user in users) {

    if (users[user].email === email) return true;
    return false;
  }
};

//function to generate random 6 alphanumeric characters //

const generateRandomString = function() {
  let random = "";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    random += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return random;
};

const isValidHttpUrl = function(string) {
  let url;
  
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};


module.exports = { isEmailTaken, getUserByEmail, generateRandomString, urlsForUser, isValidHttpUrl };