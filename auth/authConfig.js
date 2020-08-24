var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const myKey='secretkey'

const mysql = require('mysql')

router.post('/signup', async (req, res)=>{
    try {
        
      
        let name = req.body.name
        let email=req.body.email
        let password = req.body.password
        
        if (!name) {
            res.json({ "Error": ' "name" is a required attribute'})
            return
        }
        if (!email) {
            res.json({"Error": ' "email" is a required attribute'})
            return
        }
        if (!password) {
            res.json({"Error": ' "password" is a required attribute'})
            return
        }
       
    
       
        

        try{
            let promise = mysql.executeQuery(`select  * from students where username = "${username}"`)
            await promise.then( function (result){
                if (result[0]) {
                    throw "A student  with this username already exists !"
                }
            })
        } catch (err) {
            return res.json({"Data":null, "Error": err})
        }
        const encryptedPassword = await bcrypt.hash(password.toString(), 10)

        try{
            mysql.executeQuery(`insert into students values( "${name}", "${username}", ${age}, "${sex}", "${stream}", "${encryptedPassword}" )`)
        } catch (err) {
            return res.json({"Data":null, "Error": err})
        }
        let user = {username: username, encryptedPassword: encryptedPassword}
        const token = jwt.sign(user, myKey, {expiresIn: '50m'})
        return res.json({ "Message": ` SignUp Successful!`,
            "yourAccesToken": `${token} `
        })

    } catch (err) {
        res.json({
            'Data':null,
            'Error': err
        })
    }
})


router.post('/login', async (req, res)=>{
    try {
        let username = req.body.username
        let password = req.body.password
        if (!username) {
            res.json({ "Error": ' "username" is a required attribute'})
            return
        }
        if (!password) {
            res.json({ "Error": ' "password" is a required attribute'})
            return
        }

        let student
        try{
            let promise = mysql.executeQuery(`select  * from students where username = "${username}"`)
            await promise.then( function (result){
                student = result[0]
            })
        } catch (err) {
            return res.json({"Data":null, "Error": err})
        }

        if (!student) {
            res.json({ "Error": 'No student with this username exists!'})
            return
        }

        if ( await bcrypt.compare(password.toString(), student.encryptedPassword)){
            let user = {username: username, encryptedPassword: student.encryptedPassword}
            const token = jwt.sign(user, myKey, {expiresIn: '50m'})
            return res.json({ "Message": ` Login Successful!`,
                "yourAccesToken" : `${token} `
            })
        }else{
            return res.json({ "Error": `Incorrect password!`})
        }

    } catch (err) {
        res.json({
            'Data':null,
            'Error': err
        })
    }
})
module.exports = router;