Flashcard Learning App

HOW TO RUN 
1. Open your terminal and navigate to the Backend folder:
   cd Backend
2. Install dependencies (first time only):
   npm install
3. Start the server:
   node server.js
4. Wait until you see the following in the terminal:
   Connected to MongoDB Atlas
   Server running on port 3000: http://localhost:3000
5. Click the link or open your browser and go to:
   http://localhost:3000

Note: The server must be running the whole time you use the app.
      If you close the terminal the app will stop working.
      It is okay for the marker to use the credentials in the .env
      as these credentials were created solely for this assignment.


PROJECT SUMMARY
Students often find the best way to retain information is through using flashcards.
However it is often time consuming to create physical flashcards. Hence this app allows users
to register an account, create and study flashcards grouped by subject online. It allows for
study mode where you can reveal the answer and randomise the card order, making studying easier.


TECHNICAL STACK
Frontend:     HTML, CSS, Vanilla JavaScript (Single Page Application)
Styling:      Custom CSS with CSS variables, keyframe animations, and responsive layout
Backend:      Node.js with Express
Database:     MongoDB Atlas (cloud-hosted NoSQL database)
Auth:         JWT (JSON Web Tokens) + bcrypt password hashing
API:          RESTful API connecting frontend to backend via fetch()
Deployment:   Local (localhost:3000)


FEATURES
- CRUD for 3 entites including : groups, flashcards, user
- Register a new account or log in to an existing one with password hashing and JW implemented
- Update pastword or delete account using the side panel
- Create  groups (subjects)
- Edit group name in edit mode
- Delete entire groups in edit mode (with all their cards)
- Add flashcards with a question and answer to any group
- Edit existing flashcard questions and answers
- Delete individual flashcards
- Live search: filter groups in real time as you type on the main page
- Live search: filter flashcards within a group in real time in edit mode
- Study mode with question first reveal, answer shown only on request
- Tick to mark a card as known and remove it from the pile
- Cross to send a card to the back of the pile for more practice
- Smooth animation when a card is answered correctly or incorrectly
- Randomise card order toggle in study mode
- Admin view: see all users' study history (correct/incorrect per card)
- Admin view: see all registered users with their role and last login time
- Admin can delete any non-admin user account and all their data


FOLDER STRUCTURE
ProgramingOnTheInternet_Assignment1/
|-- README.txt               - This file
|-- .gitignore               - Excludes node_modules and .env from version control
|
|-- Frontend/
|   |-- index.html           - Single HTML file (entire app lives here)
|   |-- styles.css           - Core styling: theme variables, layout, animations
|   |-- app.js               - Main app logic: CRUD, study mode, admin view
|   |-- login.js             - Authentication: register, login, logout, JWT handling
|   |-- searchbar.js         - Reusable search bar component used across views
|   |-- searchbar.css        - Styles for the search bar component
|   |-- table.js             - Reusable admin table component (history + users)
|   |-- table.css            - Styles for admin data tables
|   |-- images/
|       |-- Card.png         - Background image used for study flashcards
|       |-- settings.png     - Settings icon in the bottom-right toolbar
|
|-- Backend/
    |-- server.js            - Express server: all REST API routes and MongoDB logic
    |-- .env                 - MongoDB connection string (not pushed to GitHub)


CHALLENGES OVERCOME
One early security mistake was committing the MongoDB connection string and password to GitHub.
This was resolved by moving credentials to a .env file and adding it to .gitignore so sensitive
data is never pushed. Another challenge was using a custom image as the flashcard background,
which required careful CSS tuning so the background size and position made the card look natural.
Positioning the study mode buttons was also unexpectedly tricky as they were inside a flex
container inheriting the card width and stretching to full height. This was fixed by wrapping
them in a separate container div to break out of the flex context. Implementing live search
without re-fetching from the server on every keystroke required caching the data after the
initial load and filtering the cached array on each input event.


TEST LOGINS
Two users are seeded into the database on server start:

  admin@example.com / admin       (admin: sees all users study history)
  testuser@example.com / testuser (regular user)

New accounts can also be created via the Register link on the login page.


WORKLOAD ALLOCATION

Jackie Truong (jackie-trng05):
- Registration/login: user authentication with bcrypt password hashing and JWT tokens
- Admin view: extended admin panel to show all users with roles and last login time
- Admin can delete any non-admin user account and all their data
- UI: colour token consolidation, CSS restructuring, searchbar and table
  abstracted into reusable components (searchbar.js, searchbar.css, table.js, table.css)
- General styling and layout improvements across all views

Gurnoor Saini (gurnoor-saini):
- Live search: real-time filtering of groups on main page and flashcards in edit mode
- Admin view: initial implementation showing all users learning history (correct/incorrect)
- User account CRUD: change password and delete account via settings panel
- User registration: Register link and form on the login page
- Group rename: rename a group from edit mode (completing full CRUD on groups entity)
- Study history recording: POST /history endpoint and frontend calls on correct/incorrect