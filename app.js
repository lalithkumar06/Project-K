const express = require('express');
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const cors = require("cors");
const bodyParser = require('body-parser');
const { inserting, finding,findall } = require('./demo');
const session = require('express-session');
require('dotenv').config();
const mongoose = require("mongoose");
const cron = require("node-cron");
const moment = require("moment-timezone");
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.json());


app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cartItems: [],
    isTotalHidden: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.listen(3000, () => {
    console.log('local host on port 3000');
});

app.get('/', (req, res) => {
    res.render('dashboard');
});
app.get('/loginpage', (req, res) => {
    res.render('loginpage');
});
app.post('/loginpage', async (req, res) => {
    try {
        const username = req.body.username;
        const passwo = req.body.password;
        const data = { "username": username };

        const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const client = new MongoClient(uri);
        await client.connect();

        const person = await finding(client, data, 'user');

        console.log("Data:", data);
        console.log("Person found:", person);

        if (person == null) {
            await client.close();
            res.render('signup');
        } else {
            console.log("Stored password:", person[0].pass);
            console.log("Entered password:", passwo);

            if (await bcrypt.compare(passwo, person[0].pass)) {
                req.session.person = person[0];
                console.log(person[0].login);

                if (person[0].login == 'Student') {
                    let alertss = await client.db('Medi').collection('ale').find({}).toArray();
                    console.log('Alerts:', alertss);
                    
                    if (!alertss) {
                        alertss = [];
                    }
                    
                    await client.close();  
                    res.render('home1', { person: person[0],alertss });
                } 
                else if(person[0].login == 'Doctor') {
                    res.render('homedoc', { person:person[0] });
                }
                else {
                    let alertss = await client.db('Medi').collection('ale').find({}).toArray();
                    console.log('Alerts:', alertss);
                    
                    try {
                        await client.connect();
                        console.log("Connected to the database");
                        
                        const person = req.session.person;
                        let alertss = await findall(client, 'ale');
                        console.log('Alerts:', alertss);
                        if (!alertss) {
                            alertss = []; 
                        }
                        
                        res.render('homeadmin', { person: req.session.person ,alertss});
                    } catch (error) {
                        console.error("Error fetching alerts:", error);
                        res.status(500).send("An error occurred while fetching alerts");
                    } finally {
                        await client.close();
                    }
                }
            } else {
                console.log("Password incorrect.");
                await client.close();
                res.status(401).send("Password incorrect.");
            }
        }
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
});
























//---------------------------------------------------------------------------------------------------



app.post("/bookVirtualSlot", async (req, res) => {
    const uri =
      "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);
    await client.connect();

  const { doctorName, slotTime, userName, userPassword } = req.body;
  const doctor = await finding(client,{ first_name: doctorName },'user');
    const slot= {username : userName,doctor : doctorName, slottime : slotTime,userpassword : userPassword}
  if (doctor) {
    doctor.appointments[slotTime] = {
      user: userName,
      type: "virtual",
      password: userPassword,
      time: slotTime,
    };
    
    inserting(client,slot , 'slots');
    res.redirect("/slots");
  } else {
    res.status(404).send("Doctor not found");
  }
});
app.post("/bookDirectSlot", async (req, res) => {
  const { doctorName, slotTime, userName } = req.body;
  const doctor = await Doctor.finding({ first_name: doctorName });

  if (doctor) {
    doctor.appointments[slotTime] = userName;
    await doctor.save();
    res.redirect("/slots");
  } else {
    res.status(404).send("Doctor not found");
  }
});
app.post("/api/getMeetingLink", async(req, res) => {
    const uri =
      "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);
     await client.connect();
    const { passwo } = req.session.person;
    if (await bcrypt.compare(passwo, req.session.person.password)) {
        const slot = await finding(client,{username : req.session.person.username},'slots')//find the user with userid as given userid
        //links for doctors
        //meet.google.com/hwx-fmjp-iou - subash    
        // meet.google.com/nkn-bznq-zqk-shalini
        // meet.google.com/mke-vwwk-ivp - amit
        if (slot) {
            //update the meetlink in the below line according to the doctor name from the input
            if (slot.doctor=="Subash"){
                res.json({ success: true, meetLink: meet.google.com/hwx-fmjp-iou });
            }else if(slot.doctor=="Shalini"){
                res.json({ success: true, meetLink: meet.google.com/nkn-bznq-zqk });
            }else if(slot.doctor=="Amit"){
                res.json({ success: true, meetLink: meet.google.com/mke-vwwk-ivp });
            }
        } else {
            res
            .status(404)
            .json({ success: false, message: "No slot found for the user." });
        }
    }else {
        console.log("Password incorrect.");
        await client.close();
        res.status(401).send("Password incorrect.");
    }
});

//----------------------------------------------------------------------------------------------------------------














app.get('/getAlerts', async (req, res) => {
    try {
        const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const client = new MongoClient(uri);
        await client.connect();

        const alerts = await client.db('Medi').collection('ale').find({}).toArray();  // Fetch all alerts

        await client.close();
        res.status(200).json(alerts);
    } catch (error) {
        console.error("Error fetching alerts:", error);
        res.status(500).send('Error fetching alerts');
    }
});
app.get('/conference',(req,res)=>{
    res.render('conference')
})
app.post('/addAlert', async (req, res) => {
    try {
        const newAlert = req.body.alerti;

        if (!newAlert || newAlert.trim() === "") {
            return res.status(400).send('Alert cannot be empty or null');  
        }

        const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const client = new MongoClient(uri);
        await client.connect();

        const newAlertDoc = { alerti: newAlert };
        await client.db('Medi').collection('ale').insertOne(newAlertDoc);  

        await client.close();
        res.status(200).send('Alert added successfully');
    } catch (error) {
        console.error("Error adding alert:", error);
        res.status(500).send('Error adding alert');
    }
});


app.delete('/deleteAlert/:id', async (req, res) => {
    try {
        const alertId = req.params.id; 
        const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const client = new MongoClient(uri);
        await client.connect();

        const ObjectId = require('mongodb').ObjectId;
        await client.db('Medi').collection('ale').deleteOne({ _id: new ObjectId(alertId) });  // Delete alert by ID

        await client.close();
        res.status(200).send('Alert deleted successfully');
    } catch (error) {
        console.error("Error deleting alert:", error);
        res.status(500).send('Error deleting alert');
    }
});


app.get('/availableMedi', async (req, res) => {
    try {
        const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const client = new MongoClient(uri);
        await client.connect();
        const person = req.session.person;
        let meds = await findall(client, 'meds');
        await client.close();
        console.log("Meds fetched:", meds);
        if (!meds) {
            meds = [];  
        }

        res.render('availableMedi', { person, meds });
    } catch (err) {
        console.error("An error occurred in finding:", err);
        res.status(500).send('An error occurred while fetching data');
    }
    
});
app.get('/bloodDonors', async (req, res) => {
    try {
        const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const client = new MongoClient(uri);
        await client.connect();
        const person = req.session.person;
        let ppl = await findall(client, 'user');
        await client.close();
        console.log("People fetched:", ppl);
        if (!ppl) {
            ppl = [];
        }

        res.render('bloodDonors', { person, ppl });
    } catch (err) {
        console.error("An error occurred in finding:", err);
        res.status(500).send('An error occurred while fetching data');
    }
    
});

app.get('/Admin_bloodDonors', async (req, res) => {
    const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        if (!req.session.person || req.session.person.login !== 'Admin') {
            return res.status(403).send("Access denied");
        }

        let ppl = await client.db('Medi').collection('user').find({}).toArray();
        console.log('donors:', ppl);
        if (!ppl) {
            ppl = []; 
        }
        res.render('Admin_bloodDonors', { person: req.session.person, ppl });
    } catch (error) {
        console.error("Error fetching donors:", error);
        res.status(500).send("An error occurred while fetching donors");
    } finally {
        await client.close();
    }
});
app.post('/updatedonor', async (req, res) => {
    if (!req.session.person || req.session.person.login !== 'Admin') {
        return res.status(403).send("Access denied");
    }

    const { email, last_don } = req.body;

    if (!email || !last_don) {
        return res.status(400).send("All fields are required");
    }

    const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const existingDonor = await client.db('Medi').collection('user').findOne({ email });

        if (existingDonor) {
            const newDonDate = new Date(last_don);
            const previousDonDate = existingDonor.last_don ? new Date(existingDonor.last_don) : null;

            if (previousDonDate) {
                const diffTime = Math.abs(newDonDate - previousDonDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 90) {
                    return res.status(400).send("The last donated date must be at least 90 days apart.");
                }
            }

            await client.db('Medi').collection('user').updateOne(
                { email },
                { $set: { last_don } }
            );

            console.log(`Donor with email ${email} updated.`);
        } else {
            return res.status(404).send("Donor not found.");
        }

        res.redirect('/Admin_bloodDonors');

    } catch (error) {
        console.error("Error updating donor:", error);
        res.status(500).send("An error occurred while updating the donor");
    } finally {
        await client.close();
    }
});

