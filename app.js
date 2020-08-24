const express=require('express');
const app=express();
app.use(express.json());
var mysql = require('mysql');
var bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const secret='supersecret'



var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "aditi1234",
  database: "users"
});

con.connect(function(err) {
  if (err) throw err;
  console.log(" database is Connected!");
});


const PORT=process.env.PORT||3000;

app.listen(3000,()=>(
  console.log(`server is running on ${PORT}`)
));




let s=0;

app.post('/login',(req,res)=>{
  const user={
    name:req.body.name,
    email:req.body.email,
    password:req.body.password
  }

  if(!user.name || !user.email || !user.password){
    res.send("invalid details");
  }
  con.connect(function(err) {
   // console.log("Connected!");
    var sql = "Select id,name,email,password from students where email='"+user.email+"' and password='"+user.password+"'";
    console.log(sql);
    con.query(sql, function (err, result) {
      if (err) throw err;
          console.log("Student added");
  
       if(result[0]['email']===user.email){
         if(result[0]['password']===user.password)
          {
             s=result[0]['id'];
             console.log(s);
         }
       }
      
     }); 
  }); 
  
  console.log(s);

      jwt.sign({user},'secretkey',(err,token)=>{
      return res.json({token});
      });
});


const courses=[];

const students=[];

app.get('/courses',(req,res)=>{
res.send(courses);
});

//get information about  a  specificcourses
app.get('/courses/:id',(req,res)=>{
  const index=req.params.id;
  for(let i=0;i<courses.length;i++){
    if(index==courses[i].id){
      return res.json(courses[i]);
    }
    else{
      res.json({error:"no course found!!!"})  
    }
  }
})

//List of all students
app.get('/students',(req,res)=>{
 res.send(students);
});

//Add a course
app.post('/courses', (req, res) => {
  // let name = req.body.name;
  // let description = req.body.description;
  // let availableslots = req.body.availableslots;


  if(!s)
  {
   return res.json({error:"first signin"});
  }
  let {name, description, availableslots} = req.body;
  const newCourse = {
  
    name,
    description,
    availableslots,
    "enrolledStudents": [],
} 
  //id = courses.length + 1;
  if (!name || !description || !availableslots) {
      return res.json({ error: "invalid details!!!" })
  } 
  const user=courses.find(user=>user.name===name);
  const slot=courses.find(slot=>slot.availableslots===availableslots);
  //if user exists
  if(user) return res.json({error:"course already exists!!!"});
  if(parseInt(availableslots)<0){
    return res.send({error:"invalid slot!!!"});
  }
  con.connect(function(err) {
    console.log("Connected!");
    var sql = "INSERT into courses(name,description,availableslots) VALUES ('" + name + "', '"+ description+"',"+ availableslots +"  )";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("new course added");
    }); 
  }); 
  
  //||  courses.push(id);
    courses.push(newCourse);
      res.json({ success: true })
        
  
});

//Add a student
app.post('/students',(req,res)=>{
  if(!s){
    return res.json({error:"first signin"});
  }
    const name=req.body.name;
    //const id=students.length+1;
   // const id;
    const email=req.body.email;
    const password=req.body.password;
    if(!name || !email || !password){
      return res.json({error:"invald details!!!"})
    }
 
 const user=students.find(user=>user.name===name);
    //if user exists
    if(user) return res.json({error:"User already exists!!!"});
    else{
     students.push({name,email,password});


     con.connect(function(err) {
      console.log("Connected!");
      var sql = "INSERT into students (name,email,password) VALUES ('" + name + "', '"+ email+"','"+ password +"' )";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Student added");
      });  
    }); 


      return  res.json({success:true});
    }

     

});
let p=0;
//Enroll a student to a course if slots are available
app.post('/courses/:id/enroll',(req,res)=>{
  if(!s)
  {
    return res.json({error:"first signin"});
  }
const course_id=req.params.id;
const student_id=req.body.id;
con.connect(function(err) {
  var sql = "select id from courses where id="+course_id+"";
  con.query(sql, function (err, result) {
    if (err) throw err
   // console.log("course is valid");
   p=result[0]['id'];
   
  });
}); 

  if(!student_id){
    return res.json({error:"no student!!!"})
  }
  if(p<=0){
    return res.json({error:"no course!!!"})
  }



  con.connect(function(err) {
    var sql ="select id from students where id="+student_id+"";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Student is valid");
      }); 
    }); 
  
    let x = 0;
    con.connect(function(err) {
      var sql = "select availableslots from courses where id="+course_id+"";
      console.log(sql);
      
     con.query(sql, function (err, result) {
      if (err) throw err;
     x=result[0]['availableslots'];
     });
    }); 
    


const enrolledStudents=[];

  con.connect(function(err) {
    //console.log("Connected!");
    var sql = "INSERT into enrolledStudents(course_id,stu_id) VALUES (" + course_id + ", "+ student_id+" )";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Student added");
    //enrolledStudents.push(student);
    }); 
  }); 
con.connect(function(err) {
  //  console.log("Connected!");
    var sql = "update courses set availableslots=availableslots - 1 where id="+course_id+" ";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("yes added");
    //enrolledStudents.push(student);
   }); 
  }); 
  if(x<1)
      {
        return res.json({error:"no slots avaialable!!!"})
      }
  
  return res.json({ success: true })
});

//Remove a student from course 
app.put('/courses/:id/deregister',(req,res)=>{
 let id=req.params.id;
 let stuId=req.body.id;
 let student;
 let course;
 let x=0;
 for(let i=0;i<courses.length;i++){
   if(id==courses[i].id){
      course=courses[i];
   }
 }
 console.log(course);

 for(let j=0;j<students.length;j++)
 {
   if(stuId==students[j].id){
     student=students[j];
   }

 }
 console.log(student);
 for(let i=0;i<course.enrolledStudents.length;i++)
 {
   if(stuId==course.enrolledStudents[i]){
     x=1;
   }
 }
 console.log(stuId);
 if(!course){
   return res.json({error:"no course with this id found!!!"})
 }
 if(!student){
   return res.json({error:"no student!!!"});
 }


 if(x==1){
    let modifiedList=course.enrolledStudents.filter(student=>student.id!==stuId);
    course.enrolledStudents=modifiedList;
    return res.json({status:"success"})
 }
else{
  return res.json({success:"student deregistered!!!"})
}

});

