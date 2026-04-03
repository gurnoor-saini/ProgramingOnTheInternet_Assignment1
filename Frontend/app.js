const form = document.getElementById('flashcardForm');
const flashcardsDiv = document.getElementById('flashcards');

const backendURL = 'http://localhost:3000';

let studyPile = [];
let currentIndex = 0;

async function loadGroups() {
  const res = await fetch(`${backendURL}/groups`);
  const groups = await res.json();

  const select = document.getElementById('group');
  select.innerHTML = '<option value="">Select group</option>';
  groups.forEach(g => {
    const option = document.createElement('option');
    option.value = g.name;
    option.textContent = g.name;
    select.appendChild(option);
  });

  return groups;
}

async function addGroup() {
  const name = document.getElementById('newGroup').value.trim();
  if (!name) return;

  await fetch(`${backendURL}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  document.getElementById('newGroup').value = '';
  loadGroups();
  loadFlashcards();
}

async function deleteGroup(name) {
  if (!confirm(`Delete group "${name}" and all its flashcards?`)) return;

  await fetch(`${backendURL}/groups/${name}`, { method: 'DELETE' });
  loadGroups();
  loadFlashcards();
}

async function loadFlashcards() {
  const groups = await fetch(`${backendURL}/groups`).then(r => r.json());
  const cards = await fetch(`${backendURL}/flashcards`).then(r => r.json());

  flashcardsDiv.innerHTML = '<h2>Groups</h2>';

  groups.forEach(groupObj => {
    const groupName = groupObj.name;
    const groupCards = cards.filter(c => c.group === groupName);

    const div = document.createElement('div');
    div.classList.add('flashcard');

    const title = document.createElement('h3');
    title.textContent = `${groupName} (${groupCards.length} card(s))`;
    div.appendChild(title);

    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '5px';

    const studyBtn = document.createElement('button');
    studyBtn.textContent = 'Study';
    studyBtn.onclick = (e) => {
      e.stopPropagation();
      startStudyMode(groupName, groupCards);
    };
    btnContainer.appendChild(studyBtn);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = (e) => {
      e.stopPropagation();
      showEditMode(groupName, groupCards);
    };
    btnContainer.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteGroup(groupName);
    };
    btnContainer.appendChild(delBtn);

    div.appendChild(btnContainer);
    flashcardsDiv.appendChild(div);
  });
}

function startStudyMode(groupName, groupCards) {
  let originalOrder = [...groupCards];
  studyPile = [...groupCards];
  currentIndex = 0;

  let randomized = false;

  function renderCard() {
    if (studyPile.length === 0) {
      flashcardsDiv.innerHTML = `<h2>${groupName}</h2><p>All cards done!</p>`;
      const backBtn = document.createElement('button');
      backBtn.textContent = '← Back to Groups';
      backBtn.onclick = loadFlashcards;
      flashcardsDiv.appendChild(backBtn);
      return;
    }

    const card = studyPile[currentIndex];
    flashcardsDiv.innerHTML = `
      <h2>${groupName} - Study Mode</h2>
      <div class="flashcard">
        <strong>Q:</strong> ${card.question}<br>
        <strong>A:</strong> ${card.answer}<br>
        <button id="tickBtn">✅</button>
        <button id="crossBtn">❌</button>
      </div>
      <p>Card ${currentIndex + 1} of ${studyPile.length}</p>
    `;

    document.getElementById('tickBtn').onclick = () => {
      studyPile.splice(currentIndex, 1);
      renderCard();
    };

    document.getElementById('crossBtn').onclick = () => {
      const c = studyPile.splice(currentIndex, 1)[0];
      studyPile.push(c);
      renderCard();
    };

    const randomBtn = document.createElement('button');
    randomBtn.textContent = randomized ? 'Turn Randomize off' : 'Turn randomize on';
    randomBtn.style.backgroundColor = randomized ? '#4CAF50' : '';
    randomBtn.onclick = () => {
      randomized = !randomized;
      if (randomized) {
        studyPile = shuffleArray([...studyPile]);
      } else {
        studyPile = [...originalOrder];
      }
      currentIndex = 0;
      renderCard();
    };
    flashcardsDiv.appendChild(randomBtn);
  }

  renderCard();
}

function renderStudyCard(groupName) {
  if (studyPile.length === 0) {
    flashcardsDiv.innerHTML = `<h2>${groupName}</h2><p>All cards done!</p>`;
    const backBtn = document.createElement('button');
    backBtn.textContent = '← Back to Groups';
    backBtn.onclick = loadFlashcards;
    flashcardsDiv.appendChild(backBtn);
    return;
  }

  const card = studyPile[currentIndex];
  flashcardsDiv.innerHTML = `
    <h2>${groupName} - Study Mode</h2>
    <div class="flashcard">
      <strong>Q:</strong> ${card.question}<br>
      <strong>A:</strong> ${card.answer}<br>
      <button id="tickBtn">✅ Tick</button>
      <button id="crossBtn">❌ Cross</button>
    </div>
    <p>Card ${currentIndex + 1} of ${studyPile.length}</p>
  `;

  document.getElementById('tickBtn').onclick = () => {
    studyPile.splice(currentIndex, 1);
    renderStudyCard(groupName);
  };

  document.getElementById('crossBtn').onclick = () => {
    const c = studyPile.splice(currentIndex, 1)[0];
    studyPile.push(c);
    renderStudyCard(groupName);
  };
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showEditMode(groupName, groupCards) {
  flashcardsDiv.innerHTML = `<h2>${groupName} - Edit Mode</h2>`;

  groupCards.forEach(card => {
    const div = document.createElement('div');
    div.classList.add('flashcard');
    div.innerHTML = `
      <strong>Q:</strong> ${card.question}<br>
      <strong>A:</strong> ${card.answer}<br>
    `;

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editCard(card);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteCard(card._id);

    div.appendChild(editBtn);
    div.appendChild(deleteBtn);
    flashcardsDiv.appendChild(div);
  });

  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to Groups';
  backBtn.onclick = loadFlashcards;
  flashcardsDiv.appendChild(backBtn);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const question = document.getElementById('question').value.trim();
  const answer = document.getElementById('answer').value.trim();
  const group = document.getElementById('group').value;

  if (!question || !answer || !group) return;

  await fetch(`${backendURL}/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer, group })
  });

  form.reset();
  loadFlashcards();
});

async function deleteCard(id) {
  await fetch(`${backendURL}/flashcards/${id}`, { method: 'DELETE' });
  loadFlashcards();
}

async function editCard(card) {
  const question = prompt('Edit question:', card.question);
  const answer = prompt('Edit answer:', card.answer);
  if (!question || !answer) return;

  await fetch(`${backendURL}/flashcards/${card._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer, group: card.group })
  });

  loadFlashcards();
}

loadGroups();
loadFlashcards();