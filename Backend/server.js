const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://gurnoorsaini0809_db_user:v5CsqgwENLTLJW26@cluster0.s5vb0ue.mongodb.net/flashcardsDB?retryWrites=true&w=majority';
const client = new MongoClient(uri);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('flashcardsDB');
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

connectDB();

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Frontend')));

app.post('/flashcards', async (req, res) => {
  try {
    const card = req.body; 
    const result = await db.collection('flashcards').insertOne(card);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding flashcard');
  }
});

app.get('/flashcards', async (req, res) => {
  try {
    const cards = await db.collection('flashcards').find().toArray();
    res.send(cards);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching flashcards');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));