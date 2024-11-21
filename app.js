require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const userModel = require("./models/user");
const studentModel = require("./models/student");
const subjectModel = require("./models/subject");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const upload = require("./config/multerconfig");
const user = require("./models/user");
app.use('/uploads', express.static('uploads'));

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 3000; // Use 3000 as a fallback
const MONGODB_URI = process.env.MONGODB_URI;

app.get('/', (req, res) => {
    res.render('landing');
});

app.get('/about', (req,res) =>{
    res.render('about');
})

// app.get('/dashboard/upload', isLoggedIn, (req, res) => {
//     res.render('profileupload');
// });

// app.post('/upload', isLoggedIn, upload.single('profilePicture'), async (req, res) => {
//     let user = await userModel.findOne({ email: req.user.email });
//     user.profilepic = req.file.filename;
//     await user.save();
//     res.redirect("/student-dashboard");
// });

// Role-Based User Creation
app.post('/create', async (req, res) => {
    let { username, email, password, role } = req.body;

    if (role === 'Teacher') {
        const existingTeacher = await userModel.findOne({ role: 'Teacher' });
        if (existingTeacher) {
            return res.render('teacherror');
        }
    }

    if (!['Student', 'Teacher'].includes(role)) {
        return res.status(400).send("Invalid role! Role must be 'student' or 'teacher'.");
    }

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let createdUser = await userModel.create({
                username,
                email,
                password: hash,
                role // Save the role in the database
            });

            let token = jwt.sign({ email: email, userid: createdUser._id, role }, 'hello');
            res.cookie('token', token);
            res.send(createdUser);
        });
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('index');
});

app.get('/dashboard', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    console.log(user);

    // Redirect based on the user's role
    if (user.role === 'Student') {
        res.redirect('/student-dashboard');
    } else if (user.role === 'Teacher') {
        res.redirect('/teacher-dashboard');
    } else {
        res.status(403).send("Access denied!"); // Handle unexpected roles
    }
});

// Role-Based Login
app.post('/login', async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.send("User not found!");

    bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (result) {
            let token = jwt.sign({ _id: user._id, email: user.email, role: user.role }, 'hello');
            res.cookie('token', token);
            res.redirect("/dashboard");
        } else {
            res.send("Incorrect password!");
        }
    });
});

app.get("/logout", (req, res) => {
    res.cookie('token', "");
    res.render('landing');
});

// Middleware to Check Login and Role
function isLoggedIn(req, res, next) {
    if (req.cookies.token == "") res.redirect("/login");
    else {
        try {
            let data = jwt.verify(req.cookies.token, "hello");
            req.user = data; // Attach user data (including role) to the request
            console.log("User data from token:", req.user);
            next();
        } catch (err) {
            res.redirect("/login");
        }
    }
}

// Middleware for Role Authorization
function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).send("Access denied!");
        }
        next();
    };
}

// Teacher Dashboard Route
app.get('/teacher-dashboard', isLoggedIn, authorizeRole('Teacher'), async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    res.render('teacherdash', { user });
});

app.get('/student-dashboard', isLoggedIn, authorizeRole('Student'), upload.single('profilePicture'), async (req, res) => {
    // Fetch the logged-in user's data
    const user = await userModel.findById(req.user._id);

    if (!user) {
        return res.status(404).send('User not found');
    }

    // Fetch the corresponding student data based on the user's email
    const studentData = await studentModel.findOne({ email: user.email });

    if (!studentData) {
        return res.render('stderror');
    }

    if (studentData) {
        const subjectData = await subjectModel.findOne({ email: studentData.email });
    
        res.render("dashboard", { user, studentData, subjectData });
    } else {
        res.render("dashboard", { user, studentData: null, subjectData: null });
    }
});

// Route to render the form
app.get('/teacher-dashboard/students/add', isLoggedIn, authorizeRole('Teacher'), (req, res) => {
    res.render('addstudent');
});

