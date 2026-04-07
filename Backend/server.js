// Loading environment variables from .env file
require('dotenv').config();

// Importing the necessary modules
const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialising the Express app
const app = express();
const PORT = 3000;

//Seting up the middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Frontend')));

//Setting up MongoDB connection
const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('flashcardsDB');
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

//Creating a group 
app.post('/groups', async (req, res) => {
  try {
    const { name } = req.body;
    await db.collection('groups').insertOne({ name });
    res.send({ success: true });
  } catch (err) {
    res.status(500).send('Error adding group');
  }
});

//Getting all the groups 
app.get('/groups', async (req, res) => {
  try {
    const groups = await db.collection('groups').find().toArray();
    res.send(groups);
  } catch (err) {
    res.status(500).send('Error fetching groups');
  }
});

//Deleting a group and its associated flashcards
app.delete('/groups/:name', async (req, res) => {
  try {
    const groupName = req.params.name;

    await db.collection('groups').deleteOne({ name: groupName });
    await db.collection('flashcards').deleteMany({ group: groupName });

    res.send({ success: true });
  } catch (err) {
    res.status(500).send('Error deleting group');
  }
});

//Creating a flashcard
app.post('/flashcards', async (req, res) => {
  try {
    await db.collection('flashcards').insertOne(req.body);
    res.send({ success: true });
  } catch (err) {
    res.status(500).send('Error adding flashcard');
  }
});

//Getting all flashcards
app.get('/flashcards', async (req, res) => {
  try {
    const cards = await db.collection('flashcards').find().toArray();
    res.send(cards);
  } catch (err) {
    res.status(500).send('Error fetching flashcards');
  }
});

//Edding a flashcard
app.put('/flashcards/:id', async (req, res) => {
  try {
    await db.collection('flashcards').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.send({ success: true });
  } catch (err) {
    res.status(500).send('Error editing flashcard');
  }
});

//Deleting a flashcard
app.delete('/flashcards/:id', async (req, res) => {
  try {
    await db.collection('flashcards').deleteOne({ _id: new ObjectId(req.params.id) });
    res.send({ success: true });
  } catch (err) {
    res.status(500).send('Error deleting flashcard');
  }
});

//Starting the server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}: http://localhost:${PORT}`));
}

startServer();