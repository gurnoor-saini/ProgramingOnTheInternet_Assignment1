const form = document.getElementById('flashcardForm');
const flashcardsDiv = document.getElementById('flashcards');
const addFlashcardSection = document.getElementById('addFlashcardSection');
const toast = document.getElementById('toast');
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmOkBtn = document.getElementById('confirmOk');
const confirmCancelBtn = document.getElementById('confirmCancel');

const backendURL = 'http://localhost:3000';

let studyPile = [];
let currentIndex = 0;

function showToast(message = 'Something went wrong. Please try again.') {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function showConfirm(message) {
  return new Promise((resolve) => {
    confirmMessage.textContent = message;
    confirmModal.classList.remove('hidden');

    const handleOk = () => {
      confirmModal.classList.add('hidden');
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      confirmModal.classList.add('hidden');
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      confirmOkBtn.removeEventListener('click', handleOk);
      confirmCancelBtn.removeEventListener('click', handleCancel);
    };

    confirmOkBtn.addEventListener('click', handleOk);
    confirmCancelBtn.addEventListener('click', handleCancel);
  });
}

function hideAddFlashCardSection() {
  addFlashcardSection.style.display = 'none';
  form.style.display = 'none';
}

function showAddFlashCardSection() {
  addFlashcardSection.style.display = '';
  form.style.display = '';
}

async function loadGroups() {
  try {
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
  } catch (err) {
    showToast('Could not load groups. Is the server running?');
    return [];
  }
}

async function addGroup() {
  const name = document.getElementById('newGroup').value.trim();
  if (!name) return;

  try {
    await fetch(`${backendURL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    document.getElementById('newGroup').value = '';
    loadGroups();
    loadFlashcards();
  } catch (err) {
    showToast('Could not add group. Is the server running?');
  }
}

async function deleteGroup(name) {
  const confirmed = await showConfirm(`Delete group "${name}" and all its flashcards?`);
  if (!confirmed) return;

  try {
    await fetch(`${backendURL}/groups/${name}`, { method: 'DELETE' });
    loadGroups();
    loadFlashcards();
  } catch (err) {
    showToast('Could not delete group. Is the server running?');
  }
}

async function loadFlashcards() {
  showAddFlashCardSection();

  try {
    const groups = await fetch(`${backendURL}/groups`).then(r => r.json());
    const cards = await fetch(`${backendURL}/flashcards`).then(r => r.json());

    flashcardsDiv.innerHTML = '<h2>Groups</h2>';

    groups.forEach(groupObj => {
      const groupName = groupObj.name;
      const groupCards = cards.filter(c => c.group === groupName);

      const div = document.createElement('div');
      div.classList.add('flashcard');

      const title = document.createElement('h3');
      const cardCount = groupCards.length;
      title.textContent = `${groupName} — ${cardCount} ${cardCount === 1 ? 'card' : 'cards'}`;
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
  } catch (err) {
    flashcardsDiv.innerHTML = `
      <div class="done-message">
        <p>Could not connect to the server.</p>
        <p>Please make sure the server is running and refresh the page.</p>
        <button onclick="loadFlashcards()">Try Again</button>
      </div>
    `;
    showToast('Could not load flashcards. Is the server running?');
  }
}

function startStudyMode(groupName, groupCards) {
  hideAddFlashCardSection();

  let originalOrder = [...groupCards];
  studyPile = [...groupCards];
  currentIndex = 0;
  let randomized = false;

  function renderCard() {
    flashcardsDiv.innerHTML = '';

    if (studyPile.length === 0) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('study-mode-wrapper');
      wrapper.innerHTML = `<h2>${groupName}</h2>`;

      const doneDiv = document.createElement('div');
      doneDiv.classList.add('done-message');
      doneDiv.innerHTML = `<p>All cards studied!</p>`;

      const backBtn = document.createElement('button');
      backBtn.textContent = 'Back to Groups';
      backBtn.onclick = loadFlashcards;
      doneDiv.appendChild(backBtn);

      wrapper.appendChild(doneDiv);
      flashcardsDiv.appendChild(wrapper);
      return;
    }

    const card = studyPile[currentIndex];
    let isFlipped = false;
    let isAnimating = false;

    const wrapper = document.createElement('div');
    wrapper.classList.add('study-mode-wrapper');

    const title = document.createElement('h2');
    title.textContent = `${groupName} - Study Mode`;
    wrapper.appendChild(title);

    const counter = document.createElement('p');
    counter.classList.add('card-counter');
    counter.textContent = `Card ${currentIndex + 1} of ${studyPile.length}`;
    wrapper.appendChild(counter);

    const cardEl = document.createElement('div');
    cardEl.classList.add('study-flashcard');
    cardEl.innerHTML = `<strong>Q:</strong> ${card.question}`;
    wrapper.appendChild(cardEl);

    const cardBtnRow = document.createElement('div');
    cardBtnRow.classList.add('study-controls-wrapper');

    const cardBtns = document.createElement('div');
    cardBtns.classList.add('study-btn-row');

    const answerBtn = document.createElement('button');
    answerBtn.textContent = 'Show Answer';
    answerBtn.onclick = () => {
      if (!isFlipped) {
        isFlipped = true;
        cardEl.innerHTML = `<strong>Q:</strong> ${card.question}<br><br><strong>A:</strong> ${card.answer}`;
        answerBtn.textContent = 'Hide Answer';
      } else {
        isFlipped = false;
        cardEl.innerHTML = `<strong>Q:</strong> ${card.question}`;
        answerBtn.textContent = 'Show Answer';
      }
    };
    cardBtns.appendChild(answerBtn);

    const tickBtn = document.createElement('button');
    tickBtn.textContent = '✅';
    tickBtn.addEventListener('mouseenter', () => {
      cardEl.classList.add('hover-correct');
    });
    tickBtn.addEventListener('mouseleave', () => {
      cardEl.classList.remove('hover-correct');
    });
    tickBtn.onclick = () => {
      if (isAnimating) return;
      isAnimating = true;
      cardEl.classList.remove('hover-correct');
      cardEl.classList.add('correct-anim');
      setTimeout(() => {
        studyPile.splice(currentIndex, 1);
        renderCard();
      }, 800);
    };
    cardBtns.appendChild(tickBtn);

    const crossBtn = document.createElement('button');
    crossBtn.textContent = '❌';
    crossBtn.addEventListener('mouseenter', () => {
      cardEl.classList.add('hover-wrong');
    });
    crossBtn.addEventListener('mouseleave', () => {
      cardEl.classList.remove('hover-wrong');
    });
    crossBtn.onclick = () => {
      if (isAnimating) return;
      isAnimating = true;
      cardEl.classList.remove('hover-wrong');
      cardEl.classList.add('wrong-anim');
      setTimeout(() => {
        const c = studyPile.splice(currentIndex, 1)[0];
        studyPile.push(c);
        renderCard();
      }, 600);
    };
    cardBtns.appendChild(crossBtn);

    cardBtnRow.appendChild(cardBtns);
    wrapper.appendChild(cardBtnRow);

    const navBtnRow = document.createElement('div');
    navBtnRow.classList.add('study-controls-wrapper');

    const navBtns = document.createElement('div');
    navBtns.classList.add('study-btn-row');

    const randomBtn = document.createElement('button');
    randomBtn.textContent = randomized ? 'Randomize: On' : 'Randomize: Off';
    randomBtn.style.backgroundColor = randomized ? 'var(--btn-success)' : '';
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
    navBtns.appendChild(randomBtn);

    const backBtn = document.createElement('button');
    backBtn.textContent = 'Back to Groups';
    backBtn.onclick = loadFlashcards;
    navBtns.appendChild(backBtn);

    navBtnRow.appendChild(navBtns);
    wrapper.appendChild(navBtnRow);

    flashcardsDiv.appendChild(wrapper);
  }

  renderCard();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showEditMode(groupName, groupCards) {
  hideAddFlashCardSection();
  flashcardsDiv.innerHTML = `<h2>${groupName} - Edit Mode</h2>`;

  groupCards.forEach(card => {
    const div = document.createElement('div');
    div.classList.add('flashcard');
    div.innerHTML = `
      <strong>Q:</strong> ${card.question}<br>
      <strong>A:</strong> ${card.answer}<br>
    `;

    const editBtnRow = document.createElement('div');
    editBtnRow.classList.add('edit-btn-row');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editCard(card);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteCard(card._id);

    editBtnRow.appendChild(editBtn);
    editBtnRow.appendChild(deleteBtn);
    div.appendChild(editBtnRow);

    flashcardsDiv.appendChild(div);
  });

  const backBtn = document.createElement('button');
  backBtn.textContent = 'Back to Groups';
  backBtn.onclick = loadFlashcards;
  flashcardsDiv.appendChild(backBtn);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const question = document.getElementById('question').value.trim();
  const answer = document.getElementById('answer').value.trim();
  const group = document.getElementById('group').value;

  if (!question || !answer || !group) return;

  try {
    await fetch(`${backendURL}/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, group })
    });

    form.reset();
    loadFlashcards();
  } catch (err) {
    showToast('Could not add flashcard. Is the server running?');
  }
});

async function deleteCard(id) {
  const confirmed = await showConfirm('Delete this flashcard?');
  if (!confirmed) return;

  try {
    await fetch(`${backendURL}/flashcards/${id}`, { method: 'DELETE' });
    loadFlashcards();
  } catch (err) {
    showToast('Could not delete flashcard. Is the server running?');
  }
}

async function editCard(card) {
  const question = prompt('Edit question:', card.question);
  const answer = prompt('Edit answer:', card.answer);
  if (!question || !answer) return;

  try {
    await fetch(`${backendURL}/flashcards/${card._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, group: card.group })
    });

    loadFlashcards();
  } catch (err) {
    showToast('Could not update flashcard. Is the server running?');
  }
}

loadGroups();
loadFlashcards();