// Route to handle form submission
app.post('/teacher-dashboard/students/add', isLoggedIn, authorizeRole('Teacher'), upload.single('profilePicture'), async (req, res) => {
    const { email, name, Class, rollno, dob, phone, address, } = req.body;

        // Validate email existence
        if (!email) {
            return res.status(400).send('Email is required');
        }

        // Ensure the email exists in the users collection and belongs to a Student
        const user = await userModel.findOne({ email, role: 'Student' });
        if (!user) {
            return res.status(404).send('No user found with this email or not a student');
        }

    let student = new studentModel({
        name,   
        Class,
        rollno,
        dob,
        email,
        phone,
        address,
        profilePicture: req.file ? req.file.path : null
    });
    
    await student.save();
    res.redirect("/teacher-dashboard/students");
});

app.get('/teacher-dashboard/students', isLoggedIn, upload.single('profilePicture'), async (req, res) => {
    let student = await studentModel.find();
    const studentsWithMarksStatus = await Promise.all(
        student.map(async (student) => {
            const hasMarks = await subjectModel.exists({ email: student.email });
            return {
                ...student.toObject(), // Convert Mongoose document to plain object
                hasMarks,
            };
        })
    );
    res.render('students', { student: studentsWithMarksStatus });
})

app.get('/teacher-dashboard/students/delete/:id', isLoggedIn, async (req, res) => {
    let student = await studentModel.findByIdAndDelete(req.params.id);

    if (student) {
        await subjectModel.findOneAndDelete({ email: student.email });
        res.redirect("/teacher-dashboard/students");
    }
});

app.get('/teacher-dashboard/students/edit/:id', isLoggedIn, async (req, res) => {
    let student = await studentModel.findById({_id: req.params.id})
    res.render("update", {student})
})

app.post('/teacher-dashboard/students/update/:id', isLoggedIn, upload.single('profilePicture'), async (req, res) => {
    // Prepare updated student data
    let updatedStudent = {
        name: req.body.name,
        Class: req.body.class,
        rollno: req.body.schoolName,
        dob: req.body.dob,
        phone: req.body.phone,
        address: req.body.address,
        profilePicture: req.file ? req.file.path : req.body.profilePicture // If new file is uploaded, use that, else keep the old one
    };

    await studentModel.findByIdAndUpdate(req.params.id, updatedStudent); // Update student by ID
    res.redirect('/teacher-dashboard/students'); // Redirect to the students list page
});

app.get('/teacher-dashboard/students/subjects/:id', isLoggedIn, authorizeRole('Teacher'), async (req, res) => {
    // Find the student by ID
    let student = await studentModel.findById(req.params.id);

    // Check if student exists
    if (!student) {
        return res.status(404).send('Student not found');
    }

    // Pass the student data to the EJS view
    res.render("subject", { student }); // This passes the student object to the view
});

app.post('/teacher-dashboard/students/subjects/:id', isLoggedIn, authorizeRole('Teacher'), async (req, res) => {
    let { email, science, maths, socialscience, english } = req.body;

    console.log('Received marks:', { science, maths, socialscience, english });

    // Parse marks as numbers
    science = parseFloat(science);
    maths = parseFloat(maths);
    socialscience = parseFloat(socialscience);
    english = parseFloat(english);

    console.log('Parsed marks:', { science, maths, socialscience, english });


    // Calculate total marks
    const TotalMarks = science + maths + socialscience + english;

    console.log('Calculated TotalMarks:', TotalMarks);

    // Make sure the total marks is a valid number
    // if (isNaN(TotalMarks)) {
    //     return res.status(400).send('Total marks calculation failed.');
    // }

    // Find the student
    let student = await studentModel.findById(req.params.id);
    if (!student) {
        return res.status(404).send('Student not found');
    }

    // Create new Subject document with the marks and email
    const newMarks = new subjectModel({
        email,
        science,
        maths,
        socialscience,
        english,
        TotalMarks
    });

    // Save the new marks
    await newMarks.save();

    // Redirect or render the page as needed
    res.redirect('/teacher-dashboard/students');
});

app.get('/teacher-dashboard/students/view-marks/:email',isLoggedIn, authorizeRole('Teacher'), async (req,res) => {
    const email = req.params.email;
    console.log("View Marks Route Accessed for Email: " + email);
    const marks = await subjectModel.findOne({email});
    if(!marks){
        return res.send("Marks Not Found For this Student");
    }
    res.render('viewmarks', {marks});
})

app.listen(3000);