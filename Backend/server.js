const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// This is a temporary store for the flashcards
let flashcards = [];

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

app.post('/flashcards', (req, res) => {
  const card = req.body;
  flashcards.push(card);
  res.send(card);
});

app.get('/flashcards', (req, res) => {
  res.send(flashcards);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));