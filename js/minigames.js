/**
 * Mini-Games Engine for Descriptive Text Learning (SMP Kelas 7)
 * Adds 5 Interactive Game Modes:
 * 1. Memory Card Match (Kartu Memori Kata & Arti)
 * 2. Word Rush / Speed Scramble (Tebak Kata Cepat & Acak Ubin)
 * 3. Word Search Puzzle (Cari Kata Deskriptif dalam Grid)
 * 4. Mystery Riddle (Tebak Siapakah Aku?)
 * 5. Vocabulary Duel (Sinonim vs Antonim Challenge)
 */

class MiniGamesManager {
  constructor() {
    this.currentMode = null;
    
    // --- MODE 1: MEMORY GAME STATE ---
    this.memoryCards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.memoryLock = false;
    this.memoryMoves = 0;

    // --- MODE 2: WORD RUSH STATE ---
    this.rushIndex = 0;
    this.rushScore = 0;
    this.rushTimer = 30;
    this.rushInterval = null;
    this.currentRushWord = null;
    this.rushUserTiles = [];

    // --- MODE 3: WORD SEARCH STATE ---
    this.wsGridSize = 10;
    this.wsGrid = [];
    this.wsWords = [];
    this.wsFound = [];
    this.wsSelectedCells = [];

    // --- MODE 4: MYSTERY RIDDLE STATE ---
    this.riddleIndex = 0;
    this.riddleScore = 0;
    this.riddlesList = [
      {
        riddle: "I am a companion pet. I have soft fur, love chasing yarn, and make a 'meow' sound. Who am I?",
        target: "CAT",
        clue: "A cute pet known for its whiskers and independent personality.",
        category: "Animal",
        options: ["CAT", "DOG", "RABBIT", "BIRD"]
      },
      {
        riddle: "I am tall with thick green leaves. Birds build nests on my branches, and I give cool shade. What am I?",
        target: "TREE",
        clue: "A plant with wooden trunk providing oxygen and shelter.",
        category: "Nature",
        options: ["TREE", "FLOWER", "RIVER", "GRASS"]
      },
      {
        riddle: "I have four legs and a flat wooden surface. People put books and laptops on me to study. What am I?",
        target: "DESK",
        clue: "Classroom furniture used by students for writing and reading.",
        category: "Object",
        options: ["DESK", "CHAIR", "CLOCK", "DOOR"]
      },
      {
        riddle: "I am a historic huge temple in Central Java. I have many stone stupas and Buddhist reliefs. What am I?",
        target: "BOROBUDUR",
        clue: "The magnificent eighth-century Buddhist monument in Magelang.",
        category: "Place",
        options: ["BOROBUDUR", "PRAMBANAN", "MONAS", "BALI"]
      },
      {
        riddle: "I am very huge with grey wrinkly skin, large ears, and a long flexible trunk. Who am I?",
        target: "ELEPHANT",
        clue: "The largest land mammal native to tropical forests.",
        category: "Animal",
        options: ["ELEPHANT", "GIRAFFE", "TIGER", "HORSE"]
      },
      {
        riddle: "I am very loyal. I bark when strangers come and love playing fetch with my owner. Who am I?",
        target: "DOG",
        clue: "Man's best friend known for its keen sense of smell and barking.",
        category: "Animal",
        options: ["DOG", "CAT", "LION", "SHEEP"]
      }
    ];

    // --- MODE 5: DUEL (SYNONYM VS ANTONYM) ---
    this.duelIndex = 0;
    this.duelScore = 0;
    this.duelQuestions = [
      { word: "BRAVE", type: "ANTONYM (Lawan Kata)", correct: "COWARD", options: ["COWARD", "HEROIC", "BOLD", "STRONG"], explanation: "Lawan kata dari 'Brave' (berani) adalah 'Coward' (penakut)." },
      { word: "BIG", type: "SYNONYM (Persamaan Kata)", correct: "HUGE", options: ["HUGE", "TINY", "NARROW", "SMALL"], explanation: "Persamaan kata dari 'Big' (besar) adalah 'Huge' (sangat besar)." },
      { word: "SMART", type: "SYNONYM (Persamaan Kata)", correct: "CLEVER", options: ["CLEVER", "FOOLISH", "SLOW", "CLUMSY"], explanation: "'Smart' dan 'Clever' keduanya berarti pintar atau cerdas." },
      { word: "BEAUTIFUL", type: "ANTONYM (Lawan Kata)", correct: "UGLY", options: ["UGLY", "PRETTY", "GORGEOUS", "CHARMING"], explanation: "Lawan kata dari 'Beautiful' (cantik/indah) adalah 'Ugly' (jelek)." },
      { word: "FRIENDLY", type: "SYNONYM (Persamaan Kata)", correct: "KIND", options: ["KIND", "HOSTILE", "RUDE", "CRUEL"], explanation: "'Friendly' (ramah) sepadan dengan 'Kind' (baik hati)." },
      { word: "ANCIENT", type: "ANTONYM (Lawan Kata)", correct: "MODERN", options: ["MODERN", "HISTORIC", "OLD", "CLASSIC"], explanation: "Lawan kata dari 'Ancient' (kuno) adalah 'Modern' (kekinian)." }
    ];
  }

