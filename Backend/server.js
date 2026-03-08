require('dotenv').config();
const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Frontend')));


const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('flashcardsDB'); 
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('Could not connect to MongoDB Atlas', err);
    process.exit(1);
  }
}

app.post('/flashcards', async (req, res) => {
  try {
    const card = req.body;
    const result = await db.collection('flashcards').insertOne(card);
    res.send(result);
  } catch (err) {
    console.error('Error adding flashcard:', err);
    res.status(500).send('Error adding flashcard');
  }
});

app.get('/flashcards', async (req, res) => {
  try {
    const cards = await db.collection('flashcards').find().toArray();
    res.send(cards);
  } catch (err) {
    console.error('Error fetching flashcards:', err);
    res.status(500).send('Error fetching flashcards');
  }
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();