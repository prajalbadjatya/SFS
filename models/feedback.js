const mongoose = require('mongoose');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var FeedbackSchema = new mongoose.Schema({
    //teacher username
    username: {
        type: String,
        required: true,
        minlength: 6,
        trim: true
    },
    //Branch for which the feedback form is created
    branch: {
        type: String, 
        required: true,
        minlength:2,
        trim:2
    },
    //year for which the feedback form is created
    year:{
        type: String, 
        required :true,
        minlength:1,
        maxlength:1
    },

    date:{
        type: Date,
        default: Date.now
    },
    responses: [
        {
            rollno:{
                type: Number,
                minlength: 10,
                trim: true
            },
            question1 :{
                type: String,
            },
            question2 :{
                type: String,
            },
            question3 :{
                type: String,
            },
            question4 :{
                type: String,
            },
            question5 :{
                type: String,
            }
        }
    ]
});


//To find all the feedback forms available to fill for this user
FeedbackSchema.statics.findFormsByBranch = function(branch){
    var Feedback = this;
    console.log(branch);
    return new Promise( (resolve, reject)=> {
        Feedback.findOne({branch}).then((form)=>{
            if(form){
                return resolve('form is found');
            }else{
                return reject('Form does not exist');
            }
        });
    });
};



//Creating Mongoose Model
var Feedback = mongoose.model('Feedback', FeedbackSchema);

//Exporting Users 
module.exports = {
    Feedback
};





























































// FeedbackSchema.methods.toJSON = function() {
//     var user = this;
//     var userObject = user.toObject();

//     return _.pick(userObject, ['_id','username','branch','rollno','feedbacktype','email','feedback','read']);
// }

// FeedbackSchema.statics.fetchFeedbacks = function(){
//     var Feedback = this;
//     return Feedback.find({}).sort({
//         _id: -1
//     }).then((feedbacks)=>{
        
//            if(feedbacks){
//                console.log("Feedbacks Found");
//                return Promise.resolve(feedbacks);
//            }       
//            else{
//                console.log("Feedbacks Not Found");
//                return Promise.reject(err);
//            }
//     });
// }




// //Print all feedbacks
// FeedbackSchema.statics.printAllFeedbacks =function(){
//     var Feedback = this;
//     return Feedback.find({}).then( (feedbacks) => {
//         if(feedbacks){
//             console.log('Feedbacks found');
//             //console.log(feedbacks);
//             return Promise.resolve(feedbacks);
//         }
//         else{
//             console.log('Feedbacks Not found');
//             return Promise.reject(err);
//         }
//     })
// }


// //Creating Mongoose Model
// var Feedback = mongoose.model('Feedback', FeedbackSchema);

// //Exporting Users 
// module.exports = {
//     Feedback
// };


































// var FeedbackSchema = new mongoose.Schema({
//     username: {
//         type: String,
//         required: true,
//         minlength: 6,
//         trim: true
//     },
//     branch: {
//         type: String,
//         required: true,
//         minlength: 2,
//         trim: true
//     },
//     rollno: {
//         type: Number,
//         required: true,
//         minlength: 10,
//         trim: true
//     },
//     feedbacktype : {
//         type: String,
//         required: true,
//         minlength: 6,
//         trim: true
//     },
//     email: {
//         type: String,
//         required: true,
//         minlength: 10,
//         trim: true
//     },
//     feedback: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     read: {
//         type: Boolean,
//         required: true
//     }
// });