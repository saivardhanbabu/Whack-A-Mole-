const exp=require('express')
const userApp=exp.Router()
const bcryptjs=require('bcryptjs')
const jwt=require('jsonwebtoken')
const expressAsynHandler=require('express-async-handler')
userApp.use(exp.json());
let usersCollection;
let usersBalance;
let usersTransfer
userApp.use((req,res,next)=>{
    usersCollection=req.app.get('usersCollection')
    next()
})

userApp.post('/user',expressAsynHandler(async(req,res)=>{
    const usersCollectionObj = req.app.get("usersCollection");

  const user = req.body;


    let dbuser = await usersCollectionObj.findOne({ username: user.username});
    if (dbuser !== null) {
     return res.send({ message: "User already existed" });
    }

    const hashedPassword=await bcryptjs.hash(user.password,7)
    user.password=hashedPassword;

        await usersCollectionObj.insertOne(user)
        res.send({message:"User created"})
}))
userApp.post('/verify',expressAsynHandler(async(req,res)=>{
    const usersBalanceObj = req.app.get("usersBalance");
  let userCred=req.body
    let dbuser=await usersBalanceObj.findOne({username:userCred.usernameTo,accountNo:userCred.accountNo})
    console.log(dbuser)
    if(dbuser===null){
        return res.send({message:"Amount Not Added"})
    }
    else{
        return res.send({message:"Verified"})
    }
}))
userApp.post('/login',expressAsynHandler(async(req,res)=>{
    const usersCollectionObj = req.app.get("usersCollection");
  const userCred = req.body;
    let dbuser=await usersCollectionObj.findOne({username:userCred.username,accountNo:userCred.accountNo})
    if(dbuser===null ){
        return res.send({message:"Invalid username/account no"})
    }else{
        let status=await bcryptjs.compare(userCred.password,dbuser.password)
        console.log(status)
        if(status===false){
            return res.send({message:"Invalid password"})
        }
        else{
            //create token
           const signedToken= jwt.sign({username:dbuser.username},`${process.env.SECRET_KEY}`,{expiresIn:"1h"})
           delete dbuser.password;
           res.send({message:"login success",token:signedToken,user:dbuser})
        }
    }
}))
userApp.post('/update-score',expressAsynHandler(async(req,res)=>{
    const usersCollectionObj=req.app.get('usersCollection');
    const userCred=req.body;
    await usersCollectionObj.updateOne({username:userCred.user.username},{$inc:{score:userCred.score}})
    console.log(userCred.user.username)
}))
userApp.get('/get-leaderboard',expressAsynHandler(async(req,res)=>{
    const usersCollectionObj=req.app.get("usersCollection")
    let list=await usersCollectionObj.find({score:{$gte:0}}).sort({score:-1}).toArray()
    console.log(list)
    res.send({message:"Hi",payload:list})
}))


module.exports=userApp;