app.get('/Admin_avamedi', async (req, res) => {
    const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        if (!req.session.person || req.session.person.login !== 'Admin') {
            return res.status(403).send("Access denied");
        }

        let medicines = await client.db('Medi').collection('meds').find({}).toArray();
        console.log('meds:',medicines);
        if (!medicines) {
            medicines = []; 
        }
        res.render('Admin_avamedi', { person: req.session.person, medicines });
    } catch (error) {
        console.error("Error fetching medicines:", error);
        res.status(500).send("An error occurred while fetching medicines");
    } finally {
        await client.close();
    }
});

app.post('/updatemedicine', async(req,res)=>{
    if (!req.session.person || req.session.person.login !== 'Admin') {
        return res.status(403).send("Access denied");
    }
    const { slno, name, type, use, stock } = req.body;

    if (!slno || !name || !type || !use || !stock) {
        return res.status(400).send("All fields are required");
    }
    const useArray = use.split(',').map(item => item.trim());
    const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);
    try {
        const existingMedicine = await client.db('Medi').collection('meds').findOne({ slno });

        if (existingMedicine) {
            await client.db('Medi').collection('meds').updateOne(
                { slno },
                { $set: { name, type, use: useArray, stock } }
            );
            console.log('Medicine with S.NO ${slno} updated.');
        } else {
            const newMedicine = { slno, name, type, use: useArray, stock };
            await inserting(client, newMedicine, 'meds');
            console.log('New medicine with S.NO ${slno} added.');
        }
        res.redirect('/Admin_avamedi');

    } catch (error) {
        console.error("Error updating medicine:", error);
        res.status(500).send("An error occurred while updating medicine");
    }
});
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.get('/forgotpass', (req, res) => {
    res.render('forgotpass');
});

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();  // 4-digit OTP
}