  initMode(modeName) {
    this.currentMode = modeName;
    if (modeName === 'memory') this.initMemoryGame();
    else if (modeName === 'scramble') this.initScrambleRush();
    else if (modeName === 'wordsearch') this.initWordSearch();
    else if (modeName === 'riddle') this.initRiddleGame();
    else if (modeName === 'battle') this.initDuelGame();
  }

  addGameScore(points) {
    if (window.scrabbleGame && typeof window.scrabbleGame.addScore === 'function') {
      window.scrabbleGame.addScore(points);
    }
  }

  /* =========================================================================
   * 1. MEMORY CARD MATCH (KARTU MEMORI KATA & ARTI)
   * ========================================================================= */
  initMemoryGame() {
    const container = document.getElementById('memory-game-content');
    if (!container) return;

    // Pick 6 random vocabularies from dictionary
    const shuffledVocab = [...DESCRIPTIVE_VOCABULARY].sort(() => 0.5 - Math.random()).slice(0, 6);
    
    // Create card pairs (English Word Card & Indonesian Meaning Card)
    let cards = [];
    shuffledVocab.forEach((item, index) => {
      cards.push({ id: index, pairId: index, type: 'word', text: item.word, clue: item.partOfSpeech });
      cards.push({ id: index + 100, pairId: index, type: 'meaning', text: item.translation, clue: 'Arti Bahasa Indonesia' });
    });

    this.memoryCards = cards.sort(() => 0.5 - Math.random());
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.memoryLock = false;
    this.memoryMoves = 0;

    this.renderMemoryUI();
  }

