const form = document.getElementById('flashcardForm');
const flashcardsDiv = document.getElementById('flashcards');

const backendURL = 'http://localhost:3000';

async function loadFlashcards() {
  const response = await fetch(`${backendURL}/flashcards`);
  const flashcards = await response.json();
  flashcardsDiv.innerHTML = '';
  flashcards.forEach(card => {
    const div = document.createElement('div');
    div.classList.add('flashcard');
    div.innerHTML = `<strong>Q:</strong> ${card.question}<br><strong>A:</strong> ${card.answer}`;
    flashcardsDiv.appendChild(div);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = document.getElementById('question').value;
  const answer = document.getElementById('answer').value;

  await fetch(`${backendURL}/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer })
  });

  form.reset();
  loadFlashcards();
});

loadFlashcards();