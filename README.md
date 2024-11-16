# CFH_Task
Internship Task
Hello This Teodore Farag Task,
1.Setup Instruction:
First create a folder in your directory.
Second open the folder in VScode.
Third open terminal and make sure that the current directory is the folder directory, if not write cd "YOUR-FOLDER-PATH".
Fourth write in the terminal git clone https://github.com/Teodore-Farag/CFH_Task, the files should download to your directory.
Fifth in the terminal write npm install to install all the dependencies in this project.
Lastly, write nodemon server to run the backend.

2.Database
I used online free sql database to avoid conflecting setups, everything in the .env file so no worries.
The database structured as 2 tables, one for users and one for tasks.
The users table schema is as follows: The user have an ID,UserName,Passeord,Email. The user ID is the primary key and the username is unique.
The tasks table schema is as follows: the task have ID, DueDate, Status, UserID, Title, and Description.
The TaskID is the primary key and the UserID is the Secondry key.
The Status are enum of three: [Completed, Not Started, Pending].
The relationship between the tables are one user to zero or more tasks.

3.API Documentation
First API is the Sign Up
app.post('/signUp', signUp)
This API creates new user and takes as an input three parameters Username(unique),Password(gets hashed for security),and email(have a regex check)
In postman make a post reguest using the url http://localhost:3000/signUp
and in the body select raw-> JSON format and write the query
{
"username": "Name",
"password": "Pass",
"email": "email@gmail.com"
}
feel free to edit the data 

Second API is Sign In
app.post('/signIn',signIn)
This API logs the user in creating an Authorization Secret Key
It takes input username and password to login
In postman make a post request using the url http://localhost:3000/signIn
and in the body select raw-> JSON format and write the query
{
    "username": "Name",
  "password": "Pass"
}
It will return the authorization key take a copy of it because it will be needed for further API calls.
After this API call take the retuned key and inject it in the postman header section and write in the key field: Authorization
and in the value section: Bearer [authorization key] without the brackets.
this header section is used to authenticate all the following methods as it requires an authorization, so without nothing will run.

Third API lets the user see all his tasks
app.get('/tasks',authenticate,showTasks) 
In postman make a get reguest using the url http://localhost:3000/tasks
you are not required to write anything in the body, but make sure you added the authorization key.
This method returns a list of the users Tasks

Fourth API lets the user see a specific task according to Task ID
app.get('/task/:id',authenticate,showTask)
In postman make a get reguest using the url http://localhost:3000/tasks/:id
where :id is the ID of any Task the user have. If the user entered an ID the he cannot access or does not exists then it will return an empty array.
you are not required to write anything in the body, but make sure you added the authorization key.

Fifth API lets the user create a new task
app.post('/createTask',authenticate,createTask)
In postman make a post reguest using the url http://localhost:3000/createTask
and in the body select raw-> JSON format and write the query
{
    "Title": "Test",
  "Description": "Intern",
  "Due_Date":"2024-12-10",
  "Status": "Completed"
}
The inserted values should not be null, else it will throw an exception. Also the date should be past today`s date. Make sure you added the authorization key. If everything is fine it will return "Created Succesfully". Duplicate tasks can be generated but it will have different Task ID

Sixth API lets the user updates any field in a Task
app.post('/updateTask/:id',authenticate,updateTask)
In postman make a post reguest using the url http://localhost:3000/updateTask/:id where the :id is the id of the task that is going to be updated. And in the body select raw-> JSON format and write the query
{
   "Title":"UpdateWork"
}
You can change from one to all fields of a task. If everything is fine it will return ("Updated Succesfully")

Seventh API lets the user delete a specific task using its id
app.post('/deleteTask/:id',authenticate,deleteTask)
In postman make a post reguest using the url http://localhost:3000/deleteTask/:id where the :id is the id of the task that is going to be deleted.
If a user inputs an id that does not exist in his list of tasks it will return ("User Does not have access to this task),
else the task will get deleted and amessage will appear (Task deleted Succesfully).

Important note Add the Authorization key in all API containing userAuthentication.

Well That's the end of the documentation, thanks for your time and effort and i am happy to hear a feedback from you.