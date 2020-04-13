const express = require("express");
const path = require("path");
const app = express();
const firebase = require("firebase");
const _uuid = require("uuid");
const JSAlert = require("js-alert");
const port = process.env.PORT || 3001;
//var ui = new firebaseui.auth.AuthUI(firebase.auth());

//const auth = require("firebase/auth");
//const database = require("firebase/database");

// const cors = (req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
//   res.header("Access-Control-Allow-Headers", "Origin, Content-Type");

//   next();
// };

app.set("view engine", "hbs");

app.use(express.json());

//app.use(cors);

app.use(
  express.urlencoded({
    extended: true,
  })
);
// app.use((req, res, next) => {
//   res.locals.login = req.isAuthenticated();
//   next();
// });

const firebaseConfig = {
  apiKey: "AIzaSyAVuxWbbh1Imy3qobOWI16n9ynrP7ggA9Y",
  authDomain: "authentication-28cbf.firebaseapp.com",
  databaseURL: "https://authentication-28cbf.firebaseio.com",
  projectId: "authentication-28cbf",
  storageBucket: "authentication-28cbf.appspot.com",
  messagingSenderId: "358686645522",
  appId: "1:358686645522:web:3eb736f4a4bf9cc7da67cb",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
//let database = firebase.database();

app.get("/", (req, res) => {
  if (auth.currentUser) {
    const displayName = auth.currentUser.displayName;
    //console.log(JSON.stringify(a));

    res.render("signup", { displayName });
  } else res.render("signup");
});

app.get("/login", (req, res) => {
  // auth.onAuthStateChanged(function(user) {
  //     if (user) {
  //       // User is signed in.
  //       var displayName = user.displayName;
  //       res.render('login',{displayName})
  //       // ...
  //     } else {
  //       // User is signed out.
  //       // ...
  //     }
  //   });

  if (auth.currentUser) {
    const displayName = auth.currentUser.displayName;
    //console.log(JSON.stringify(a));

    res.render("login", { displayName });
  } else res.render("login");
});

app.get("/logout", (req, res) => {
  auth.signOut().then(() => {
    console.log("user signed out");
    res.redirect("/login");
    return;
  });
});

app.post("/", (req, res) => {
  const person = {
    // id: req.body.id,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    image: req.body.image,
  };

  auth
    .createUserWithEmailAndPassword(person.email, person.password)
    .then((user) => {
      let profile = auth.currentUser;

      profile
        .updateProfile({
          displayName: person.name,
          photoURL: person.image,
        })
        .then(function () {
          // Update successful.

          firebase
            .database()
            .ref("/users/" + _uuid.v4())
            .set({
              username: person.name,
              email: person.email,
              password: person.password,
            });
        })
        .catch(function (error) {
          // Handle Errors here.
        });
      //console.log(user);
    });

  res.redirect("/login");
});

//console.log(person);

//   firebase
//     .database()
//     .ref("/users/" + _uuid.v4())
//     .set({
//       username: person.name,
//       email: person.email,
//       password: person.password,
//     });

//   auth
//     .createUserWithEmailAndPassword(person.email, person.password)
//     .then((user) => {
//       //console.log(user);
//     })
//     .catch(function (error) {
//       // Handle Errors here.
//       console.log(error);
//       var errorCode = error.code;
//       var errorMessage = error.message;
//       // ...
//     });

//   res.redirect("/login");
// });

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  auth
    .signInWithEmailAndPassword(email, password)
    .then((users) => {
      //console.log(users.user);
      res.redirect("/profile");
      return;
    })
    .catch((err) => {
      res.redirect("/profile");
      JSAlert.alert("No Such User");
      return;
    });
});

app.get("/profile", (req, res) => {
  if (auth.currentUser) {
    const { displayName, email, photoURL } = auth.currentUser;
    res.render("profile", { displayName, email, photoURL });
  } else res.redirect("/login");
});

app.get("/edit", (req, res) => {
  if (auth.currentUser) {
    const user = auth.currentUser;
    res.render("edit", { user });
  } else res.redirect("/login");
});

app.post("/edit", (req, res) => {
  const displayName = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  let profile = auth.currentUser;
  const photoURL = req.body.image;

  profile
    .updateProfile({
      displayName,
      photoURL,
    })
    .then(function () {
      // Update successful.
      console.log("success");
      profile
        .updateEmail(email)
        .then(function () {
          console.log("email changed");
          profile
            .updatePassword(password)
            .then(function () {
              // Update successful.
              console.log("password updated");
            })
            .catch(function (error) {
              // An error happened.
            });
          // Update successful
        })
        .catch(function (error) {
          console.log(error);
          // An error happened.
        });

      // firebase
      //   .database()
      //   .ref("/users/" + _uuid.v4())
      //   .set({
      //     username: displayName,
      //     email: email,
      //     password: password,
      //   });
    })
    .catch(function (error) {
      // Handle Errors here.
    });
  res.redirect("/profile");
  //console.log(user);
});

app.use(express.static(path.join(__dirname, "/public")));

app.listen(port, () => {
  console.log("Listening to 3001");
});
