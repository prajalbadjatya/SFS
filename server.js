const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const http = require('http');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const randomString = require('randomstring');
const nodemailer = require('nodemailer')
const mailer = require('./controller/mailer.js')
const ejs = require('ejs');
const dotenv = require('dotenv').config();

const expressValidator = require('express-validator');
const ensureAuth = require('./controller/authenticate.js')


const passport = require('passport');
const passportConf = require('./passport.js')

//Bringing in the models
var {Users} = require('./models/users.js');
var {Feedback} = require('./models/feedback.js');


//Connect to DB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URI}` , {
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:true, 
        useUnifiedTopology:true
    });

    console.log(`MongoDB connected`)
    } catch (error) {
        console.log(error);
    }
};
connectDB();



const port = process.env.PORT || 5000;
var app = express();
var server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/public/views'));



app.use(bodyParser.json())
app.use(bodyParser.urlencoded( {extended: false} ));

// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



//Configure Session
var sessionMiddleware = session({
    secret: `${process.env.secret}`,
    resave:false,
    saveUninitialized: false,
    cookie:{
        maxAge: 100000000000000
    }
});

//Session Middleware
app.use(sessionMiddleware);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


app.use(flash());
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});



app.get('/', (req,res)=> {
    res.render('index');
})

app.get('/login1', (req,res)=> {
    res.render('login');
})


app.get('/feedback',ensureAuth,async(req,res)=>{
    //console.log(req.user);

    const userDetails = req.user;
    console.log(userDetails);
    try{
        const form = await Feedback.find({branch:'CSE'});
        res.render('feedback',{feedbackforms:form, user: userDetails} ); 
    }catch(err){
        res.json(err);
    }

   
});

app.get('/forgotPassword',(req,res)=>{
   res.render('forgotPass'); 
});

app.get('/changePassEmail',(req,res)=>{
   res.render('changePass'); 
});



app.post('/preUserRegister',[
  
    check('password', 'passwords must be at least 5 chars long and contain one number')
      .isLength({ min: 5 }).withMessage('Min length for Password is 5'),
    
    check('email')
      .isEmail().withMessage('must be an email')
      .custom(value => {
          return Users.findByEmail(value).catch((err)=>{
                throw new Error('this email is already in use');
          });
    })    
  ],(req,res)=>{
    var body = _.pick(req.body,['password','email']);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('register',{ 
            errors: errors.mapped() 
        });
    }
    else{
    
        var user = new Users(body);
        var secrettoken = randomString.generate();
        user.secretToken = secrettoken;
        user.category = 'student';
        user.active = false;
        
        user.save();
        
        const link = "http://localhost:5000/verify/"+secrettoken;
        
        req.flash('success_msg','We sent you an verification email. Please do verify your account!');
        const html = `<h1>Demo</h1>`;

        // mailer.sendEmail('StudentFeedbackSystem@sgsits.com','prajalbadjatya@gmail.com','Change your SFS Password!',html);
        console.log(link);
        
        res.redirect('/register');
    }
});



app.post('/postUserRegister',[
    
    check('username')
    .isLength({ min: 1 }).withMessage('Min and Max length for year of study is 1'),
    // .exists()
    // .isString().withMessage('Username must be a String')
    // .custom(value => {
    //   return Users.findByUsername(value).catch((err)=>{
    //       throw new Error('this username is already in use');
    //   });
    // }),

    
    check('branch')
      .isLength({min: 3}).withMessage('Min length for branch is 3')
      .exists()
      .isString().withMessage('Branch must be a String'),
    
    check('rollno')
      .isInt().withMessage('RollNo must be an Integer')
      .isLength({min: 10}).withMessage('RollNo must be 10 digits long')
      .custom(value => {
        return Users.findByRollno(value).catch((err)=>{
                throw new Error('An Account is already linked with this Rollno');
        });
    }),
    
],(req,res)=>{
    var body = _.pick(req.body,['username','branch','rollno','email']);
    
    Users.findOne({
        email: body.email
    }).then((user)=>{
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            
            console.log(errors);
            Users.remove({
                email: body.email
            }).then((err,user)=>{
                if(err){
                    console.log(err);
                    console.log("Error deleting User");
                }
                console.log("User Successfully deleted"); 
            });
            
            res.render('register',{ 
                errors: errors.mapped() 
            });
        }
        else{
            user.year = body.username;
            user.branch = body.branch;
            user.rollno = body.rollno;
            user.save().then((user)=>{
                console.log("Profile successfully Updated");
                req.flash('success_msg','We have set up your account. Please login');
                res.redirect('/login1');
            });
        }        
        
    });
    
});

