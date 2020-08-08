const express=require('express');
const app=express();
app.use(express.json());

const PORT=process.env.PORT||3000;

app.listen(3000,()=>(
  console.log(`server is running on ${PORT}`)
));
const courses=[
    {
      "id": 1,
      "name": "maths",
      "description":"This is maths course",
      "enrolledStudents":[],
      "availableslots":20
    },
    {
      "id": 2,
      "name": "english",
      "description":"This is english course",
      "enrolledStudents":[],
      "availableslots":20
    },
    {
      "id": 3,
      "name": "spanish",
      "description":"This is spanish course",
      "enrolledStudents":[],
      "availableslots":20
    }

]

const students=[
  {
    "id": 1,
    "name": "Batman"
  },
  {
    "id": 2,
    "name": "Joker"
  },
  {
    "id": 3,
    "name": "Shepherd"
  }

]

//List all courses
app.get('/courses',(req,res)=>{
res.send(courses);
});

//get information about courses
app.get('/courses/:id',(req,res)=>{
  const index=req.params.id;
  for(let i=0;i<courses.length;i++){
    if(index==courses[i].id){
      return res.json(courses[i]);
    }
  }
})

//List of all students
app.get('/students',(req,res)=>{
 res.send(students);
});

//Add a course
app.post('/courses', (req, res) => {
  let name = req.body.name;
  let description = req.body.description;
  let availableslots = req.body.availableslots;
  let id = courses.length + 1;
  if (!name || !description || !availableslots) {
      return res.json({ error: "invalid details!!!" })
  } else {
      
    courses.push({ id, name, description, availableslots });
      res.json({ success: true })
        
  }
});

//Add a student
app.post('/students',(req,res)=>{
    const name=req.body.name;
    const id=students.length+1;
    if(!name){
      return res.json({error:"invald details!!!"})
    }
    else{
      students.push({id,name});
      res.json({success:true})
    }
});
//Enroll a student to a course if slots are available
app.post('/courses/:id/enroll',(req,res)=>{
const id=req.params.id;
let course;
for(let i=0;i<courses.length;i++)
{
  if(id==courses[i].id){
     course=courses[i];
  }
}
if(!course){
  return res.json({error:"invalid!!!"})
}
if(course.availableslots==0)
{
  return res.json({error:"slots are empty!!!"})
}
else{
  let student;
  const id=req.body.studentId;
  for(let j=0;j<students.length;j++)
  {
    if(id==students[j].id){
      student=students[j];
    }
  }
  if(!student){
    return res.json({error:"no student!!!"})
  }
  else{
    course.enrolledstudents.push(student);
    course.availableslots--;
    return res.json({ success: true })
  }
}

});

//Remove a student from course 
app.put('/courses/:id/deregister',(req,res)=>{
 let id=req.params.id;
 let course;
 for(let i=0;i<courses.length;i++){
   if(id==courses[i].id){
      course=courses[i];
   }
 }
 if(!course){
   return res.json({error:"no course with this id found!!!"})
 }
 let stuId=req.body.studentId;
 let student;
 let x=0;
 for(let j=0;j<students.length;j++)
 {
   if(stuId==students[j].id){
     student=students[j];
   }
 }
 if(!student){
   return res.json({error:"no student!!!"});
 }
 for(let i=0;i<course.enrolledStudents.length;i++)
 {
   if(stuId==course.enrolledStudents[i]){
     x=1;
   }
 }
 if(x==1){
    let modifiedList=course.enrolledStudents.filter(student=>student.id!==stuId);
    course.enrolledStudents=modifiedList;
    return res.json({status:"success"})
 }
else{
  return res.json({error:"no match found!!!"})
}

});