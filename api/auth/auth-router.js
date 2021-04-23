const router = require('express').Router();
const db = require("../../data/dbConfig.js")
const bcrypt = require("bcryptjs")
const {JWT_SECRET} = require("../secret/secret.js")
const jwt = require("jsonwebtoken")

router.post('/register', async (req, res) => {
    //Probably should be middleware
    if(!req.body.username || !req.body.password){
        return res.status(401).json({message:"username and password required"})
    }

    //Should be middleware too
    const exists = await db("users").where({username:req.body.username})
    if (exists.length > 0){
        return res.status(401).json({message:"username taken"})
    }

    db("users").insert(req.body).then(ids=>{return db("users").where("id",ids[0])})
    .then(user=>{
        res.status(201).json(user)
    })
    .catch(err=>{
        res.status(500).json(err.message)
    })
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', async (req, res) => {
    if(!req.body.username || !req.body.password){
        return res.status(401).json({message:"username and password required"})
    }
    const exists = await db("users").where({username:req.body.username}).then(data=>{return data[0]})
    if (!exists || exists.length === 0 || !bcrypt.compareSync(req.body.password, exists.password)){
        return res.status(401).json({message:"invalid credentials"})
    }
    const token = makeToken(exists)
    res.status(200).json({
        message:`welcome, ${exists.username}`,
        token: token
    })
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

function makeToken(user){
    const payload = {
        subject: user.id,
        username: user.username
    }
    const options = {
        expiresIn: "1d"
    }
    return jwt.sign(payload,JWT_SECRET,options)
}

module.exports = router;