app.post('/forgotpass', async (req, res) => {
    const { username } = req.body;

    const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('Medi');  
        const user = await db.collection('user').findOne({ username });

        if (!user) {
            return res.status(404).send('User Not Found');
        }

        const otp = generateOTP();
        req.session.otp = otp; 

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'iit2023026@iiita.ac.in', 
                pass: 'wugl cnbw ggqf puzc'
            },
        });

        let mailOptions = {
            from: 'iit2023026@iiita.ac.in',
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        req.session.person = user;
        res.render('resetpass', { person: req.session.person });

    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    } finally {
        await client.close();
    }
});
app.get('/resetpass', (req, res) => {
    res.render('resetpass');
});
app.post('/resetpass', async (req, res) => {
    const { otp, new_password, confirm_password } = req.body;

    if (otp !== req.session.otp) {
        return res.status(400).send("Invalid OTP");
    }

    if (new_password.length < 6 || !/[!@#$%^&*(),.?":{}|<>]/.test(new_password)) {
        return res.status(400).send("Password must be at least 6 characters long and include at least one special character.");
    }

    if (new_password !== confirm_password) {
        return res.status(400).send("Passwords do not match");
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('Medi');

        await db.collection('users').updateOne(
            { username: req.session.person.username },
            { $set: { pass: hashedPassword } }
        );

        res.send('Password successfully updated');
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    } finally {
        await client.close();
    }
});

app.post('/signup', async (req, res) => {
    try {
        const { username, email, password, confirm_password, first_name, last_name } = req.body;

        // Password Strength Validation
        if (password.length < 6 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return res.render('signup', {
                error: 'Password must be at least 6 characters long and include at least one special character.',
                first_name,
                last_name,
                email,
                username,
            });
        }

        if (password !== confirm_password) {
            return res.render('signup', {
                error: 'Passwords do not match.',
                first_name,
                last_name,
                email,
                username,
            });
        }

        const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const client = new MongoClient(uri);
        await client.connect();

        const db = client.db('Medi');
        const usersCollection = db.collection('user');

        // Check if username exists
        const person = await usersCollection.findOne({ username });
        if (person) {
            await client.close();
            return res.render('signup', {
                error: 'Username already exists. Please choose a different username.',
                first_name,
                last_name,
                email,
                username,
            });
        }

        // Hash the Password
        const hashedPassword = await bcrypt.hash(password, 10);

        const login = "Student";
        await inserting(client, { username, email, pass: hashedPassword, first_name, last_name, login }, 'user');

        req.session.person = { username, email, pass: hashedPassword, first_name, last_name, login };

        alertss = await db.collection('ale').find({}).toArray();
        if (!alertss) {
            alertss = [];
        }

        await client.close();
        res.render('home1', { person: req.session.person });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
});



app.get('/home', async (req, res) => {
    const person = req.session.person;
    const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);
    
    let alertss;

    try {
        await client.connect();
        if(person.login == "Student" || person.login == "Admin") {
            alertss = await client.db('Medi').collection('ale').find({}).toArray();
            if (!alertss) {
                alertss = []; 
            }
        }

        if(person.login == "Student") {
            res.render('home1', { person, alertss });
        }
        else if(person.login == "Doctor") {
            res.render('homedoc', { person, alertss });
        } else {
            res.render('homeadmin', { person, alertss });
        }
    } catch (error) {
        console.error("Error fetching alerts:", error);
        res.status(500).send("An error occurred while fetching alerts");
    } finally {
        await client.close();
    }
});

app.get('/homeadmin', async (req, res) => {
    const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log("Connected to the database");
        
        const person = req.session.person;
        let alertss = await findall(client, 'ale');
        console.log('Alerts:', alertss);
        if (!alertss) {
            alertss = []; 
        }
        
        res.render('homeadmin', { person, alertss });
    } catch (error) {
        console.error("Error fetching alerts:", error);
        res.status(500).send("An error occurred while fetching alerts");
    } finally {
        await client.close();
    }
});
const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
app.get('/slotbooking', async (req, res) => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('Medi');
        const doctors = await db.collection('user').find({login: "Doctor"}).toArray();
        console.log("Doctors fetched:", doctors); // Add this line
        const loggedInUser = req.session.person;
        res.render('slotbooking', { doctors, loggedInUser });
    } finally {
        await client.close();
    }
});

