const nodemailer = require('nodemailer')
const mg = require('nodemailer-mailgun-transport')
const dotenv = require('dotenv').config();


var auth = {
    auth : {
        api_key: `${process.env.API_KEY}`,
        domain: `${process.env.domain}`
    }
}

var nodemailerMailgun = nodemailer.createTransport(mg(auth))

// nodemailerMailgun.sendMail({
//     from: 'StudentFeedbackSystem@sgsits.com',
//     to: 'prajalbadjatya@gmail.com',
//     subject: 'Student Feedback System',
//     text: 'This is an auto generated email.. Please message on whatsapp if you receive this mail!Or bhai kya maje'
// }, function(err,info){
//     if(err){
//         console.log(err);
//     }else{
//         console.log('Response '+ info)
//     }
// });

module.exports = {
    sendEmail(from,to,subject,html){
        return new Promise( (resolve , reject)=> {
            nodemailerMailgun.sendMail( {from,subject,to,html}, (err,info)=> {
                if(err){
                    reject(err);
                }
                resolve(info);
            });
        });
    }
}