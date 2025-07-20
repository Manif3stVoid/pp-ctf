const express = require('express');
const bodyParser = require('body-parser');
const merge = require('lodash.merge'); // The vulnerable library

const app = express();
const PORT = 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let users = []; // Stores registered users (not directly used in the pollution logic)
let sessionUser = null; // Represents the current logged-in user's session
const FLAG = "FLAG{JS_engineers_cry_inheritance}"; // The secret flag to capture

/**
 * Debugging function to illustrate the effect of merge, especially on the prototype.
 * @param {object} input - The object payload to merge.
 * @returns {object} - The target object after merging.
 */
function debugMerge(input) {
  console.log("DEBUG: Merging payload:", JSON.stringify(input, null, 2));
  const target = {}; // A fresh object to merge into
  merge(target, input); // Perform the merge operation

  // Show the isAdmin property on different objects to demonstrate pollution
  console.log("DEBUG: target.isAdmin =", target.isAdmin); // Should be undefined unless directly in input
  console.log("DEBUG: {}.isAdmin =", {}.isAdmin); // Crucial check: will be true if Object.prototype is polluted
  console.log("DEBUG: Object.getPrototypeOf({}).isAdmin =", Object.getPrototypeOf({}).isAdmin); // Direct check on Object.prototype

  return target;
}

