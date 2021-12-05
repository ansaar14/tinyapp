delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
  const user_id = req.cookies["user_id"]
  
  const shortURL = req.params.shortURL
  if((req.cookies.user_id === users[user_id].id)) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
    
    } else {
    res.status(403).send('Cannot delete URL, must be your own');
    res.end()
    // res.redirect('/urls');
  }
  console.log("urlDatabase", urlDatabase);