  renderMemoryUI() {
    const container = document.getElementById('memory-game-content');
    if (!container) return;

    container.innerHTML = `
      <div class="minigame-card">
        <div class="minigame-header">
          <div class="minigame-title-group">
            <span class="minigame-icon">🃏</span>
            <div>
              <h3>Kartu Memori: Cocokkan Kosakata & Artinya</h3>
              <p>Balikkan dua kartu dan cari pasangan yang sesuai antara kata bahasa Inggris deskriptif dan artinya.</p>
            </div>
          </div>
          <div class="minigame-stats">
            <div class="stat-pill">Langkah: <strong id="mem-moves-count">${this.memoryMoves}</strong></div>
            <div class="stat-pill">Cocok: <strong id="mem-match-count">${this.matchedPairs}/6</strong></div>
            <button class="btn btn-secondary btn-sm" onclick="window.miniGamesManager.initMemoryGame()">🔄 Acak Ulang</button>
          </div>
        </div>

        <div class="memory-grid">
          ${this.memoryCards.map((card, idx) => `
            <div class="memory-card" id="mem-card-${idx}" onclick="window.miniGamesManager.flipMemoryCard(${idx})">
              <div class="card-inner">
                <div class="card-front">
                  <span class="card-secret-icon">❓</span>
                  <span class="card-hint">Klik Buka</span>
                </div>
                <div class="card-back ${card.type}">
                  <span class="card-type-tag">${card.clue}</span>
                  <strong class="card-word">${card.text}</strong>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  flipMemoryCard(idx) {
    if (this.memoryLock) return;
    const cardEl = document.getElementById(`mem-card-${idx}`);
    if (!cardEl || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    if (window.soundEngine) window.soundEngine.play('pop');

    cardEl.classList.add('flipped');
    this.flippedCards.push({ idx, card: this.memoryCards[idx] });

    if (this.flippedCards.length === 2) {
      this.memoryMoves++;
      const movesEl = document.getElementById('mem-moves-count');
      if (movesEl) movesEl.textContent = this.memoryMoves;

      const [first, second] = this.flippedCards;
      if (first.card.pairId === second.card.pairId) {
        // MATCH!
        this.memoryLock = true;
        setTimeout(() => {
          if (window.soundEngine) window.soundEngine.play('correct');
          if (typeof window.launchCelebrationFireworks === 'function') {
            window.launchCelebrationFireworks(40);
          }
          document.getElementById(`mem-card-${first.idx}`).classList.add('matched');
          document.getElementById(`mem-card-${second.idx}`).classList.add('matched');
          this.matchedPairs++;
          
          const matchEl = document.getElementById('mem-match-count');
          if (matchEl) matchEl.textContent = `${this.matchedPairs}/6`;
          this.addGameScore(15);

          this.flippedCards = [];
          this.memoryLock = false;

          if (this.matchedPairs === 6) {
            setTimeout(() => {
              if (window.soundEngine) window.soundEngine.play('fanfare');
              if (typeof window.launchCelebrationFireworks === 'function') {
                window.launchCelebrationFireworks(90);
              }
              if (typeof window.showCustomAlert === 'function') {
                window.showCustomAlert({
                  title: "MEMORI LUAR BIASA! 🌟",
                  message: `Selamat! Anda berhasil menemukan seluruh 6 pasangan kosakata dalam ${this.memoryMoves} langkah.`,
                  score: 90,
                  scoreLabel: "Bonus Poin Memori",
                  buttonText: "Mainkan Lagi",
                  onConfirm: () => this.initMemoryGame()
                });
              }
            }, 500);
          }
        }, 600);
      } else {
        // NO MATCH
        this.memoryLock = true;
        setTimeout(() => {
          if (window.soundEngine) window.soundEngine.play('wrong');
          document.getElementById(`mem-card-${first.idx}`).classList.remove('flipped');
          document.getElementById(`mem-card-${second.idx}`).classList.remove('flipped');
          this.flippedCards = [];
          this.memoryLock = false;
        }, 1100);
      }
    }
  }

  /* =========================================================================
   * 2. SPEED WORD RUSH (TEBAK CEPAT DARI UBIN ACAK)
   * ========================================================================= */
  initScrambleRush() {
    this.stopRushTimer();
    const container = document.getElementById('scramble-game-content');
    if (!container) return;

    this.rushScore = 0;
    this.rushTimer = 30;
    this.loadNextRushWord();
    this.startRushTimer();
  }

  startRushTimer() {
    this.stopRushTimer();
    this.rushInterval = setInterval(() => {
      // Only count down if rush tab is actively visible and page is focused
      const scrambleView = document.getElementById('product-mode-scramble');
      const isVisible = scrambleView && !scrambleView.classList.contains('hidden') && scrambleView.style.display !== 'none';
      const isProdukActive = document.getElementById('view-produk')?.classList.contains('active-view');
      
      if (!isVisible || !isProdukActive) {
        return; // Paused when user is on another tab/view
      }

      this.rushTimer--;
      const timerEl = document.getElementById('rush-timer-val');
      if (timerEl) {
        timerEl.textContent = this.rushTimer;
        if (this.rushTimer <= 5) timerEl.classList.add('text-danger');
      }

      if (this.rushTimer <= 0) {
        this.stopRushTimer();
        if (window.soundEngine) window.soundEngine.play('wrong');
        if (typeof window.showCustomAlert === 'function') {
          window.showCustomAlert({
            title: "WAKTU HABIS! ⏱️",
            message: `Sesi Word Rush selesai! Anda berhasil mengumpulkan total ${this.rushScore} poin.`,
            score: this.rushScore,
            scoreLabel: "Skor Word Rush",
            buttonText: "Coba Lagi",
            onConfirm: () => this.initScrambleRush()
          });
        }
      }
    }, 1000);
  }

  stopRushTimer() {
    if (this.rushInterval) {
      clearInterval(this.rushInterval);
      this.rushInterval = null;
    }
  }

  pauseRushTimer() {
    this.stopRushTimer();
  }

  resumeRushTimer() {
    if (this.rushTimer > 0 && !this.rushInterval) {
      this.startRushTimer();
    }
  }

  loadNextRushWord() {
    const vocab = DESCRIPTIVE_VOCABULARY[Math.floor(Math.random() * DESCRIPTIVE_VOCABULARY.length)];
    this.currentRushWord = vocab;
    
    // Scramble letters
    let letters = vocab.word.split('');
    while (letters.join('') === vocab.word && letters.length > 2) {
      letters.sort(() => 0.5 - Math.random());
    }
    this.scrambledLetters = letters;
    this.rushUserTiles = [];

    this.renderRushUI();
  }

  renderRushUI() {
    const container = document.getElementById('scramble-game-content');
    if (!container) return;

    container.innerHTML = `
      <div class="minigame-card">
        <div class="minigame-header">
          <div class="minigame-title-group">
            <span class="minigame-icon">⚡</span>
            <div>
              <h3>Word Rush: Susun Ubin Ejaan dengan Cepat</h3>
              <p>Klik ubin huruf acak di bawah untuk menyusun kata deskriptif yang tepat sebelum waktu habis!</p>
            </div>
          </div>
          <div class="minigame-stats">
            <div class="stat-pill timer-pill">Waktu: <strong id="rush-timer-val">${this.rushTimer}</strong>s</div>
            <div class="stat-pill">Skor: <strong id="rush-score-val">${this.rushScore}</strong></div>
          </div>
        </div>

        <div class="rush-clue-box">
          <span class="clue-tag">💡 Petunjuk / Clue:</span>
          <p class="clue-text">"${this.currentRushWord.clue}"</p>
          <span class="clue-meaning">Arti: <strong>${this.currentRushWord.translation}</strong></span>
        </div>

        <!-- Target Slot Box -->
        <div class="rush-target-slots" id="rush-slots">
          ${this.rushUserTiles.map((char, i) => `
            <div class="rush-tile filled animate-pop" onclick="window.miniGamesManager.removeRushTile(${i})">
              <span>${char}</span>
            </div>
          `).join('')}
          ${Array(Math.max(0, this.currentRushWord.word.length - this.rushUserTiles.length)).fill(0).map(() => `
            <div class="rush-tile empty">_</div>
          `).join('')}
        </div>

        <!-- Scrambled Available Tiles -->
        <div class="rush-tiles-bank" id="rush-bank">
          ${this.scrambledLetters.map((char, i) => `
            <button class="scrabble-tile-btn animate-pop" id="rush-letter-${i}" onclick="window.miniGamesManager.pickRushTile('${char}', ${i})">
              <span class="tile-char">${char}</span>
              <span class="tile-pts">${SCRABBLE_LETTER_SCORES[char] || 1}</span>
            </button>
          `).join('')}
        </div>

        <div class="rush-action-row">
          <button class="btn btn-secondary" onclick="window.miniGamesManager.resetRushWord()">↩ Reset Ubin</button>
          <button class="btn btn-primary" onclick="window.miniGamesManager.checkRushWord()">✔ Periksa Jawaban</button>
        </div>
      </div>
    `;
  }

  pickRushTile(char, idx) {
    if (this.rushUserTiles.length >= this.currentRushWord.word.length) return;
    const btn = document.getElementById(`rush-letter-${idx}`);
    if (btn && btn.disabled) return;

    if (window.soundEngine) window.soundEngine.play('pop');
    this.rushUserTiles.push({ char, idx });
    if (btn) btn.disabled = true;

    // Refresh slots
    this.updateRushSlots();

    // Auto check if full
    if (this.rushUserTiles.length === this.currentRushWord.word.length) {
      this.checkRushWord();
    }
  }

  removeRushTile(index) {
    if (!this.rushUserTiles[index]) return;
    const item = this.rushUserTiles.splice(index, 1)[0];
    const btn = document.getElementById(`rush-letter-${item.idx}`);
    if (btn) btn.disabled = false;
    if (window.soundEngine) window.soundEngine.play('pop');
    this.updateRushSlots();
  }

  updateRushSlots() {
    const slotsEl = document.getElementById('rush-slots');
    if (!slotsEl) return;
    slotsEl.innerHTML = `
      ${this.rushUserTiles.map((item, i) => `
        <div class="rush-tile filled animate-pop" onclick="window.miniGamesManager.removeRushTile(${i})">
          <span>${item.char}</span>
        </div>
      `).join('')}
      ${Array(Math.max(0, this.currentRushWord.word.length - this.rushUserTiles.length)).fill(0).map(() => `
        <div class="rush-tile empty">_</div>
      `).join('')}
    `;
  }

  resetRushWord() {
    this.rushUserTiles = [];
    this.scrambledLetters.forEach((_, i) => {
      const btn = document.getElementById(`rush-letter-${i}`);
      if (btn) btn.disabled = false;
    });
    this.updateRushSlots();
  }

  checkRushWord() {
    const wordBuilt = this.rushUserTiles.map(t => t.char).join('');
    if (wordBuilt === this.currentRushWord.word) {
      if (window.soundEngine) window.soundEngine.play('correct');
      if (typeof window.launchCelebrationFireworks === 'function') {
        window.launchCelebrationFireworks(45);
      }
      this.rushScore += 20;
      this.addGameScore(20);
      this.rushTimer = Math.min(45, this.rushTimer + 5); // Bonus time

      // Voice English Word
      if (window.soundEngine && typeof window.soundEngine.speak === 'function') {
        window.soundEngine.speak(this.currentRushWord.word);
      }

      this.loadNextRushWord();
    } else {
      if (window.soundEngine) window.soundEngine.play('wrong');
      const slotsEl = document.getElementById('rush-slots');
      if (slotsEl) {
        slotsEl.classList.add('animate-shake');
        setTimeout(() => slotsEl.classList.remove('animate-shake'), 400);
      }
    }
  }

  /* =========================================================================
   * 3. WORD SEARCH PUZZLE (CARI KATA DALAM KISI HURUF)
   * ========================================================================= */
  initWordSearch() {
    const container = document.getElementById('wordsearch-game-content');
    if (!container) return;

    // Pick 4 words
    const sampleWords = ["KIND", "BRAVE", "SMART", "BEAUTIFUL", "ANCIENT", "CLEAN", "SWEET", "TALL"];
    const targetWords = sampleWords.sort(() => 0.5 - Math.random()).slice(0, 4);

    this.wsWords = targetWords;
    this.wsFound = [];
    this.wsSelectedCells = [];
    this.wsGridSize = 10;
    
    // Create empty 10x10
    const size = this.wsGridSize;
    let grid = Array(size).fill(null).map(() => Array(size).fill(''));

    // Place words horizontally or vertically and track coordinates
    this.wsWordLocations = {}; // Map word -> [{r, c}]

    targetWords.forEach(w => {
      let placed = false;
      let tries = 0;
      while (!placed && tries < 50) {
        tries++;
        const isHorizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * (isHorizontal ? size : size - w.length));
        const col = Math.floor(Math.random() * (isHorizontal ? size - w.length : size));

        let fits = true;
        for (let i = 0; i < w.length; i++) {
          const r = isHorizontal ? row : row + i;
          const c = isHorizontal ? col + i : col;
          if (grid[r][c] !== '' && grid[r][c] !== w[i]) {
            fits = false;
            break;
          }
        }

        if (fits) {
          const locs = [];
          for (let i = 0; i < w.length; i++) {
            const r = isHorizontal ? row : row + i;
            const c = isHorizontal ? col + i : col;
            grid[r][c] = w[i];
            locs.push({ r, c });
          }
          this.wsWordLocations[w] = locs;
          placed = true;
        }
      }
    });

    // Fill remaining with random letters
    const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c]) {
          grid[r][c] = alphabets[Math.floor(Math.random() * alphabets.length)];
        }
      }
    }

    this.wsGrid = grid;
    this.renderWordSearchUI();
  }

  renderWordSearchUI() {
    const container = document.getElementById('wordsearch-game-content');
    if (!container) return;

    container.innerHTML = `
      <div class="minigame-card">
        <div class="minigame-header">
          <div class="minigame-title-group">
            <span class="minigame-icon">🔍</span>
            <div>
              <h3>Word Search Puzzle: Temukan Kata Tersembunyi</h3>
              <p>Cari kata-kata sifat deskriptif tersembunyi pada kisi huruf dengan mengklik ubin satu per satu.</p>
            </div>
          </div>
          <div class="minigame-stats">
            <div class="stat-pill">Ditemukan: <strong id="ws-found-count">${this.wsFound.length}/${this.wsWords.length}</strong></div>
            <button class="btn btn-secondary btn-sm" onclick="window.miniGamesManager.initWordSearch()">🔄 Grid Baru</button>
          </div>
        </div>

        <div class="wordsearch-layout">
          <!-- Letter Grid -->
          <div class="ws-grid-container" style="--size: ${this.wsGridSize};">
            ${this.wsGrid.map((row, r) => row.map((char, c) => `
              <button class="ws-cell" id="ws-cell-${r}-${c}" onclick="window.miniGamesManager.clickWSCell(${r}, ${c})">
                ${char}
              </button>
            `).join('')).join('')}
          </div>

          <!-- Word List Targets -->
          <div class="ws-targets-panel">
            <h4>Daftar Kata yang Dicari:</h4>
            <div class="ws-targets-list">
              ${this.wsWords.map((w, colorIdx) => `
                <div class="ws-target-item color-${colorIdx % 4} ${this.wsFound.includes(w) ? 'found' : ''}" id="ws-target-${w}">
                  <span class="target-check">${this.wsFound.includes(w) ? '✔' : '⚪'}</span>
                  <strong>${w}</strong>
                </div>
              `).join('')}
            </div>
            <div class="ws-current-word-bar">
              <span>Pilihan Anda:</span>
              <strong id="ws-current-selection">-</strong>
            </div>
            <button class="btn btn-outline btn-sm mt-2" onclick="window.miniGamesManager.clearWSSelection()">Hapus Pilihan</button>
          </div>
        </div>
      </div>
    `;
  }

  clickWSCell(r, c) {
    const cellId = `ws-cell-${r}-${c}`;
    const cellEl = document.getElementById(cellId);
    if (!cellEl) return;

    if (window.soundEngine) window.soundEngine.play('pop');

    // Toggle or add
    const existsIndex = this.wsSelectedCells.findIndex(item => item.r === r && item.c === c);
    if (existsIndex !== -1) {
      this.wsSelectedCells.splice(existsIndex, 1);
      cellEl.classList.remove('selected');
    } else {
      this.wsSelectedCells.push({ r, c, char: this.wsGrid[r][c] });
      cellEl.classList.add('selected');
    }

    const currentWord = this.wsSelectedCells.map(c => c.char).join('');
    const curEl = document.getElementById('ws-current-selection');
    if (curEl) curEl.textContent = currentWord || '-';

    // Check if matched
    if (this.wsWords.includes(currentWord) && !this.wsFound.includes(currentWord)) {
      if (window.soundEngine) window.soundEngine.play('correct');
      if (typeof window.launchCelebrationFireworks === 'function') {
        window.launchCelebrationFireworks(45);
      }
      const wordColorIndex = this.wsWords.indexOf(currentWord);
      this.wsFound.push(currentWord);
      this.addGameScore(25);

      // Lock matched cells with colorful highlight
      this.wsSelectedCells.forEach(item => {
        const el = document.getElementById(`ws-cell-${item.r}-${item.c}`);
        if (el) {
          el.classList.remove('selected');
          el.classList.add('permanently-found', `color-${wordColorIndex % 4}`);
        }
      });
      this.wsSelectedCells = [];
      if (curEl) curEl.textContent = '-';

      const targetEl = document.getElementById(`ws-target-${currentWord}`);
      if (targetEl) targetEl.classList.add('found');

      const countEl = document.getElementById('ws-found-count');
      if (countEl) countEl.textContent = `${this.wsFound.length}/${this.wsWords.length}`;

      if (this.wsFound.length === this.wsWords.length) {
        setTimeout(() => {
          if (window.soundEngine) window.soundEngine.play('fanfare');
          if (typeof window.launchCelebrationFireworks === 'function') {
            window.launchCelebrationFireworks(95);
          }
          if (typeof window.showCustomAlert === 'function') {
            window.showCustomAlert({
              title: "SEMUA KATA DITEMUKAN! 🎉",
              message: "Luar biasa! Ketelitian Anda dalam menemukan semua kata deskriptif tersembunyi sangat hebat.",
              score: 100,
              scoreLabel: "Skor Sempurna",
              buttonText: "Mulai Teka-Teki Baru",
              onConfirm: () => this.initWordSearch()
            });
          }
        }, 500);
      }
    }
  }

  clearWSSelection() {
    this.wsSelectedCells.forEach(item => {
      const el = document.getElementById(`ws-cell-${item.r}-${item.c}`);
      if (el && !el.classList.contains('permanently-found')) {
        el.classList.remove('selected');
      }
    });
    this.wsSelectedCells = [];
    const curEl = document.getElementById('ws-current-selection');
    if (curEl) curEl.textContent = '-';
  }

  /* =========================================================================
   * 4. MYSTERY RIDDLE (TEBAK SIAPAKAH AKU)
   * ========================================================================= */
  initRiddleGame() {
    this.riddleIndex = 0;
    this.riddleScore = 0;
    this.renderRiddleUI();
  }

  renderRiddleUI() {
    const container = document.getElementById('riddle-game-content');
    if (!container) return;

    const current = this.riddlesList[this.riddleIndex];

    container.innerHTML = `
      <div class="minigame-card">
        <div class="minigame-header">
          <div class="minigame-title-group">
            <span class="minigame-icon">❓</span>
            <div>
              <h3>Tebak Deskripsi: Siapakah Aku? (Mystery Riddle)</h3>
              <p>Baca ciri-ciri deskriptif objek di bawah dan tentukan nama benda/hewan/tempat yang tepat!</p>
            </div>
          </div>
          <div class="minigame-stats">
            <div class="stat-pill">Soal: <strong>${this.riddleIndex + 1}/${this.riddlesList.length}</strong></div>
            <div class="stat-pill">Skor: <strong>${this.riddleScore}</strong></div>
          </div>
        </div>

        <div class="riddle-card-body">
          <div class="riddle-category-pill">Kategori Objek: <strong>${current.category}</strong></div>
          <div class="riddle-quote-box">
            <span class="quote-icon">“</span>
            <p class="riddle-quote-text">${current.riddle}</p>
          </div>
          <div class="riddle-hint-box">
            💡 <strong>Clue:</strong> ${current.clue}
          </div>

          <div class="riddle-options-grid">
            ${current.options.map(opt => `
              <button class="riddle-opt-btn" onclick="window.miniGamesManager.answerRiddle('${opt}')">
                <span>🔤 ${opt}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  answerRiddle(selected) {
    const current = this.riddlesList[this.riddleIndex];
    if (selected === current.target) {
      if (window.soundEngine) window.soundEngine.play('correct');
      if (typeof window.launchCelebrationFireworks === 'function') {
        window.launchCelebrationFireworks(45);
      }
      this.riddleScore += 20;
      this.addGameScore(20);

      if (window.soundEngine && typeof window.soundEngine.speak === 'function') {
        window.soundEngine.speak(current.target);
      }

      this.riddleIndex++;
      if (this.riddleIndex < this.riddlesList.length) {
        setTimeout(() => this.renderRiddleUI(), 600);
      } else {
        setTimeout(() => {
          if (window.soundEngine) window.soundEngine.play('fanfare');
          if (typeof window.launchCelebrationFireworks === 'function') {
            window.launchCelebrationFireworks(90);
          }
          if (typeof window.showCustomAlert === 'function') {
            window.showCustomAlert({
              title: "DETEKTIF KATA SEJATI! 🕵️",
              message: `Hebat sekali! Anda berhasil memecahkan seluruh teka-teki deskriptif dengan total skor ${this.riddleScore}.`,
              score: this.riddleScore,
              scoreLabel: "Total Poin Riddle",
              buttonText: "Ulangi Teka-Teki",
              onConfirm: () => this.initRiddleGame()
            });
          }
        }, 500);
      }
    } else {
      if (window.soundEngine) window.soundEngine.play('wrong');
      if (typeof window.showCustomAlert === 'function') {
        window.showCustomAlert({
          title: "HAMPIR BENAR! 💭",
          message: `Jawaban "${selected}" belum tepat. Perhatikan kembali petunjuk sifat dan ciri objeknya.`,
          type: "error",
          buttonText: "Coba Lagi"
        });
      }
    }
  }

  /* =========================================================================
   * 5. VOCABULARY DUEL (SINONIM VS ANTONIM)
   * ========================================================================= */
  initDuelGame() {
    this.duelIndex = 0;
    this.duelScore = 0;
    this.renderDuelUI();
  }

  renderDuelUI() {
    const container = document.getElementById('battle-game-content');
    if (!container) return;

    const current = this.duelQuestions[this.duelIndex];

    container.innerHTML = `
      <div class="minigame-card">
        <div class="minigame-header">
          <div class="minigame-title-group">
            <span class="minigame-icon">⚔️</span>
            <div>
              <h3>Duel Kosakata: Tantangan Sinonim & Antonim</h3>
              <p>Perkaya variasi kata sifat dengan menemukan persamaan kata (*Synonym*) atau lawan kata (*Antonym*) yang tepat.</p>
            </div>
          </div>
          <div class="minigame-stats">
            <div class="stat-pill">Level: <strong>${this.duelIndex + 1}/${this.duelQuestions.length}</strong></div>
            <div class="stat-pill">Skor Duel: <strong>${this.duelScore}</strong></div>
          </div>
        </div>

        <div class="duel-arena-card">
          <div class="duel-target-bubble">
            <span class="duel-mission-tag">${current.type}</span>
            <h2 class="duel-word-display">${current.word}</h2>
          </div>

          <div class="duel-options-grid">
            ${current.options.map(opt => `
              <button class="duel-opt-btn" onclick="window.miniGamesManager.answerDuel('${opt}')">
                <strong>${opt}</strong>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  answerDuel(selected) {
    const current = this.duelQuestions[this.duelIndex];
    if (selected === current.correct) {
      if (window.soundEngine) window.soundEngine.play('correct');
      if (typeof window.launchCelebrationFireworks === 'function') {
        window.launchCelebrationFireworks(45);
      }
      this.duelScore += 20;
      this.addGameScore(20);

      this.duelIndex++;
      if (this.duelIndex < this.duelQuestions.length) {
        setTimeout(() => this.renderDuelUI(), 600);
      } else {
        setTimeout(() => {
          if (window.soundEngine) window.soundEngine.play('fanfare');
          if (typeof window.launchCelebrationFireworks === 'function') {
            window.launchCelebrationFireworks(90);
          }
          if (typeof window.showCustomAlert === 'function') {
            window.showCustomAlert({
              title: "JUARA DUEL KOSAKATA! 🏆",
              message: `Luar biasa! Pemahaman sinonim dan antonim kata deskriptif Anda sangat tajam dengan skor ${this.duelScore}!`,
              score: this.duelScore,
              scoreLabel: "Skor Duel",
              buttonText: "Mainkan Lagi",
              onConfirm: () => this.initDuelGame()
            });
          }
        }, 500);
      }
    } else {
      if (window.soundEngine) window.soundEngine.play('wrong');
      if (typeof window.showCustomAlert === 'function') {
        window.showCustomAlert({
          title: "BELUM TEPAT! ⚡",
          message: `${current.explanation}`,
          type: "error",
          buttonText: "Coba Lagi"
        });
      }
    }
  }
}

// Global Instance
window.miniGamesManager = new MiniGamesManager();