passportConf(passport);



app.get('/register', (req,res)=> {
    res.render('register');
})


//Verify Secret Token Route
app.get('/verify/:secretToken',(req,res)=>{
    Users.findOne({
        secretToken: req.params.secretToken
    }).then((user)=>{
        
       if(!user){
           req.flash('error','Verification Failed');
           res.redirect('/register');
           return;
       }
        
       user.active = true;
       user.secretToken = '';
       user.save().then((user)=>{
           res.render('profile',user);
       });
        
       
    });
});



//Login Route
app.post('/login',
  passport.authenticate('local',{
    failureRedirect: '/login1',
    failureFlash: true    
  }),(req,res)=>{
    
    if(req.body.radio === 'student'){
        
        if(req.user.category == 'admin'){
            req.flash('error','Login with a student email');
            console.log('Login with a student email')
            res.redirect('/login1');
            return;
        }
        
        res.redirect('/feedback');
    }
    else if(req.body.radio === 'admin'){ 
        
        if(req.user.category == 'student'){
            req.flash('error','Login with an admin email');
            res.redirect('/login1');
            return;
        }

        res.render('adminDashboard')
    }
});

//Verify forgot email
app.post('/verifyForgotEmail', [
    check('email').isEmail().withMessage('Must be a valid Email').custom( value => {
        return Users.findByForgotEmail(value).catch( (err)=> {
            if(err){
                throw new Error('No account is linked with this mail!')
            }
        });
    })
], (req,res)=> {
    var body = _.pick(req.body,['email']);

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.render('forgotPass',{
            errors: errors.mapped()
        });
    }
    else 
    {
        var secretToken = randomString.generate();
        Users.findOne( {email : body.email}).then( (user)=> {
            user.forgotPassSecret = secretToken;
            user.save();


            const link = "http://localhost:5000/forgotPassword/"+secretToken;
            console.log(link);
            req.flash('success_msg' , 'We have sent you a link to change your Password');
            res.redirect('/forgotPassword');
        })
    }
});



//Verify change password
app.get('/forgotPassword/:secretToken', (req,res)=> {
    Users.findOne( {
        forgotPassSecret : req.params.secretToken
    }).then( (user)=> {
        if(!user){
            req.flash('error','Invalid token');
            res.redirect('/login1');
            return;
        }
        res.render('changePass',user);
    })
})


//Change Password route
app.post('/changePassword' , (req,res)=> {
    var {email , newPassword , confirmPassword} = req.body;
    if(newPassword != confirmPassword){
        req.flash('error','Passwords do not match');
        res.redirect('/login1');
    }
    else{
        console.log('Password updated');
        req.flash('success_msg', 'Password updated successfully!');
        res.redirect('/login1');
    }

})


//Logout Route
app.post('/logOut',(req,res)=>{
    req.logout();
    
    req.flash('success_msg','You are logged out!');
    
    res.redirect('/');
});

app.post('/feedback',ensureAuth,(req,res)=>{
    console.log('hello');
    var body = _.pick(req.body,['email','username','rollno','branch','feedbacktype','feedback']);
    var feedback = new Feedback(body);
    feedback.read = true;
    feedback.save().then((feedback)=>{
        req.flash('success_msg', 'Feedback saved successfully');
        res.render('feedback',body);
    }).catch((e)=>{
         console.log(e);
         res.render('feedback');
    });
     
     
 });




//ADMIN ROUTES FROM HERE


app.get('/adminFeedback', (req,res)=> {
    res.render('adminDashboard');
})


app.get('/createnewform', (req,res)=>{
    res.render("newForm");
})



//Route for creating new feedback form
app.post('/createnewform',[
  
    check('branch', 'Branch must be CSE')
      .isIn(['CSE']).withMessage('Min length for Password is 5'),
    
    check('year').isIn(['1','2','3','4']).withMessage('Year must be 1 2 3 or 4')
        
  ],(req,res)=>{
    var body = _.pick(req.body,['branch','year']);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        res.render('newForm',{ 
            errors: errors.mapped() 
        });
    }
    else{
        
        //username is the id
        const username = req.session.passport.user;
        console.log(username);

        const newFeedbackForm = new Feedback({
            username: username, 
            branch: req.body.branch,
            year: req.body.year
        });
        
        newFeedbackForm.save().then((feedback)=> {
            req.flash('success_msg', 'Feedback form created successfully');
            res.send('Feedback form created successfully');
        }).catch((e)=>{
            console.log(e);
            res.send('There was an error while creating new feedback form');
        })
       
    }
});



server.listen(port, ()=> {
    console.log(`Server is up on PORT ${port}`);
})