require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
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
    console.error(err);
    process.exit(1);
  }
}

app.post('/groups', async (req, res) => {
  try {
    const { name } = req.body;
    await db.collection('groups').insertOne({ name });
    res.send({ success: true });
  } catch (err) {
    res.status(500).send('Error adding group');
  }
});

app.get('/groups', async (req, res) => {
  try {
    const groups = await db.collection('groups').find().toArray();
    res.send(groups);
  } catch (err) {
    res.status(500).send('Error fetching groups');
  }
});

app.delete('/groups/:name', async (req, res) => {
  try {
    const groupName = req.params.name;

    // delete group
    await db.collection('groups').deleteOne({ name: groupName });

    // delete flashcards in that group
    await db.collection('flashcards').deleteMany({ group: groupName });

    res.send({ success: true });
  } catch (err) {
    res.status(500).send('Error deleting group');
  }
});

app.post('/flashcards', async (req, res) => {
  try {
    await db.collection('flashcards').insertOne(req.body);
    res.send({ success: true });
  } catch (err) {
    res.status(500).send('Error adding flashcard');
  }
});

app.get('/flashcards', async (req, res) => {
  try {
    const cards = await db.collection('flashcards').find().toArray();
    res.send(cards);
  } catch (err) {
    res.status(500).send('Error fetching flashcards');
  }
});

app.put('/flashcards/:id', async (req, res) => {
  try {
    await db.collection('flashcards').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.send({ success: true });
  } catch (err) {
    res.status(500).send('Error updating flashcard');
  }
});

app.delete('/flashcards/:id', async (req, res) => {
  try {
    await db.collection('flashcards').deleteOne({ _id: new ObjectId(req.params.id) });
    res.send({ success: true });
  } catch (err) {
    res.status(500).send('Error deleting flashcard');
  }
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();