app.post('/bookslot', async (req, res) => {
    const { doctorName, slotTime, userName } = req.body;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('Medi');
        const doctorUpdate = await db.collection('doctors').updateOne(
            { "first_name": doctorName, [`appointments.${slotTime}`]: "" },
            { $set: { [`appointments.${slotTime}`]: userName } }
        );
        const userUpdate = await db.collection('users').updateOne(
            { "username": userName },
            { $set: { [`appointments.${slotTime}`]: doctorName } }
        );

        res.redirect('/slotbooking');
    } finally {
        await client.close();
    }
});
app.post('/cancelSlot', async (req, res) => {
    const { doctorName, slotTime } = req.body;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('Medi');
        await db.collection('doctors').updateOne(
            { "first_name": doctorName, [`appointments.${slotTime}`]: req.session.person.username },
            { $set: { [`appointments.${slotTime}`]: "" } }
        );
        await db.collection('users').updateOne(
            { "username": req.session.person.username },
            { $unset: { [`appointments.${slotTime}`]: "" } }
        );

        res.redirect('/slotbooking');
    } finally {
        await client.close();
    }
});

// // Connect to MongoDB
// mongoose.connect(
//     "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     }
//   );
  
//   // Define Medication schema and model
//   const MedicationSchema = new mongoose.Schema({
//     medName: String,
//     medTime: String, // Stored in "HH:mm" format
//     frequency: Number,
//     email: String,
//   });
  
