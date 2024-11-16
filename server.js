const express=require('express')
const app=express()
app.use(express.json()); 
const {showTasks,signUp,signIn,authenticate,showTask,createTask,updateTask,deleteTask} =require( './app.js')
const bcrypt = require('bcrypt')
app.post('/signUp', signUp)
app.post('/signIn',signIn)
app.get('/tasks',authenticate,showTasks)  
app.get('/task/:id',authenticate,showTask)
app.post('/createTask',authenticate,createTask)
app.post('/updateTask/:id',authenticate,updateTask)
app.post('/deleteTask/:id',authenticate,deleteTask)
app.listen(3000)