const express=require("express")
const mongodb=require("mongodb")
const cors=require("cors")

require("dotenv").config()

//MongoPass-->OdaSAgchQFKkTu8O
const mongoClient=mongodb.MongoClient
const objectId=mongodb.ObjectID

const app=express()

const dbURL=process.env.DB_URL
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

app.post("/createStudent",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("StudentMentor")

        let result1 = await db.collection('StudentDetails').findOne({studentName:req.body.studentName})
        let result2 = await db.collection('StudentDetails').findOne({studentMobile:req.body.studentMobile})

        if(result1 && result2){
            res.status(400).json({message : "Sorry, the Student is already registered"});
            clientInfo.close()
        }
        else{
            let data = await db.collection('StudentDetails').insertOne(req.body)
            res.status(200).json({message : "Student added"})
            clientInfo.close()
        }
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.post("/createMentor",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("StudentMentor")

        let result1 = await db.collection('MentorDetails').findOne({mentorName:req.body.mentorName})
        let result2 = await db.collection('MentorDetails').findOne({mentorMobile:req.body.mentorMobile})

        if(result1 && result2){
            res.status(400).json({message : "Sorry, the Mentor is already registered"});
            clientInfo.close()
        }
        else{
            let data = await db.collection('MentorDetails').insertOne(req.body)
            res.status(200).json({message : "Mentor added"})
            clientInfo.close()
        }
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.get("/getStudents",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("StudentMentor")
        let data = await db.collection("StudentDetails").find().toArray();
        res.status(200).json({data})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.get("/getMentors",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("StudentMentor")
        let data = await db.collection("MentorDetails").find().toArray();
        res.status(200).json({data})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.get("/getNonAssignedStudents",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("StudentMentor")
        let data = await db.collection("StudentDetails").find({mentorAssigned : { $eq : "Not Assigned Yet" }}).toArray();
        res.status(200).json({data})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.put("/updateDB/:name",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("StudentMentor")
        let data = await db.collection('MentorDetails').updateOne( { mentorName : req.params.name } , { $push : req.body });
        let studentsArray=req.body.studentsAssigned
        console.log(studentsArray)
        studentsArray.forEach(element => {
            let updation = db.collection("StudentDetails").updateOne( { studentName : element }, { $set : { mentorAssigned : req.params.name } })
        });
        res.status(200).json({message : "Assigned Students Successfully"})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.put("/changeMentor/:sName",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("StudentMentor")
        
        let studentData = await db.collection("StudentDetails").find({studentName : { $eq : req.params.sName} }).toArray();
        let mentor=studentData[0].mentorAssigned 

        await db.collection("StudentDetails").updateOne( { studentName : req.params.sName }, { $set : { mentorAssigned : req.body.mentorAssigned } })
        

        if(mentor==="Not Assigned Yet"){
            await db.collection('MentorDetails').updateOne( { mentorName : req.body.mentorAssigned } , { $push : { studentsAssigned : [req.params.sName] } });
            res.status(200).json({message : "Assigned Students Successfully"})
            clientInfo.close()
        }
        else{
            let mentorData = await db.collection("MentorDetails").find({ mentorName : { $eq : mentor } }).toArray();
            let assigned=mentorData[0].studentsAssigned

                var val=req.params.sName
                var myArr=[]
                assigned.forEach(ele=>{
                    if(ele.length==1 || typeof ele === "string")
                    myArr.push(ele.toString())
                    else{
                        ele.forEach(again=>{
                            myArr.push(again.toString())
                        })
                    }
                })
    
                const index = myArr.indexOf(val);
                console.log(index)
                if (index > -1) {
                    myArr.splice(index, 1);
                }
    

                await db.collection('MentorDetails').updateOne( { mentorName : mentor } , { $set : { studentsAssigned : myArr } });
                await db.collection('MentorDetails').updateOne( { mentorName : req.body.mentorAssigned } , { $push : { studentsAssigned : [req.params.sName] } });

            res.status(200).json({message : "Assigned Students Successfully"})
            clientInfo.close()
        }

    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.get("/getByMentorName/:name",async (req,res)=>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("StudentMentor")
        let data = await db.collection("MentorDetails").find({mentorName : { $eq : req.params.name }}).toArray();
        res.status(200).json({data})
        clientInfo.close()
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})



app.listen(port,()=>{
    console.log("App started at port :",port)
})