module.exports = (req,res,next)=>{
    if(req.isAuthenticated()){
        if(req.user.category == 'admin'){
            return next();
        }
        req.flash('error_msg', 'Access Denied')
        res.redirect('/login1');
    }else{
        req.flash('error_msg', 'You are not logged in');
        res.redirect('/login1');
    }
}