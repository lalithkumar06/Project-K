HealthConnect
HealthConnect is an innovative web platform that bridges the gap between college students and health center services. Designed to streamline health-related interactions, it offers features like virtual consultations, appointment booking, and medication reminders. The application is built with a modern tech stack to ensure performance, scalability, and user satisfaction.

login details 

For student:
manasvi
Abcd#1234
For doctors:
amitdoc
Abcd#1234
For admin:
adminuser
admin@123


Table of Contents
Features
Prerequisites
Installation
Project Structure
Tech Stack
Dependencies
Usage
Contributing
License
Contact

Features
Medication Reminders: Get timely alerts for your prescribed medications.
User Authentication: Secure login and session management.
Mobile-Friendly Design: Fully responsive for access on any device.
Dynamic Content: Rendered with EJS templates for interactive interfaces.
Task Automation: Periodic tasks handled by Node-Cron.
Scalable Backend: Built on a lightweight and flexible Node.js framework.
Virtual Consultations: Connect with doctors via Google Meet for non-critical issues.
Slot Booking System: Schedule appointments effortlessly.


Prerequisites
Ensure the following are installed on your system:

Node.js: v18.0.0 or later
MongoDB: v6.0 or later
npm: v8.0.0 or later
Google Meet API Integration: Optional for virtual consultations
Email Credentials: Required for Nodemailer functionality
Installation
Clone the Repository:

bash
Copy code
git clone https://github.com/beast-codez/Project-K
cd HealthConnect
Install Dependencies:

bash
Copy code
npm install
Set Up Environment Variables: Create a .env file and include the following:

env
Copy code
PORT=3000
MONGO_URI=
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
Start the Server:

bash
Copy code
npm start
Access the Application: Open http://localhost:3000 in your browser.

Project Structure
bash
Copy code
HealthConnect/
├── public/          # Static assets (CSS, JavaScript, images)
├── views/           # EJS templates for dynamic content
├── routes/          # API routes
├── models/          # Mongoose schemas
├── controllers/     # Business logic and middleware
├── utils/           # Helper functions
├── index.js         # Entry point for the application
├── package.json     # Project metadata and dependencies
└── .env             # Environment configuration
Tech Stack
Frontend
HTML5, CSS3, JavaScript
EJS for server-side rendering
Backend
Node.js with Express.js
MongoDB with Mongoose
Utilities
Nodemailer for email notifications
Node-Cron for task scheduling
bcrypt for password hashing
CORS for handling cross-origin requests
Dependencies
Key dependencies with their versions:

Package	Version	Description
express	^4.21.0	Web framework for Node.js
mongoose	^8.8.1	MongoDB object modeling tool
bcrypt	^5.1.1	Secure password hashing
nodemailer	^6.9.15	Email sending utility
node-cron	^3.0.3	Task scheduler
dotenv	^16.4.5	Environment variable management
body-parser	^1.20.3	Parse incoming request bodies
ejs	^3.1.10	Template engine for dynamic HTML
cors	^2.8.5	Enable cross-origin requests
For a full list, refer to the package.json file.

Usage
Virtual Consultations:

Navigate to the "Consult a Doctor" section.
Choose an available slot and confirm your booking.
Join the consultation via integrated Google Meet.
Medication Reminders:

Add medications with name, dosage, and schedule.
Receive email alerts at the specified time.
Health Records:

Securely store and access your health history.
Contributing
We welcome contributions to enhance HealthConnect. To contribute:

Fork the repository.
Create a new branch: git checkout -b feature/YourFeature.
Commit your changes: git commit -m "Add YourFeature".
Push the branch: git push origin feature/YourFeature.
Submit a pull request.
License
This project is licensed under the ISC License. See the LICENSE file for more details.

Contact
For questions, feedback, or support, please reach out:
iit20230048@iiita.ac.in
iit2023042@iiita.ac.in
iit2023006@iiita.ac.in
iit2023026@iiita.ac.in

GitHub: https://github.com/beast-codez/Project-K
This README.md is designed to be clean, professional, and informative, suitable for both collaborators and users of the HealthConnect application. Let me know if you’d like further enhancements!
