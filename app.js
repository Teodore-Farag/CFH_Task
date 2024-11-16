const mysql = require('mysql2');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());
console.log()
// Configure database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_USER
});
const dbPromise = db.promise();

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the MySQL cloud database!');
});

// Show tasks for the logged-in user
const showTasks = async (req, res) => {
  try {
    const [results] = await dbPromise.query('SELECT * FROM Tasks WHERE UserID = ?', [req.user.id]);
    return res.json(results);
  } catch (error) {
    console.error('Error querying the database:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
};

const showTask=async(req,res)=>{
  TaskId=req.params.id;
  try {
    const result = await dbPromise.query('SELECT * FROM Tasks WHERE UserID = ? AND TaskID=?', [req.user.id,TaskId]);
    return res.json(result[0]);
  } catch (error) {
    console.error('Error querying the database:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve tasks' });
  }

}
const createTask=async(req,res)=>{
  const{Title,Description,Due_Date,Status}=req.body;
  const userID=req.user.id;
  if(!Title){
    res.json("Missing Title while creating");
  }
  if(!Description){
    res.json("Missing Description while creating");
  }
  if(!Due_Date || Due_Date<new Date()){
    res.json("Invalid Due_Date while creating");
  }
  if(!Status || Status!='Pending' && Status!='Not Started'&& Status!='Completed'){
    res.json("Invalid Status while creating, Status availabe:[Pending,Not Started,Completed]");
  }
  try {
    console.log( [Title,Description,Due_Date,Status,userID])
    const result = await dbPromise.query('INSERT INTO Tasks (Title, Description, DueDate, Status, UserID)  VALUES (?, ?, ?,?,?)',
       [Title,Description,Due_Date,Status,userID]);
    return res.status(201).json("Created Succesfully");
  } catch (error) {
    console.error('Error querying the database:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
}
const updateTask=async(req,res)=>{
  TaskId=req.params.id;
  var{Title,Description,Due_Date,Status}=req.body;
  if(Status){
  if(Status!='Pending' && Status!='Not Started'&& Status!='Completed'){
    return res.json("Invalid Status while creating, Status availabe:[Pending,Not Started,Completed]");
  }}
  try {
    const [result] = await dbPromise.query('SELECT * FROM Tasks WHERE UserID = ? AND TaskID=?', [req.user.id,TaskId]);
    if(!Title){
      Title=result[0].Title;
    }
    if(!Description){
      Description=result[0].Description;
    }
    if(!Due_Date){
      Due_Date=result[0].DueDate;
    }
    if(!Status){
      Status=result[0].Status;
    }
    // console.log([Title,Description,Due_Date,Status,req.user.id,TaskId])
    await dbPromise.query('UPDATE Tasks SET Title=? , Description =? ,DueDate=?,Status=? WHERE UserID = ? AND TaskID=?', [Title,Description,Due_Date,Status,req.user.id,TaskId]);
    res.json("Updated Succesfully");
  } catch (error) {
    console.error('Error querying the database:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
}
const deleteTask=async(req,res)=>{
  TaskId=req.params.id;
  try{
    const [result] = await dbPromise.query('SELECT * FROM Tasks WHERE UserID = ? AND TaskID=?', [req.user.id,TaskId]);
    if(result.length==0){
     return res.json("User Does Not have This Task")
    }
    await dbPromise.query('DELETE FROM Tasks WHERE UserID = ? AND TaskID=?', [req.user.id,TaskId]);
    return res.json("Deleted Succesfully");
  }
  catch(error){
    console.error('Error querying the database:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
}
// Validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sign up a new user
const signUp = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Check for missing fields
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email format is valid
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if the username already exists
    const [results] = await dbPromise.query('SELECT * FROM Users WHERE UserName = ?', [username]);

    if (results.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash the password and create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    await dbPromise.query('INSERT INTO Users (UserName, Password, Email) VALUES (?, ?, ?)', [username, hashedPassword, email]);

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error querying the database:', error.message);
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

// Sign in a user
const signIn = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    const [results] = await dbPromise.query('SELECT * FROM Users WHERE UserName = ?', [username]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Username does not exist' });
    }

    const user = results[0];

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    // Create and sign a JWT token
    const accessToken = jwt.sign({ id: user.ID, username: user.UserName }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // Secure flag for HTTPS in production
      sameSite: 'Strict',  // Prevent CSRF attacks
      maxAge: 3600000  // 1 hour
    });
    return res.json({accessToken:accessToken});
  } catch (error) {
    console.error('Error querying the database:', error.message);
    return  res.status(500).json({ error: 'Failed to sign in' });
  }
};

// Middleware to authenticate the token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // Attach decoded user data to request
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
// Export the connection
module.exports = {showTasks,signUp,signIn,authenticate,showTask,createTask,updateTask,deleteTask};
