
# EazySkool

EazySkool is a Student Dashboard Management System is a web- based 
application designed to streamline the management of student 
data and academic records. The system provides role-based 
access, allowing teachers (admins) to perform CRUD (Create, 
Read, Update, Delete) operations on student details and marks 
while enabling students to view their personal and academic 
information on a dynamic dashboard. 

# Key Features

**Centralized Data Management**: To create a centralized system where student details and marks can be efficiently stored, managed, and retrieved. 

**Role-Based Access**: To implement a secure login system for both teachers (admin) and students, ensuring authorized access to data.

**CRUD Functionality**: To enable teachers to perform Create, Read, Update, and Delete (CRUD) operations on student details and marks. 

**Personalized Student Dashboard**: To provide students with an intuitive dashboard to view their academic records and personal information in real-time. 

**User-Friendly Interface**: To design a user-friendly interface that simplifies interactions for both teachers and students


## Tech Stack

**HTML(Ejs), Tailwind CSS:** Ejs works for Client side and Server side 

**Node, Express:** Server Side Functionalities.

**Authentication:** Uses bcrypt, jsonwebtoken and cookie-parser library to have secured password and Session.

## Features (Teacher Dashboard)

- **Create :** Form to Add Student and Add Marks
- **Read :** View Student Details and View Marks. if the student have added marks by teacher, else Add Marks
- **Update :** Update Student Deatils
- **Delete :** Delete Student Details

## Features (Student Dashboard)
- **View**: The Details of Each student will render on their Dashboard (personalized User Experience).


## Run Locally
Before this, Install MongoDB Compass and Create a database, Copy the link of the connection and paste it in /models/user.js 

Clone the project

```bash
  git clone https://github.com/shadow-dawg/EazySkool.git
```

Go to the project directory

```bash
  cd EazySkool
```

Install dependencies

```bash
  npm install ejs cookie-parser bcrypt jwt express 
```

Start the server
You can use PORT:3000

```bash
  npm run app.js
```


## Screenshots

**Landing Page:**

![landing](https://github.com/user-attachments/assets/f6ae89e9-657c-4dd3-bcba-074fe03a6411)

**RBA Authentication:**

![signup](https://github.com/user-attachments/assets/1a3949e5-d04d-4b89-9609-85923f7bbb3f)

**Login:**

![login](https://github.com/user-attachments/assets/2b2a0f29-d0ee-4f0d-b680-96c9125c0367)

**Student Dashboard:** 

![dash](https://github.com/user-attachments/assets/b611b128-9086-4897-a374-0a623680baf2)

**Teacher Dashboard:**

![teacherdashboard](https://github.com/user-attachments/assets/a99b7d29-90f1-4f33-a9ea-eacd8fa95860)

**Teacher Dashboard/Students:** All These 4 Functions Works.

![students](https://github.com/user-attachments/assets/f222599e-96d3-4f88-8ff1-49bc7b1154df)


## Lessons Learned

What did you learn while building this project?   
-> I learned basics of nodejs, express and mongodb and how can we create a basic userAuth with sessions and cookies. In this project, there are many functions that renders dynamic content as for teacher and student behaviour.


What challenges do you face while building this project?  
-> There are few limitations in this project like about the rendering of profile Picture of Student when the teacher added the student picture into the database, I will make sure to solve that in future.

