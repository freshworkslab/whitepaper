const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User'); // Assuming you have a User model for MongoDB

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// MongoDB connection
mongoose.connect('mongodb+srv://steve277:Cathy312@cluster0.fimk7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Root route to redirect to login or serve a homepage
app.get('/', (req, res) => {
    res.redirect('/login'); // You can change this to res.sendFile() if you want a homepage
});

// Display login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Display registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Registration route
// Registration route
app.post('/register', async (req, res) => {
    const { email, password, firstName, lastName } = req.body; // Include firstName and lastName

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.send('User already exists. <a href="/login">Login here</a>');
        }

        user = new User({ email, password, firstName, lastName }); // Add firstName and lastName
        await user.save();

        res.send('User registered successfully. <a href="/login">Login here</a>');
    } catch (error) {
        console.error(error);
        res.send('Error occurred during registration.');
    }
});


// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.send('Invalid email or password. <a href="/login">Try again</a>');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.send('Invalid email or password. <a href="/login">Try again</a>');
        }

        req.session.loggedIn = true;
        req.session.email = email;
        res.redirect('/whitepaper');
    } catch (error) {
        console.error(error);
        res.send('Error occurred during login.');
    }
});

// Whitepaper route
app.get('/whitepaper', (req, res) => {
    if (req.session.loggedIn) {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Whitepaper</title>
                <link rel="stylesheet" href="/css/style.css">
                <style>
                    /* Add CSS for top-right corner user info */
                    #user-info {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background-color: #f1f1f1;
                        padding: 10px;
                        border-radius: 5px;
                    }
                    #logout-link {
                        margin-left: 10px;
                        color: red;
                        text-decoration: none;
                        font-weight: bold;
                    }
                </style>
                <script
src='//in.fw-cdn.com/31677810/851659.js'
chat='true'>
</script>
            </head>
            <body>
                <div id="user-info">
                    Logged in as: <span id="email-display">${req.session.email}</span>
                    <a href="/logout" id="logout-link">Logout</a>
                </div>
                <h1>Download our Whitepaper</h1>
                <p>Click the link below to download the whitepaper.</p>
                <a href="/downloads/whitepaper.pdf" download>Download Whitepaper</a>

                <!-- User Input Form -->
                <h2>Provide Additional Information</h2>
                <form id="userInfoForm">
                    
                    <label for="address">Address:</label>
                    <input type="text" id="address" placeholder="Enter your address" required><br><br>

                    <label for="city">City:</label>
                    <input type="text" id="city" placeholder="Enter your city" required><br><br>

                    <label for="state">State:</label>
                    <input type="text" id="state" placeholder="Enter your state" required><br><br>

                    <label for="zipCode">Zip Code:</label>
                    <input type="number" id="zipCode" placeholder="Enter your zip code" required><br><br>

                    <label for="mobile">Mobile:</label>
                    <input type="text" id="mobile" placeholder="Enter your mobile number" required><br><br>

                    <button type="submit">Submit</button>
                </form>

                <script>
                    // JavaScript to handle form submission
                    document.getElementById('userInfoForm').addEventListener('submit', function(event) {
                        event.preventDefault(); // Prevent form from submitting the traditional way
                        const email = "${req.session.email}"; // Access logged-in user's email from session
                        //const firstName = document.getElementById('firstName').value;
                        //const lastName = document.getElementById('lastName').value;
                        const address = document.getElementById('address').value;
                        const city = document.getElementById('city').value;
                        const state = document.getElementById('state').value;
                        const zipCode = document.getElementById('zipCode').value;
                        const mobile = document.getElementById('mobile').value;

                        // Create the sample_properties object
                        var sample_properties = {
                          //  "First Name": firstName,    // Use the input from the form
                          //  "Last Name": lastName,      // Use the input from the form
                            "Address": address,         // Use the input from the form
                            "City": city,               // Use the input from the form
                            "State": state,             // Use the input from the form
                            "Zip Code": zipCode,        // Use the input from the form
                            "Mobile": mobile,           // Use the input from the form
                            "Alternate Contact Number": "98765432", // Example static value
                            "Email": email              // Include the logged-in user's email
                        };

                        // Call fwcrm.set method with the properties
                        fwcrm.set(sample_properties);

                        // Optionally display a message to the user or process further
                        alert("Details submitted successfully.");
                    });
                </script>
            </body>
            </html>
        `);
    } else {
        res.redirect('/login');
    }
});


// Logout route
app.get('/logout', (req, res) => {
    // Destroy the session and redirect to login
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/login');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