//   const Medication = mongoose.model("Medication", MedicationSchema);
// const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: "iit2023026@iiita.ac.in", // Replace with your email
//       pass: "wugl cnbw ggqf puzc", // Replace with your app password
//     },
//   });
  
//   // Route to set a reminder
//   app.post("/set-reminder", async (req, res) => {
//     try {
//       const { medName, medTime, frequency } = req.body;
//       const email = req.session.person.email; // Assumes a session system is in place
  
//       const medication = new Medication({ medName, medTime, frequency, email });
//       await medication.save();
  
//       res.status(200).send("Reminder set successfully!");
//     } catch (error) {
//       console.error("Error setting reminder:", error);
//       res.status(500).send("An error occurred while setting the reminder.");
//     }
//   });
// cron.schedule("*/1 * * * *", async () => {
//     try {
//       const now = moment().tz("Asia/Kolkata").format("HH:mm"); // Adjust time zone as needed
//       console.log("Current Time:", now);
  
//       // Fetch medications due at the current time
//       const medications = await Medication.find({ medTime: now });
//       console.log("Medications to notify:", medications);
  
//       // Send email reminders
//       medications.forEach((med) => {
//         const mailOptions = {
//           from: "iit2023026@iiita.ac.in",
//           to: med.email,
//           subject: "Medication Reminder",
//           text: `It's time to take your medication: ${med.medName}`,
//         };
  
//         transporter.sendMail(mailOptions, (error, info) => {
//           if (error) {
//             console.error(`Error sending email to ${med.email}:`, error);
//           } else {
//             console.log(`Email sent to ${med.email}: ${info.response}`);
//           }
//         });
//       });
//     } catch (error) {
//       console.error("Error in cron job:", error);
//     }
//   });


// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "iit2023026@iiita.ac.in", // Replace with your email
    pass: "wugl cnbw ggqf puzc", // Replace with your app password
  },
});

// Route to set a reminder
app.post("/set-reminder", async (req, res) => {
    const client = new MongoClient(uri);
  
    try {
      const { medName, frequency, medTimes } = req.body; // Ensure these match the frontend structure
      const email = req.session.person.email;
  
      console.log("Received:", { medName, frequency, medTimes }); // Debugging
  
      await client.connect();
  
      await inserting(client, { medName, medTimes, frequency, email }, "medications");
  
      res.status(200).send("Reminder set successfully!");
    } catch (error) {
      console.error("Error setting reminder:", error);
      res.status(500).send("An error occurred while setting the reminder.");
    } finally {
      await client.close();
    }
  });

cron.schedule("*/1 * * * *", async () => {
    const client = new MongoClient(uri);
  
    try {
      await client.connect();
      console.log("Connected to the database.");
  
      const now = moment().tz("Asia/Kolkata").format("HH:mm"); // Adjust time zone as needed
      console.log("Current Time:", now);
  
      // Fetch medications due at the current time
      const medications = await finding(client, { medTimes: { $in: [now] } }, "medications");
      if (!medications || medications.length === 0) {
        console.log("No medications to notify at this time.");
        return; // Exit early if no medications to process
      }
  
      console.log("Medications to notify:", medications);
  
      for (const med of medications) {
        try {
          const mailOptions = {
            from: "iit2023026@iiita.ac.in",
            to: med.email,
            subject: "Medication Reminder",
            text: `It's time to take your medication: ${med.medName}`,
          };
  
          const info = await transporter.sendMail(mailOptions);
          console.log(`Email sent to ${med.email}: ${info.response}`);
        } catch (error) {
          console.error(`Error sending email to ${med.email}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in cron job:", error);
    } finally {
      // Ensure the database connection is closed
      await client.close();
      console.log("Database connection closed.");
    }
  });

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});