// Home route with navigation links
app.get('/home', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Prototype Pollution CTF</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { font-family: 'Inter', sans-serif; background-color: #f0f4f8; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .container { background-color: #ffffff; padding: 2.5rem; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); text-align: center; max-width: 400px; width: 90%; }
            h1 { font-size: 2.25rem; font-weight: 700; color: #1a202c; margin-bottom: 1.5rem; }
            ul { list-style: none; padding: 0; margin-top: 2rem; }
            li { margin-bottom: 1rem; }
            a { display: inline-block; background-color: #4299e1; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; transition: background-color 0.2s ease-in-out; }
            a:hover { background-color: #3182ce; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome to Prototype Pollution CTF</h1>
            <p class="text-gray-600 mb-4">Explore the routes to find the vulnerability!</p>
            <ul>
                <li><a href="/register">Register</a></li>
                <li><a href="/login">Login</a></li>
                <li><a href="/whoami">Who Am I</a></li>
            </ul>
        </div>
    </body>
    </html>
  `);
});

// Register route - allows creating a user (not directly vulnerable)
app.get('/register', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Register</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { font-family: 'Inter', sans-serif; background-color: #f0f4f8; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .container { background-color: #ffffff; padding: 2.5rem; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); text-align: center; max-width: 400px; width: 90%; }
            h2 { font-size: 1.875rem; font-weight: 700; color: #1a202c; margin-bottom: 1.5rem; }
            form { display: flex; flex-direction: column; gap: 1rem; }
            input { padding: 0.75rem; border: 1px solid #cbd5e0; border-radius: 0.5rem; font-size: 1rem; }
            button { background-color: #48bb78; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: background-color 0.2s ease-in-out; }
            button:hover { background-color: #38a169; }
            a { color: #4299e1; text-decoration: none; margin-top: 1rem; display: block; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Register</h2>
            <form action="/register" method="POST">
                <input name="username" placeholder="Username" required class="focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <button type="submit">Register</button>
            </form>
            <a href="/home">Go Home</a>
        </div>
    </body>
    </html>
  `);
});

app.post('/register', (req, res) => {
  const { username } = req.body;
  if (username) {
    // In a real app, you'd hash passwords and store securely.
    // For this CTF, we just store username and a default isAdmin.
    users.push({ username, isAdmin: false });
    sessionUser = { username, isAdmin: false }; // Set session for the newly registered user
    return res.redirect('/whoami');
  } else {
    res.status(400).send('Username is required.');
  }
});

// Login route - contains the prototype pollution vulnerability
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { font-family: 'Inter', sans-serif; background-color: #f0f4f8; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .container { background-color: #ffffff; padding: 2.5rem; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); text-align: center; max-width: 400px; width: 90%; }
            h2 { font-size: 1.875rem; font-weight: 700; color: #1a202c; margin-bottom: 1.5rem; }
            form { display: flex; flex-direction: column; gap: 1rem; }
            input { padding: 0.75rem; border: 1px solid #cbd5e0; border-radius: 0.5rem; font-size: 1rem; }
            button { background-color: #667eea; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: background-color 0.2s ease-in-out; }
            button:hover { background-color: #5a67d8; }
            a { color: #4299e1; text-decoration: none; margin-top: 1rem; display: block; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Login</h2>
            <form action="/login" method="POST">
                <input name="username" placeholder="Username" required class="focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <button type="submit">Login</button>
            </form>
            <a href="/home">Go Home</a>
        </div>
    </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  // --- ADDED FOR DEBUGGING ---
  console.log("DEBUG: Raw req.body received:", JSON.stringify(req.body, null, 2));
  // --- END ADDED FOR DEBUGGING ---

  // IMPORTANT: This CTF relies on a vulnerable version of lodash.merge.
  // Ensure your package.json specifies "lodash.merge": "4.6.0" for the exploit to work.
  // Version 4.6.2 and later have mitigations against this specific __proto__ pollution.

  // This is the first point where user-controlled req.body is merged.
  // It's primarily for debugging output, but also contributes to the vulnerability.
  debugMerge(req.body);

  const merged = {};
  // This is the critical merge operation where the pollution occurs.
  // `lodash.merge` will interpret `__proto__` or `constructor.prototype`
  // in `req.body` as a path to modify the global `Object.prototype`.
  merge(merged, req.body);

  // Set sessionUser. Note: We intentionally set isAdmin to false here
  // to ensure the flag check relies solely on the prototype pollution.
  sessionUser = { username: merged.username || 'guest', isAdmin: false };

  // The actual check for the flag.
  // If Object.prototype has been polluted with `isAdmin: true`,
  // then `({}).isAdmin` will evaluate to true because new objects inherit from the prototype.
  if (({}).isAdmin === true) {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Access</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #f0f4f8; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                .container { background-color: #ffffff; padding: 2.5rem; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); text-align: center; max-width: 600px; width: 90%; }
                h2 { font-size: 1.875rem; font-weight: 700; color: #1a202c; margin-bottom: 1.5rem; }
                .flag-box { background-color: #e0f2f7; border: 1px solid #b2ebf2; padding: 1.5rem; border-radius: 0.5rem; margin-top: 1.5rem; font-size: 1.25rem; font-weight: 600; color: #00796b; word-break: break-all; }
                a { color: #4299e1; text-decoration: none; margin-top: 1rem; display: block; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Welcome Admin!</h2>
                <p>Congratulations, you've successfully exploited the prototype pollution!</p>
                <div class="flag-box">Here is your flag: ${FLAG}</div>
                <a href="/home">Go Home</a>
            </div>
        </body>
        </html>
    `);
  } else {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Status</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #f0f4f8; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                .container { background-color: #ffffff; padding: 2.5rem; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); text-align: center; max-width: 400px; width: 90%; }
                h2 { font-size: 1.875rem; font-weight: 700; color: #1a202c; margin-bottom: 1.5rem; }
                p { color: #4a5568; margin-bottom: 1rem; }
                a { color: #4299e1; text-decoration: none; margin-top: 1rem; display: block; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Login Status</h2>
                <p>Login successful. But you are not an admin.</p>
                <a href="/home">Go Home</a>
            </div>
        </body>
        </html>
    `);
  }
});

// Who Am I route - shows current session user's details
app.get('/whoami', (req, res) => {
  if (!sessionUser) {
    return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Who Am I</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #f0f4f8; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                .container { background-color: #ffffff; padding: 2.5rem; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); text-align: center; max-width: 400px; width: 90%; }
                p { color: #4a5568; margin-bottom: 1rem; font-size: 1.125rem; }
                a { color: #4299e1; text-decoration: none; margin-top: 1rem; display: block; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <p>No session user. Please <a href="/login">login</a> or <a href="/register">register</a>.</p>
                <a href="/home">Go Home</a>
            </div>
        </body>
        </html>
    `);
  }
  res.json(sessionUser); // Return session user as JSON
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});