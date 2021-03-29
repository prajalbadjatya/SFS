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
    questions : [
        {
        question :{
            text:{
                type: String,
                required:true
            },
            responses:[
                {
                    rollno:{
                        type:Number,
                        minlength:5,
                        trim:true
                    },
                    ans:{
                        type: String
                    },
                    star: {
                        type: String
                    }
                }

            ]
        }
        }
    ]
});


//To find all the feedback forms available to fill for this user
// FeedbackSchema.statics.findFormsByBranch = function(branch){
//     var Feedback = this;
//     console.log(branch);
//     return new Promise( (resolve, reject)=> {
//         Feedback.findOne({branch}).then((form)=>{
//             if(form){
//                 return resolve('form is found');
//             }else{
//                 return reject('Form does not exist');
//             }
//         });
//     });
// };



//Creating Mongoose Model
var Feedback = mongoose.model('Feedback', FeedbackSchema);

//Exporting Users 
module.exports = {
    Feedback
};
