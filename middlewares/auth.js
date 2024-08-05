const{getUser} = require("../service/auth")
async function restrictToLoggedinUserOnly(res,req,next){
    console.log(req);
    const userUid = req.cookie?.uid;

    if(!userUid) 
        return res.redirect('/login');
    const user = getUser(userUid);

    if (!user) return res.redirect('/login');

    req.user = user;
    next();
}

module.exports ={
    restrictToLoggedinUserOnly,
}