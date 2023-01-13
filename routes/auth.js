const express = require('express')
const router = express.Router();
const User = require('../Models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "Sumanisagood$boy!";
const fetchuser = require("../middleware/fetchuser")



// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser', [

  // name must be at least 3 chars long
  body('name', 'Enter a valid name').isLength({ min: 3 }),

  // username must be an email
  body('email', 'Enter a valid email').isEmail(),

  // password must be at least 5 chars long
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),

], async (req, res) => {

  // if there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // check wheather the user with this email exists already
    let user = await User.findOne({ email: req.body.email });
    console.log(user)
    if (user) {
      return res.status(400).json({ error: "Sorry a user with this email already exists" });
    }


    // BcryptJS
    const salt = await bcrypt.genSaltSync(10);
    const securePassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: securePassword,
    });
     
    // JWT TOKEN
    const data = {
      user:{
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
  //  console.log(authToken);
    
   res.json({authToken});
   
      // res.json(user)
      // res.json({"nice":"nice"})
      // res.send(req.body)

 
  }   
   // Catch errors
  catch (error) {
    console.error(error.message);
    res.status(500).send("Some Error occured!");
  }  
})



// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login', [

  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
 
], async (req, res) => {

  // if there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {email, password} = req.body;
  try{
    let user = await User.findOne({email});
    if(!user){
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }
 
    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare){
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    // JWT TOKEN
    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
  //  console.log(authToken);

    res.json({ authToken });

  }catch(error){
    console.error(error.message);
    res.status(500).send("Internal server occured !");
  }})



  // ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser".login required
  router.post('/getuser',fetchuser, async (req,res)=>{
    try {
      userId = req.user.id;
      const user = await User.findById(userId).select("-password");
      res.send(user)
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  })



module.exports = router