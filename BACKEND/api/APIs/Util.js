const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  const usersCollection = req.app.get("usersCollection");
  const user = req.body;
  const dbuser = await usersCollection.findOne({ username: user.username });
  if (dbuser !== null) return res.send({ message: "User already exists" });
  const hashedPassword = await bcrypt.hash(user.password, 7); // put salt in env
  user.password = hashedPassword;
  await usersCollection.insertOne(user);
  return res.send({ message: "User created", payload: user });
};

const userLogin = async (req, res) => {
  let usersCollection = req.app.get("usersCollection");
  const userCred = req.body;
  console.log(userCred)
  await usersCollection.findOne({ username: userCred.username })
  .then(async (dbuser)=>{
  if (dbuser === null) return res.send({ message: "Invalid username" });
  else {
    let status = await bcrypt.compare(userCred.password, dbuser.password);
    if (status === false) {
      return res.send({ message: "Invalid password" });
    } else {
      const signedToken = jwt.sign({ username: userCred.username }, "abcdef", { //put secret key in env
        expiresIn: '1d',
      }); 
      delete dbuser.password;
      res.send({ message: "Login success", token: signedToken, user: dbuser });
    }
  }})
  .catch((err)=>{
    res.send({ message: "db error", error: err });
  });
};
module.exports = { createUser, userLogin };
