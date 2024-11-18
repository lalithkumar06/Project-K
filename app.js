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
const app = express();
app.use(cors());
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

            if (person[0].pass === passwo) {
                req.session.person = person[0];
                console.log(person[0].login);

                if (person[0].login == 'Student') {
                    let alertss = await client.db('Medi').collection('ale').find({}).toArray();
                    console.log('Alerts:', alertss);
                    
                    if (!alertss) {
                        alertss = []; // Default to an empty array if no data is found
                    }
                    
                    await client.close();  // Close connection after all queries
                    res.render('home1', { person: person[0],alertss });
                } else {
                    // Do not close the client before fetching alerts
                    let alertss = await client.db('Medi').collection('ale').find({}).toArray();
                    console.log('Alerts:', alertss);
                    
                    try {
                        await client.connect();
                        console.log("Connected to the database");
                        
                        const person = req.session.person;
                        let alertss = await findall(client, 'ale');
                        
                        // Log alerts to check what is being fetched
                        console.log('Alerts:', alertss);
                        
                        // Ensure alerts is always an array
                        if (!alertss) {
                            alertss = []; // If `null` or `undefined`, set to an empty array
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

app.get('/getAlerts', async (req, res) => {
    try {
        const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const client = new MongoClient(uri);
        await client.connect();

        const alerts = await client.db('Medi').collection('ale').find({}).toArray();  // Fetch all alerts

        await client.close();

        // Send alerts to the client
        res.status(200).json(alerts);
    } catch (error) {
        console.error("Error fetching alerts:", error);
        res.status(500).send('Error fetching alerts');
    }
});

// Add new alert
app.post('/addAlert', async (req, res) => {
    try {
        const newAlert = req.body.alerti;

        // Check if the alert is not null or empty
        if (!newAlert || newAlert.trim() === "") {
            return res.status(400).send('Alert cannot be empty or null');  // Send an error response if the alert is invalid
        }

        const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const client = new MongoClient(uri);
        await client.connect();

        const newAlertDoc = { alerti: newAlert };
        await client.db('Medi').collection('ale').insertOne(newAlertDoc);  // Insert new alert

        await client.close();
        res.status(200).send('Alert added successfully');
    } catch (error) {
        console.error("Error adding alert:", error);
        res.status(500).send('Error adding alert');
    }
});



// Delete an alert
app.delete('/deleteAlert/:id', async (req, res) => {
    try {
        const alertId = req.params.id;  // ID of the alert to delete
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
            meds = [];  // Ensure meds is not null
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
            ppl = []; // Default to an empty array if no data is found
        }
        res.render('Admin_bloodDonors', { person: req.session.person, ppl });
    } catch (error) {
        console.error("Error fetching donors:", error);
        res.status(500).send("An error occurred while fetching donors");
    } finally {
        await client.close();
    }
});

// Route to handle updating a donor
app.post('/updatedonor', async (req, res) => {
    if (!req.session.person || req.session.person.login !== 'Admin') {
        return res.status(403).send("Access denied");
    }

    const { email, last_don } = req.body;

    if (!email || !last_don) { // Ensure both fields are present
        return res.status(400).send("All fields are required");
    }

    const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const existingDonor = await client.db('Medi').collection('user').findOne({ email });

        if (existingDonor) {
            // Calculate the difference between the new date and the last_don
            const newDonDate = new Date(last_don);
            const previousDonDate = existingDonor.last_don ? new Date(existingDonor.last_don) : null;

            if (previousDonDate) {
                const diffTime = Math.abs(newDonDate - previousDonDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 90) {
                    // If the difference is less than 90 days, send an error response
                    return res.status(400).send("The last donated date must be at least 90 days apart.");
                }
            }

            // Update existing donor
            await client.db('Medi').collection('user').updateOne(
                { email },
                { $set: { last_don } }
            );

            console.log(`Donor with email ${email} updated.`);
        } else {
            return res.status(404).send("Donor not found.");
        }

        // Redirect back to Admin_bloodDonors to see the updated list
        res.redirect('/Admin_bloodDonors');

    } catch (error) {
        console.error("Error updating donor:", error);
        res.status(500).send("An error occurred while updating the donor");
    } finally {
        await client.close();
    }
});
app.post("/api/getMeetingLink", (req, res) => {
  const { userId } = req.body;
  const slot = slots.find((slot) => slot.userId === userId);

  if (slot) {
    res.json({ success: true, meetLink: slot.meetLink });
  } else {
    res
      .status(404)
      .json({ success: false, message: "No slot found for the user." });
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
            medicines = []; // Default to an empty array if no data is found
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
            // Update existing medicine
            await client.db('Medi').collection('meds').updateOne(
                { slno },
                { $set: { name, type, use: useArray, stock } }
            );
            console.log('Medicine with S.NO ${slno} updated.');
        } else {
            // Add new medicine
            const newMedicine = { slno, name, type, use: useArray, stock };
            await inserting(client, newMedicine, 'meds');
            console.log('New medicine with S.NO ${slno} added.');
        }

        // Redirect back to homeadmin to see the updated list
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

// Function to generate OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();  // 4-digit OTP
}

app.post('/forgotpass', async (req, res) => {
    const { username } = req.body;

    const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('Medi');  // Use your database name
        const user = await db.collection('user').findOne({ username });

        if (!user) {
            return res.status(404).send('User Not Found');
        }

        // Generate and store OTP in session or database
        const otp = generateOTP();
        req.session.otp = otp;  // Alternatively, store in the database

        // Send email with OTP
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'iit2023026@iiita.ac.in', // Replace with your Gmail
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

    // Check if the OTP matches
    if (otp !== req.session.otp) {
        return res.status(400).send("Invalid OTP");
    }

    // Check if passwords match
    if (new_password !== confirm_password) {
        return res.status(400).send("Passwords do not match");
    }

    // Update the password in the database
    const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('Medi');

        // Update the user's password in the database
        await db.collection('users').updateOne(
            { username: req.session.person.username },
            { $set: { pass: confirm_password } }
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
        const { username, email, password, confirm_password ,first_name,last_name} = req.body;

        if (password !== confirm_password) {
            return res.render('signup', { error: 'Passwords do not match' });
        }

        const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const client = new MongoClient(uri);
        await client.connect();
        login="Student"
        await inserting(client, { username, email, pass: password,first_name,last_name,login}, 'user');

        req.session.person = { username, email, pass: password };

        await client.close();
        res.render('home1', { person: req.session.person });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred");
    }
});

app.get('/home', (req, res) => {
    const person = req.session.person;
    if(person.login == "Student")
    res.render('home1', { person });
    else
    res.render('homeadmin', { person });
});

// app.get('/homeadmin', async (req, res) => {
    
//     try {
//         const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
//         const client = new MongoClient(uri);
//         try {
//             await client.connect();
//             console.log("Connected to the database");
//         } catch (error) {
//             console.error("Failed to connect to the database:", error);
//         }
//         const person = req.session.person;
//         let alerts = await findall(client, 'alerts');
        
//         console.log('Alerts:', alerts);
//         if (!alerts) {
//             alerts = []; // Ensure alerts is always an array
//         }
        
//         res.render('homeadmin', { person, alerts });
//     } catch (error) {
//         console.error("Error fetching alerts:", error);
//         res.status(500).send("An error occurred while fetching alerts");
//     } finally {
//         await client.close();
//     }
// });

app.get('/homeadmin', async (req, res) => {
    const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log("Connected to the database");
        
        const person = req.session.person;
        let al = await findall(client, 'ale');
        
        // Log alerts to check what is being fetched
        console.log('Alerts:', al);
        
        // Ensure alerts is always an array
        if (!al) {
            al = []; // If `null` or `undefined`, set to an empty array
        }
        
        res.render('homeadmin', { person, a:al });
    } catch (error) {
        console.error("Error fetching alerts:", error);
        res.status(500).send("An error occurred while fetching alerts");
    } finally {
        await client.close();
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});
