/**
 * Interactive Scrabble Game Engine
 * Mode A: Descriptive Challenge (Level-based Clues)
 * Mode B: Classic 15x15 Scrabble Board with Multipliers
 * Mode C: Sentence Builder (Simple Present Tense Descriptive Sentences)
 */

class ScrabbleGame {
  constructor() {
    this.currentMode = 'challenge'; // 'challenge' | 'classic' | 'sentence'
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('scrabble_highscore') || '0', 10);
    this.streak = 0;
    this.discoveredWords = [];

    // Challenge Mode State
    this.challengeCategory = 'all';
    this.challengeIndex = 0;
    this.challengeFilteredList = [];
    this.currentChallengeWord = null;
    this.challengePlacedTiles = [];
    this.challengeRackTiles = [];

    // Classic Board State
    this.boardSize = 15;
    this.board = Array(15).fill(null).map(() => Array(15).fill(null));
    this.playerRack = [];
    this.tileBag = [];
    this.selectedRackTileIndex = null;
    this.currentTurnPlacedCells = []; // [{r, c, letter, rackIdx}]

    // Sentence Builder State
    this.sentenceTemplates = [
      {
        pattern: ["My friend", "[To Be / Has]", "[Adjective]", "and", "[Adjective]"],
        slots: [1, 2, 4],
        types: ["verb", "people", "people"],
        example: "My friend is smart and kind."
      },
      {
        pattern: ["The lion", "[To Be / Has]", "a", "[Adjective]", "tail and", "[Adjective]", "claws."],
        slots: [1, 3, 5],
        types: ["verb", "animals", "animals"],
        example: "The lion has a furry tail and sharp claws."
      },
      {
        pattern: ["The school library", "[To Be / Has]", "[Adjective]", "and", "[Adjective]"],
        slots: [1, 2, 4],
        types: ["verb", "places", "places"],
        example: "The school library is clean and spacious."
      },
      {
        pattern: ["This watch", "[To Be / Has]", "made of", "[Adjective]", "metal and is very", "[Adjective]"],
        slots: [1, 3, 5],
        types: ["verb", "things", "things"],
        example: "This watch is made of shiny metal and is very light."
      }
    ];
    this.currentSentenceIdx = 0;
    this.sentenceUserSlots = {};

    this.initBoardLayout();
  }

  // Define Standard 15x15 Scrabble Multipliers
  initBoardLayout() {
    this.specialTiles = {};

    // Triple Word (TW)
    const tw = [
      [0, 0], [0, 7], [0, 14],
      [7, 0], [7, 14],
      [14, 0], [14, 7], [14, 14]
    ];
    tw.forEach(([r, c]) => { this.specialTiles[`${r},${c}`] = { type: 'TW', label: '3W', text: 'Triple Word' }; });

    // Double Word (DW)
    const dw = [
      [1, 1], [2, 2], [3, 3], [4, 4],
      [1, 13], [2, 12], [3, 11], [4, 10],
      [13, 1], [12, 2], [11, 3], [10, 4],
      [13, 13], [12, 12], [11, 11], [10, 10]
    ];
    dw.forEach(([r, c]) => { this.specialTiles[`${r},${c}`] = { type: 'DW', label: '2W', text: 'Double Word' }; });

    // Center Star (Double Word)
    this.specialTiles['7,7'] = { type: 'STAR', label: '★', text: 'Start (2W)' };

    // Triple Letter (TL)
    const tl = [
      [1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13],
      [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9]
    ];
    tl.forEach(([r, c]) => { this.specialTiles[`${r},${c}`] = { type: 'TL', label: '3L', text: 'Triple Letter' }; });

    // Double Letter (DL)
    const dl = [
      [0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7], [3, 14],
      [6, 2], [6, 6], [6, 8], [6, 12], [7, 3], [7, 11],
      [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], [11, 7], [11, 14],
      [12, 6], [12, 8], [14, 3], [14, 11]
    ];
    dl.forEach(([r, c]) => { this.specialTiles[`${r},${c}`] = { type: 'DL', label: '2L', text: 'Double Letter' }; });
  }

  /* =========================================================================
   * CHALLENGE MODE METHODS
   * ========================================================================= */
  initChallengeMode(category = 'all') {
    this.challengeCategory = category;
    if (category === 'all') {
      this.challengeFilteredList = [...DESCRIPTIVE_VOCABULARY];
    } else {
      this.challengeFilteredList = DESCRIPTIVE_VOCABULARY.filter(item => item.category === category);
    }
    // Shuffle the items for variety
    this.challengeFilteredList.sort(() => Math.random() - 0.5);
    this.challengeIndex = 0;
    this.loadCurrentChallenge();
  }

  loadCurrentChallenge() {
    if (this.challengeFilteredList.length === 0) return;
    if (this.challengeIndex >= this.challengeFilteredList.length) {
      this.challengeIndex = 0; // Loop or finish
    }

    this.currentChallengeWord = this.challengeFilteredList[this.challengeIndex];
    const targetWord = this.currentChallengeWord.word.toUpperCase();
    
    // Create rack containing required letters + 2-3 distractor letters
    const letters = targetWord.split('');
    const extraAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const distractorCount = Math.min(3, 8 - letters.length);
    for (let i = 0; i < distractorCount; i++) {
      const randChar = extraAlphabet[Math.floor(Math.random() * extraAlphabet.length)];
      letters.push(randChar);
    }

    // Shuffle letters for the rack
    this.challengeRackTiles = letters.sort(() => Math.random() - 0.5).map((char, idx) => ({
      id: `ch-rack-${idx}`,
      letter: char,
      score: SCRABBLE_LETTER_SCORES[char] || 1,
      used: false
    }));

    this.challengePlacedTiles = Array(targetWord.length).fill(null);
    this.renderChallengeUI();
  }

  renderChallengeUI() {
    const clueContainer = document.getElementById('challenge-clue-box');
    const slotsContainer = document.getElementById('challenge-slots-box');
    const rackContainer = document.getElementById('challenge-rack-box');
    const progressEl = document.getElementById('challenge-progress-text');
    const feedbackBox = document.getElementById('challenge-feedback-box');

    if (!clueContainer || !this.currentChallengeWord) return;

    if (progressEl) {
      progressEl.textContent = `Challenge ${this.challengeIndex + 1} of ${this.challengeFilteredList.length}`;
    }

    if (feedbackBox) {
      feedbackBox.className = 'feedback-box hidden';
      feedbackBox.innerHTML = '';
    }

    // Clue & Category Badge
    const categoryIcons = {
      people: '👤 Describing People',
      animals: '🐾 Describing Animals',
      places: '🏛️ Describing Places',
      things: '📦 Describing Objects'
    };

    clueContainer.innerHTML = `
      <div class="clue-header">
        <span class="badge badge-${this.currentChallengeWord.category}">${categoryIcons[this.currentChallengeWord.category] || 'Vocabulary'}</span>
        <span class="badge badge-pos">${this.currentChallengeWord.partOfSpeech}</span>
        <button class="btn-icon" id="btn-audio-clue" title="Listen to Clue" onclick="window.soundEngine.speak('${this.currentChallengeWord.clue.replace(/'/g, "\\'")}')">
          🔊 Clue Audio
        </button>
      </div>
      <p class="clue-text">"${this.currentChallengeWord.clue}"</p>
      <div class="clue-subtext">Arti: <em>${this.currentChallengeWord.translation}</em> (${this.currentChallengeWord.word.length} Letters)</div>
    `;

    // Word Slots
    slotsContainer.innerHTML = '';
    this.challengePlacedTiles.forEach((tile, slotIdx) => {
      const slotEl = document.createElement('div');
      slotEl.className = `challenge-slot ${tile ? 'filled' : 'empty'}`;
      slotEl.dataset.slotIdx = slotIdx;

      if (tile) {
        slotEl.innerHTML = `
          <div class="scrabble-tile animate-pop" onclick="window.scrabbleGame.removeChallengeTile(${slotIdx})">
            <span class="tile-letter">${tile.letter}</span>
            <span class="tile-score">${tile.score}</span>
          </div>
        `;
      } else {
        slotEl.innerHTML = `<span class="slot-number">${slotIdx + 1}</span>`;
        slotEl.onclick = () => {
          // Auto-fill from selected rack or first available
          const firstAvailable = this.challengeRackTiles.find(t => !t.used);
          if (firstAvailable) {
            window.scrabbleGame.placeChallengeTile(firstAvailable.id, slotIdx);
          }
        };
      }
      slotsContainer.appendChild(slotEl);
    });

    // Rack Tiles
    rackContainer.innerHTML = '';
    this.challengeRackTiles.forEach((tile) => {
      const tileEl = document.createElement('button');
      tileEl.className = `scrabble-tile rack-tile ${tile.used ? 'tile-used' : ''}`;
      tileEl.dataset.tileId = tile.id;
      tileEl.innerHTML = `
        <span class="tile-letter">${tile.letter}</span>
        <span class="tile-score">${tile.score}</span>
      `;
      tileEl.disabled = tile.used;
      tileEl.onclick = () => {
        // Find first empty slot
        const emptySlotIdx = this.challengePlacedTiles.findIndex(s => s === null);
        if (emptySlotIdx !== -1) {
          window.scrabbleGame.placeChallengeTile(tile.id, emptySlotIdx);
        }
      };
      rackContainer.appendChild(tileEl);
    });

    this.updateScoreDisplay();
  }

  placeChallengeTile(tileId, slotIdx) {
    const tile = this.challengeRackTiles.find(t => t.id === tileId);
    if (!tile || tile.used) return;

    if (this.challengePlacedTiles[slotIdx] !== null) {
      // Return currently placed tile to rack first
      const prevTile = this.challengePlacedTiles[slotIdx];
      prevTile.used = false;
    }

    tile.used = true;
    this.challengePlacedTiles[slotIdx] = tile;
    window.soundEngine.playTileClick();
    this.renderChallengeUI();

    // If all slots are filled, automatically check answer
    if (this.challengePlacedTiles.every(t => t !== null)) {
      this.checkChallengeAnswer();
    }
  }

  removeChallengeTile(slotIdx) {
    const tile = this.challengePlacedTiles[slotIdx];
    if (!tile) return;

    tile.used = false;
    this.challengePlacedTiles[slotIdx] = null;
    window.soundEngine.playTileClick();
    this.renderChallengeUI();
  }

  clearChallengeSlots() {
    this.challengePlacedTiles.forEach(tile => {
      if (tile) tile.used = false;
    });
    this.challengePlacedTiles = Array(this.currentChallengeWord.word.length).fill(null);
    window.soundEngine.playTileClick();
    this.renderChallengeUI();
  }

  shuffleChallengeRack() {
    this.challengeRackTiles.sort(() => Math.random() - 0.5);
    window.soundEngine.playTileClick();
    this.renderChallengeUI();
  }

  checkChallengeAnswer() {
    const formedWord = this.challengePlacedTiles.map(t => t ? t.letter : '').join('').toUpperCase();
    const targetWord = this.currentChallengeWord.word.toUpperCase();
    const feedbackBox = document.getElementById('challenge-feedback-box');

    if (formedWord === targetWord) {
      // Correct!
      const wordScore = calculateWordBaseScore(targetWord);
      const streakBonus = this.streak * 5;
      const totalWordPoints = wordScore + streakBonus;

      this.score += totalWordPoints;
      this.streak += 1;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('scrabble_highscore', this.highScore);
      }

      window.soundEngine.playWordSuccess();

      // Record to discovered list
      if (!this.discoveredWords.find(w => w.word === targetWord)) {
        this.discoveredWords.unshift(this.currentChallengeWord);
        this.renderDiscoveredWords();
      }

      if (feedbackBox) {
        feedbackBox.className = 'feedback-box feedback-success animate-fade-in';
        feedbackBox.innerHTML = `
          <div class="feedback-header">
            <h4>🎉 EXCELLENT! Word Solved: <span class="highlight-word">${targetWord}</span></h4>
            <span class="earned-points">+${totalWordPoints} Pts (${wordScore} base + ${streakBonus} streak bonus)</span>
          </div>
          <div class="feedback-body">
            <p><strong>Arti:</strong> ${this.currentChallengeWord.translation}</p>
            <p><strong>Definition:</strong> ${this.currentChallengeWord.definition}</p>
            <p><strong>Descriptive Sentence:</strong> "${this.currentChallengeWord.example}"</p>
          </div>
          <div class="feedback-actions">
            <button class="btn btn-primary" onclick="window.soundEngine.speak('${targetWord}. ${this.currentChallengeWord.example.replace(/'/g, "\\'")}')">
              🔊 Pronounce Sentence
            </button>
            <button class="btn btn-accent" onclick="window.scrabbleGame.nextChallenge()">
              Next Word ➔
            </button>
          </div>
        `;
      }
    } else {
      // Incorrect
      this.streak = 0;
      window.soundEngine.playErrorSound();

      if (feedbackBox) {
        feedbackBox.className = 'feedback-box feedback-error animate-fade-in';
        feedbackBox.innerHTML = `
          <div class="feedback-header">
            <h4>❌ Not quite right!</h4>
          </div>
          <p>You formed: <strong>${formedWord}</strong>. Check the clue again and rearrange the letter tiles!</p>
          <div class="feedback-actions">
            <button class="btn btn-secondary" onclick="window.scrabbleGame.giveHint()">💡 Give a Hint</button>
            <button class="btn btn-outline" onclick="window.scrabbleGame.clearChallengeSlots()">Reset Tiles</button>
          </div>
        `;
      }
    }

    this.updateScoreDisplay();
  }

  giveHint() {
    const targetWord = this.currentChallengeWord.word.toUpperCase();
    // Reveal the first incorrect or empty slot
    for (let i = 0; i < targetWord.length; i++) {
      const correctChar = targetWord[i];
      const currentTile = this.challengePlacedTiles[i];
      if (!currentTile || currentTile.letter !== correctChar) {
        // Free this slot if filled with wrong tile
        if (currentTile) currentTile.used = false;

        // Find available tile with this character
        let matchingRackTile = this.challengeRackTiles.find(t => !t.used && t.letter === correctChar);
        if (!matchingRackTile) {
          // If already placed in wrong slot, pull it out
          const misplacedSlot = this.challengePlacedTiles.findIndex(t => t && t.letter === correctChar);
          if (misplacedSlot !== -1) {
            matchingRackTile = this.challengePlacedTiles[misplacedSlot];
            this.challengePlacedTiles[misplacedSlot] = null;
          }
        }

        if (matchingRackTile) {
          matchingRackTile.used = true;
          this.challengePlacedTiles[i] = matchingRackTile;
          window.soundEngine.playTileClick();
          this.renderChallengeUI();
          break;
        }
      }
    }
  }

  nextChallenge() {
    this.challengeIndex++;
    this.loadCurrentChallenge();
  }

  /* =========================================================================
   * CLASSIC 15x15 SCRABBLE BOARD METHODS
   * ========================================================================= */
  initClassicMode() {
    this.initTileBag();
    this.board = Array(15).fill(null).map(() => Array(15).fill(null));
    this.playerRack = [];
    this.currentTurnPlacedCells = [];
    this.refillPlayerRack();

    // Place a starter descriptive word on the center star
    this.placeStarterWord("DESCRIPTIVE", 7, 2, "H");

    this.renderClassicBoard();
    this.renderClassicRack();
  }

  initTileBag() {
    this.tileBag = [...SCRABBLE_LETTER_DISTRIBUTION].sort(() => Math.random() - 0.5);
  }

  drawTile() {
    if (this.tileBag.length === 0) {
      this.initTileBag();
    }
    return this.tileBag.pop();
  }

  refillPlayerRack() {
    while (this.playerRack.length < 7 && this.tileBag.length > 0) {
      const letter = this.drawTile();
      this.playerRack.push({
        letter: letter,
        score: SCRABBLE_LETTER_SCORES[letter] || 1
      });
    }
  }

  placeStarterWord(word, startRow, startCol, direction = 'H') {
    for (let i = 0; i < word.length; i++) {
      const r = direction === 'H' ? startRow : startRow + i;
      const c = direction === 'H' ? startCol + i : startCol;
      const letter = word[i].toUpperCase();
      this.board[r][c] = {
        letter: letter,
        score: SCRABBLE_LETTER_SCORES[letter] || 1,
        fixed: true
      };
    }
  }

  renderClassicBoard() {
    const boardContainer = document.getElementById('classic-board-grid');
    if (!boardContainer) return;

    boardContainer.innerHTML = '';
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        const cellKey = `${r},${c}`;
        const cellData = this.board[r][c];
        const special = this.specialTiles[cellKey];

        const cellEl = document.createElement('div');
        cellEl.className = 'board-cell';
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;

        if (special) {
          cellEl.classList.add(`cell-${special.type.toLowerCase()}`);
          if (!cellData) {
            cellEl.innerHTML = `<span class="multiplier-label">${special.label}</span>`;
            cellEl.title = special.text;
          }
        }

        if (cellData) {
          cellEl.classList.add('has-tile');
          const isTurnPlaced = this.currentTurnPlacedCells.some(cell => cell.r === r && cell.col === c);
          cellEl.innerHTML = `
            <div class="scrabble-tile ${isTurnPlaced ? 'tile-turn-placed' : 'tile-locked'}">
              <span class="tile-letter">${cellData.letter}</span>
              <span class="tile-score">${cellData.score}</span>
            </div>
          `;
          if (isTurnPlaced) {
            cellEl.title = 'Klik untuk membatalkan dan menarik huruf ini kembali ke rak';
            cellEl.onclick = () => window.scrabbleGame.recallCellTile(r, c);
          }
        } else {
          cellEl.onclick = () => window.scrabbleGame.onBoardCellClick(r, c);
        }

        boardContainer.appendChild(cellEl);
      }
    }
    this.updateTurnLivePreview();
  }

  renderClassicRack() {
    const rackContainer = document.getElementById('classic-rack-grid');
    if (!rackContainer) return;

    rackContainer.innerHTML = '';
    this.playerRack.forEach((tile, idx) => {
      const tileBtn = document.createElement('button');
      tileBtn.className = `scrabble-tile rack-tile ${this.selectedRackTileIndex === idx ? 'tile-selected' : ''}`;
      tileBtn.dataset.rackIdx = idx;
      tileBtn.title = 'Klik untuk memilih huruf ini';
      tileBtn.innerHTML = `
        <span class="tile-letter">${tile.letter}</span>
        <span class="tile-score">${tile.score}</span>
      `;
      tileBtn.onclick = () => {
        if (window.scrabbleGame.selectedRackTileIndex === idx) {
          window.scrabbleGame.selectedRackTileIndex = null;
        } else {
          window.scrabbleGame.selectedRackTileIndex = idx;
          window.soundEngine.playTileClick();
        }
        window.scrabbleGame.renderClassicRack();
        window.scrabbleGame.updateTurnLivePreview();
      };
      rackContainer.appendChild(tileBtn);
    });

    const bagCountEl = document.getElementById('tile-bag-count');
    if (bagCountEl) bagCountEl.textContent = `Bag: ${this.tileBag.length} tiles`;

    this.updateTurnLivePreview();
  }

  onBoardCellClick(r, c) {
    if (this.selectedRackTileIndex === null) {
      const feedbackEl = document.getElementById('classic-move-feedback');
      if (feedbackEl) {
        feedbackEl.className = 'feedback-box feedback-error animate-fade-in';
        feedbackEl.innerHTML = '💡 <strong>Tips:</strong> Klik salah satu huruf di rak bawah terlebih dahulu, lalu klik kotak papan ini untuk meletakkannya!';
      }
      return;
    }

    if (this.board[r][c] !== null) return;

    const tile = this.playerRack[this.selectedRackTileIndex];
    if (!tile) return;

    // Place on board
    this.board[r][c] = {
      letter: tile.letter,
      score: tile.score,
      fixed: false
    };

    this.currentTurnPlacedCells.push({
      r: r,
      col: c,
      letter: tile.letter,
      rackIdx: this.selectedRackTileIndex,
      originalTile: tile
    });

    // Remove from rack
    this.playerRack.splice(this.selectedRackTileIndex, 1);
    this.selectedRackTileIndex = null;

    // Close any error feedback
    const feedbackEl = document.getElementById('classic-move-feedback');
    if (feedbackEl && feedbackEl.classList.contains('feedback-error')) {
      feedbackEl.className = 'feedback-box hidden';
    }

    window.soundEngine.playTileClick();
    this.renderClassicBoard();
    this.renderClassicRack();
  }

  recallCellTile(r, c) {
    const placedIdx = this.currentTurnPlacedCells.findIndex(cell => cell.r === r && cell.col === c);
    if (placedIdx === -1) return;

    const placed = this.currentTurnPlacedCells[placedIdx];
    this.board[r][c] = null;
    this.playerRack.push(placed.originalTile);
    this.currentTurnPlacedCells.splice(placedIdx, 1);

    window.soundEngine.playTileClick();
    this.renderClassicBoard();
    this.renderClassicRack();
  }

  recallAllTurnTiles() {
    this.currentTurnPlacedCells.forEach(placed => {
      this.board[placed.r][placed.col] = null;
      this.playerRack.push(placed.originalTile);
    });
    this.currentTurnPlacedCells = [];
    this.selectedRackTileIndex = null;
    window.soundEngine.playTileClick();
    this.renderClassicBoard();
    this.renderClassicRack();
  }

  shuffleRack() {
    this.playerRack.sort(() => Math.random() - 0.5);
    window.soundEngine.playTileClick();
    this.renderClassicRack();
  }

  swapRackTiles() {
    if (this.playerRack.length === 0) return;
    this.recallAllTurnTiles();

    // Return to bag and draw fresh
    while (this.playerRack.length > 0) {
      this.tileBag.unshift(this.playerRack.pop().letter);
    }
    this.tileBag.sort(() => Math.random() - 0.5);
    this.refillPlayerRack();
    window.soundEngine.playTileClick();
    this.renderClassicRack();
  }

  updateTurnLivePreview() {
    const previewWordEl = document.getElementById('current-word-preview');
    const previewScoreEl = document.getElementById('current-score-preview');
    const instructionEl = document.getElementById('turn-instruction-text');

    if (!previewWordEl || !previewScoreEl || !instructionEl) return;

    const placed = this.currentTurnPlacedCells;
    if (placed.length === 0) {
      if (this.selectedRackTileIndex !== null && this.playerRack[this.selectedRackTileIndex]) {
        const char = this.playerRack[this.selectedRackTileIndex].letter;
        instructionEl.innerHTML = `🎯 <strong>Huruf Terpilih: [${char}]</strong>. Sekarang klik kotak kosong di papan yang tersambung dengan kata yang ada!`;
      } else {
        instructionEl.innerHTML = `🎯 <strong>Giliran Anda:</strong> Klik huruf di rak di bawah, lalu klik kotak papan untuk meletakkannya.`;
      }
      previewWordEl.textContent = '— (Belum ada huruf)';
      previewScoreEl.textContent = 'Estimasi: 0 Pts';
      return;
    }

    instructionEl.innerHTML = `✨ <strong>${placed.length} Huruf ditaruh.</strong> Klik huruf di papan untuk menariknya kembali, atau tekan <strong>Submit Kata</strong>.`;

    const sameRow = placed.every(c => c.r === placed[0].r);
    const sameCol = placed.every(c => c.col === placed[0].col);

    if (!sameRow && !sameCol) {
      previewWordEl.innerHTML = '<span style="color: #ef4444;">❌ Harus segaris lurus horizontal / vertikal!</span>';
      previewScoreEl.textContent = 'Estimasi: 0 Pts';
      return;
    }

    let formedWord = '';
    let wordMultiplier = 1;
    let turnScore = 0;

    if (sameRow) {
      const r = placed[0].r;
      const cols = placed.map(p => p.col);
      let minCol = Math.min(...cols);
      let maxCol = Math.max(...cols);
      while (minCol > 0 && this.board[r][minCol - 1]) minCol--;
      while (maxCol < 14 && this.board[r][maxCol + 1]) maxCol++;

      let hasGap = false;
      for (let c = minCol; c <= maxCol; c++) {
        const cell = this.board[r][c];
        if (!cell) { hasGap = true; break; }
        formedWord += cell.letter;
        let letterScore = cell.score;
        const cellKey = `${r},${c}`;
        const special = this.specialTiles[cellKey];
        const isFresh = placed.some(p => p.r === r && p.col === c);
        if (isFresh && special) {
          if (special.type === 'DL') letterScore *= 2;
          if (special.type === 'TL') letterScore *= 3;
          if (special.type === 'DW' || special.type === 'STAR') wordMultiplier *= 2;
          if (special.type === 'TW') wordMultiplier *= 3;
        }
        turnScore += letterScore;
      }
      if (hasGap) {
        previewWordEl.innerHTML = '<span style="color: #ef4444;">❌ Ada kotak kosong di tengah!</span>';
        previewScoreEl.textContent = 'Estimasi: 0 Pts';
        return;
      }
    } else {
      const c = placed[0].col;
      const rows = placed.map(p => p.r);
      let minRow = Math.min(...rows);
      let maxRow = Math.max(...rows);
      while (minRow > 0 && this.board[minRow - 1][c]) minRow--;
      while (maxRow < 14 && this.board[maxRow + 1][c]) maxRow++;

      let hasGap = false;
      for (let r = minRow; r <= maxRow; r++) {
        const cell = this.board[r][c];
        if (!cell) { hasGap = true; break; }
        formedWord += cell.letter;
        let letterScore = cell.score;
        const cellKey = `${r},${c}`;
        const special = this.specialTiles[cellKey];
        const isFresh = placed.some(p => p.r === r && p.col === c);
        if (isFresh && special) {
          if (special.type === 'DL') letterScore *= 2;
          if (special.type === 'TL') letterScore *= 3;
          if (special.type === 'DW' || special.type === 'STAR') wordMultiplier *= 2;
          if (special.type === 'TW') wordMultiplier *= 3;
        }
        turnScore += letterScore;
      }
      if (hasGap) {
        previewWordEl.innerHTML = '<span style="color: #ef4444;">❌ Ada kotak kosong di tengah!</span>';
        previewScoreEl.textContent = 'Estimasi: 0 Pts';
        return;
      }
    }

    turnScore *= wordMultiplier;
    const upper = formedWord.toUpperCase();
    const isDescriptive = DESCRIPTIVE_VOCABULARY.some(v => v.word.toUpperCase() === upper);
    const isValid = formedWord.length >= 2;
    
    if (isValid) {
      previewWordEl.innerHTML = `<strong style="color: #10b981; font-size: 1.15rem;">[ ${formedWord.split('').join(' ')} ]</strong> ✔ Siap Disimpan ${isDescriptive ? '⭐ (+10 Pts Bonus Deskriptif)' : ''}`;
      previewScoreEl.innerHTML = `Estimasi: <strong>+${turnScore + (isDescriptive ? 10 : 0)} Pts</strong> ${wordMultiplier > 1 ? `(${wordMultiplier}x Word!)` : ''}`;
    } else {
      previewWordEl.innerHTML = `<span style="color: #f59e0b;">⚠️ Minimal 2 huruf</span>`;
      previewScoreEl.textContent = 'Estimasi: 0 Pts';
    }
  }

  toggleSuggestedWords() {
    const drawer = document.getElementById('suggested-words-drawer');
    const listEl = document.getElementById('suggested-words-list');
    if (!drawer || !listEl) return;

    if (!drawer.classList.contains('hidden')) {
      drawer.classList.add('hidden');
      return;
    }

    drawer.classList.remove('hidden');
    listEl.innerHTML = '';

    const rackLetters = this.playerRack.map(t => t.letter);
    if (rackLetters.length === 0) {
      listEl.innerHTML = '<p class="empty-hint">Rak Anda sedang kosong!</p>';
      return;
    }

    // Collect board letters that can be hooked
    const boardLetters = new Set();
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if (this.board[r][c] && this.board[r][c].fixed) {
          boardLetters.add(this.board[r][c].letter);
        }
      }
    }

    function canMakeWord(targetWord, rackArr) {
      const targetChars = targetWord.toUpperCase().split('');
      const rackCounts = {};
      rackArr.forEach(ch => { rackCounts[ch] = (rackCounts[ch] || 0) + 1; });

      let missingChars = [];
      targetChars.forEach(ch => {
        if (rackCounts[ch] && rackCounts[ch] > 0) {
          rackCounts[ch]--;
        } else {
          missingChars.push(ch);
        }
      });

      if (missingChars.length === 0) return { canMake: true, fromPureRack: true };
      if (missingChars.length === 1 && boardLetters.has(missingChars[0])) {
        return { canMake: true, fromPureRack: false, boardChar: missingChars[0] };
      }
      return { canMake: false };
    }

    const matches = [];
    DESCRIPTIVE_VOCABULARY.forEach(item => {
      const result = canMakeWord(item.word, rackLetters);
      if (result.canMake) {
        matches.push({
          item: item,
          pure: result.fromPureRack,
          score: calculateWordBaseScore(item.word)
        });
      }
    });

    if (matches.length === 0) {
      Array.from(VALID_SCRABBLE_WORDS).slice(0, 80).forEach(w => {
        const result = canMakeWord(w, rackLetters);
        if (result.canMake) {
          matches.push({
            item: { word: w, translation: 'Kosakata Bahasa Inggris', example: `English word: ${w}` },
            pure: result.fromPureRack,
            score: calculateWordBaseScore(w)
          });
        }
      });
    }

    matches.sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
      listEl.innerHTML = `
        <div class="suggest-empty-msg">
          💡 Belum ada kata langsung dari huruf di rak. Coba tombol <strong>🔀 Acak Rak</strong> atau <strong>🔄 Tukar Huruf (Swap)</strong>!
        </div>
      `;
      return;
    }

    matches.slice(0, 8).forEach(({ item, pure, score }) => {
      const card = document.createElement('div');
      card.className = 'suggest-item-card animate-pop';
      card.innerHTML = `
        <div class="suggest-top-line">
          <span class="suggest-word-title">${item.word}</span>
          <span class="badge ${pure ? 'badge-primary' : 'badge-accent'}">+${score} Pts</span>
        </div>
        <div class="suggest-word-trans"><em>${item.translation || 'Kosakata Deskriptif'}</em></div>
        <div style="display: flex; gap: 0.4rem; margin-top: 0.35rem;">
          <button class="btn-icon" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="window.soundEngine.speak('${item.word}')">
            🔊 Pengucapan
          </button>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  submitClassicMove() {
    const feedbackEl = document.getElementById('classic-move-feedback');
    if (this.currentTurnPlacedCells.length === 0) {
      if (feedbackEl) {
        feedbackEl.className = 'feedback-box feedback-error animate-fade-in';
        feedbackEl.innerHTML = '⚠️ <strong>Pemberitahuan:</strong> Letakkan minimal 1 huruf dari rak ke papan terlebih dahulu!';
      }
      window.soundEngine.playErrorSound();
      return;
    }

    // Determine direction and formed words
    const placed = this.currentTurnPlacedCells;
    const sameRow = placed.every(c => c.r === placed[0].r);
    const sameCol = placed.every(c => c.col === placed[0].col);

    if (!sameRow && !sameCol) {
      if (feedbackEl) {
        feedbackEl.className = 'feedback-box feedback-error animate-fade-in';
        feedbackEl.innerHTML = '❌ <strong>Susunan Salah:</strong> Ubin huruf harus diletakkan dalam satu garis lurus (horizontal atau vertikal)!';
      }
      window.soundEngine.playErrorSound();
      return;
    }

    // Extract contiguous word formed
    let formedWord = '';
    let wordMultiplier = 1;
    let turnScore = 0;
    const wordTiles = [];

    if (sameRow) {
      const r = placed[0].r;
      const cols = placed.map(p => p.col);
      let minCol = Math.min(...cols);
      let maxCol = Math.max(...cols);

      // Expand left
      while (minCol > 0 && this.board[r][minCol - 1]) minCol--;
      // Expand right
      while (maxCol < 14 && this.board[r][maxCol + 1]) maxCol++;

      for (let c = minCol; c <= maxCol; c++) {
        const cell = this.board[r][c];
        if (!cell) {
          if (feedbackEl) {
            feedbackEl.className = 'feedback-box feedback-error animate-fade-in';
            feedbackEl.innerHTML = '❌ <strong>Ada Celah:</strong> Huruf yang ditaruh harus bersambung tanpa kotak kosong di antaranya!';
          }
          window.soundEngine.playErrorSound();
          return;
        }
        formedWord += cell.letter;

        let letterScore = cell.score;
        const cellKey = `${r},${c}`;
        const special = this.specialTiles[cellKey];

        const isFresh = placed.some(p => p.r === r && p.col === c);
        if (isFresh && special) {
          if (special.type === 'DL') letterScore *= 2;
          if (special.type === 'TL') letterScore *= 3;
          if (special.type === 'DW' || special.type === 'STAR') wordMultiplier *= 2;
          if (special.type === 'TW') wordMultiplier *= 3;
        }
        turnScore += letterScore;
        wordTiles.push(cell);
      }
    } else {
      const c = placed[0].col;
      const rows = placed.map(p => p.r);
      let minRow = Math.min(...rows);
      let maxRow = Math.max(...rows);

      while (minRow > 0 && this.board[minRow - 1][c]) minRow--;
      while (maxRow < 14 && this.board[maxRow + 1][c]) maxRow++;

      for (let r = minRow; r <= maxRow; r++) {
        const cell = this.board[r][c];
        if (!cell) {
          if (feedbackEl) {
            feedbackEl.className = 'feedback-box feedback-error animate-fade-in';
            feedbackEl.innerHTML = '❌ <strong>Ada Celah:</strong> Huruf yang ditaruh harus bersambung tanpa kotak kosong di antaranya!';
          }
          window.soundEngine.playErrorSound();
          return;
        }
        formedWord += cell.letter;

        let letterScore = cell.score;
        const cellKey = `${r},${c}`;
        const special = this.specialTiles[cellKey];
        const isFresh = placed.some(p => p.r === r && p.col === c);
        if (isFresh && special) {
          if (special.type === 'DL') letterScore *= 2;
          if (special.type === 'TL') letterScore *= 3;
          if (special.type === 'DW' || special.type === 'STAR') wordMultiplier *= 2;
          if (special.type === 'TW') wordMultiplier *= 3;
        }
        turnScore += letterScore;
        wordTiles.push(cell);
      }
    }

    turnScore *= wordMultiplier;
    const upperWord = formedWord.toUpperCase();
    const vocabEntry = getVocabEntry(upperWord);
    const isDescriptive = !!vocabEntry;
    
    // Add descriptive bonus if matching descriptive vocabulary
    const descriptiveBonus = isDescriptive ? 10 : 0;
    const finalTurnScore = turnScore + descriptiveBonus;

    // Check validity (Any formed continuous word of length >= 2 is accepted)
    if (formedWord.length >= 2) {
      // Lock placed cells
      this.currentTurnPlacedCells.forEach(cell => {
        if (this.board[cell.r][cell.col]) {
          this.board[cell.r][cell.col].fixed = true;
        }
      });
      this.currentTurnPlacedCells = [];

      this.score += finalTurnScore;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('scrabble_highscore', this.highScore);
      }

      window.soundEngine.playWordSuccess();

      if (vocabEntry && !this.discoveredWords.find(w => w.word === upperWord)) {
        this.discoveredWords.unshift(vocabEntry);
        this.renderDiscoveredWords();
      }

      this.refillPlayerRack();
      this.renderClassicBoard();
      this.renderClassicRack();
      this.updateScoreDisplay();

      // Close suggest drawer if open
      const drawer = document.getElementById('suggested-words-drawer');
      if (drawer) drawer.classList.add('hidden');

      if (feedbackEl) {
        feedbackEl.className = 'feedback-box feedback-success animate-fade-in';
        feedbackEl.innerHTML = `
          <h4>🎉 KATA DITERIMA: <strong style="color: #38bdf8;">${upperWord}</strong> (+${finalTurnScore} Poin)!</h4>
          ${wordMultiplier > 1 ? `<p style="color: #fbbf24;">⭐ Mengaktifkan pengali <strong>${wordMultiplier}x Word Multiplier!</strong></p>` : ''}
          ${isDescriptive ? `<p style="color: #34d399;">🌟 <strong>Bonus Kosakata Deskriptif +10 Pts!</strong></p>` : ''}
          ${vocabEntry ? `
            <div style="margin: 0.5rem 0; font-size: 0.95rem; line-height: 1.6;">
              <p><strong>Arti:</strong> ${vocabEntry.translation}</p>
              <p><strong>Definisi:</strong> ${vocabEntry.definition}</p>
              <p><strong>Contoh Kalimat:</strong> "${vocabEntry.example}"</p>
            </div>
            <button class="btn btn-primary" onclick="window.soundEngine.speak('${upperWord}. ${vocabEntry.example.replace(/'/g, "\\'")}')">
              🔊 Dengarkan Pengucapan
            </button>
          ` : `
            <button class="btn btn-primary" onclick="window.soundEngine.speak('${upperWord}')">
              🔊 Dengarkan Pengucapan
            </button>
          `}
        `;
      }
    } else {
      window.soundEngine.playErrorSound();
      if (feedbackEl) {
        feedbackEl.className = 'feedback-box feedback-error animate-fade-in';
        feedbackEl.innerHTML = `
          <h4>❌ Kata terlalu pendek</h4>
          <p>Panjang kata minimal adalah 2 huruf.</p>
          <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" onclick="window.scrabbleGame.recallAllTurnTiles()">↩ Tarik Huruf Kembali</button>
          </div>
        `;
      }
    }
  }

  /* =========================================================================
   * SENTENCE BUILDER MINI-GAME (MODE C)
   * ========================================================================= */
  initSentenceMode() {
    this.currentSentenceIdx = 0;
    this.sentenceUserSlots = {};
    this.renderSentenceBuilder();
  }

  renderSentenceBuilder() {
    const container = document.getElementById('sentence-builder-content');
    if (!container) return;

    const currentTpl = this.sentenceTemplates[this.currentSentenceIdx];
    const availableWords = DESCRIPTIVE_VOCABULARY;

    let patternHtml = '';
    currentTpl.pattern.forEach((part, idx) => {
      if (currentTpl.slots.includes(idx)) {
        const selectedWord = this.sentenceUserSlots[idx];
        patternHtml += `
          <div class="sentence-slot-target ${selectedWord ? 'filled' : 'empty'}" data-slot-idx="${idx}" onclick="window.scrabbleGame.removeSentenceWord(${idx})">
            ${selectedWord ? `<span class="badge badge-accent">${selectedWord} ✖</span>` : `<span class="slot-placeholder">${part}</span>`}
          </div>
        `;
      } else {
        patternHtml += `<span class="sentence-static-word">${part}</span>`;
      }
    });

    container.innerHTML = `
      <div class="sentence-construction-box">
        <div class="sentence-header">
          <h3>Mini-Lab: Descriptive Sentence Construction</h3>
          <span class="badge badge-primary">Simple Present Tense</span>
        </div>
        <p class="sentence-instruction">Select descriptive adjectives from the word bank below to complete the sentence structure:</p>
        <div class="sentence-display-line">
          ${patternHtml}
        </div>
        <div class="sentence-word-bank">
          <h4>Verbs (To Be / Have / Has):</h4>
          <div class="word-bank-chips" style="margin-bottom: 1.5rem;">
            <button class="chip-btn" style="background: rgba(139, 92, 246, 0.1); border-color: rgba(139, 92, 246, 0.3); color: #c4b5fd;" onclick="window.scrabbleGame.selectSentenceWord('is', 'verb')">is</button>
            <button class="chip-btn" style="background: rgba(139, 92, 246, 0.1); border-color: rgba(139, 92, 246, 0.3); color: #c4b5fd;" onclick="window.scrabbleGame.selectSentenceWord('am', 'verb')">am</button>
            <button class="chip-btn" style="background: rgba(139, 92, 246, 0.1); border-color: rgba(139, 92, 246, 0.3); color: #c4b5fd;" onclick="window.scrabbleGame.selectSentenceWord('are', 'verb')">are</button>
            <button class="chip-btn" style="background: rgba(139, 92, 246, 0.1); border-color: rgba(139, 92, 246, 0.3); color: #c4b5fd;" onclick="window.scrabbleGame.selectSentenceWord('has', 'verb')">has</button>
            <button class="chip-btn" style="background: rgba(139, 92, 246, 0.1); border-color: rgba(139, 92, 246, 0.3); color: #c4b5fd;" onclick="window.scrabbleGame.selectSentenceWord('have', 'verb')">have</button>
          </div>
          <h4>Word Bank (Grade 7 Descriptive Adjectives):</h4>
          <div class="word-bank-chips">
            ${availableWords.map(item => `
              <button class="chip-btn" onclick="window.scrabbleGame.selectSentenceWord('${item.word}', 'adjective')">
                ${item.word} <small>(${item.translation})</small>
              </button>
            `).join('')}
          </div>
        </div>
        <div class="sentence-actions">
          <button class="btn btn-accent" onclick="window.scrabbleGame.checkSentenceStructure()">Check Sentence ✔</button>
          <button class="btn btn-outline" onclick="window.scrabbleGame.nextSentenceTemplate()">Next Pattern ➔</button>
        </div>
        <div id="sentence-feedback-result" class="feedback-box hidden"></div>
      </div>
    `;
  }

  selectSentenceWord(word, type = 'adjective') {
    const currentTpl = this.sentenceTemplates[this.currentSentenceIdx];
    // Cari kotak kosong pertama yang sesuai dengan tipenya (verb atau adjective)
    const emptySlot = currentTpl.slots.find((slotIdx, i) => {
      const isSlotEmpty = !this.sentenceUserSlots[slotIdx];
      const slotType = currentTpl.types[i];
      
      // Jika kata yang diklik adalah verb (is/am/are/has/have), hanya bisa masuk ke slot bertipe 'verb'
      if (type === 'verb') {
        return isSlotEmpty && slotType === 'verb';
      } else {
        // Jika kata yang diklik adalah adjective, hanya bisa masuk ke slot yang BUKAN 'verb'
        return isSlotEmpty && slotType !== 'verb';
      }
    });

    if (emptySlot !== undefined) {
      this.sentenceUserSlots[emptySlot] = word;
      window.soundEngine.playTileClick();
      this.renderSentenceBuilder();
    } else {
      // Jika tidak ada slot yang sesuai, mainkan suara error atau tidak melakukan apa-apa
      window.soundEngine.playErrorSound();
    }
  }

  removeSentenceWord(slotIdx) {
    delete this.sentenceUserSlots[slotIdx];
    window.soundEngine.playTileClick();
    this.renderSentenceBuilder();
  }

  checkSentenceStructure() {
    const currentTpl = this.sentenceTemplates[this.currentSentenceIdx];
    const feedbackEl = document.getElementById('sentence-feedback-result');
    const allFilled = currentTpl.slots.every(idx => this.sentenceUserSlots[idx]);

    if (!allFilled) {
      if (feedbackEl) {
        feedbackEl.className = 'feedback-box feedback-error animate-fade-in';
        feedbackEl.innerHTML = '⚠️ Please fill all adjective slots before checking!';
      }
      window.soundEngine.playErrorSound();
      return;
    }

    // Complete sentence string
    const sentenceArr = currentTpl.pattern.map((part, idx) => {
      return this.sentenceUserSlots[idx] || part;
    });
    const fullSentence = sentenceArr.join(' ');

    this.score += 25;
    window.soundEngine.playWordSuccess();

    if (feedbackEl) {
      feedbackEl.className = 'feedback-box feedback-success animate-fade-in';
      feedbackEl.innerHTML = `
        <h4>🌟 Perfect Descriptive Sentence!</h4>
        <p class="final-sentence">"${fullSentence}"</p>
        <p>You earned <strong>+25 Points</strong> for correct grammatical agreement (Subject + Verb 'to-be' / 'has' + Adjective)!</p>
        <button class="btn btn-primary" onclick="window.soundEngine.speak('${fullSentence.replace(/'/g, "\\'")}')">🔊 Listen to Full Sentence</button>
      `;
    }
    this.updateScoreDisplay();
  }

  nextSentenceTemplate() {
    this.currentSentenceIdx = (this.currentSentenceIdx + 1) % this.sentenceTemplates.length;
    this.sentenceUserSlots = {};
    this.renderSentenceBuilder();
  }

  /* =========================================================================
   * GENERAL UTILITIES
   * ========================================================================= */
  updateScoreDisplay() {
    const scoreEls = document.querySelectorAll('.game-current-score');
    const highScoreEls = document.querySelectorAll('.game-high-score');
    const streakEls = document.querySelectorAll('.game-streak-count');

    scoreEls.forEach(el => el.textContent = this.score);
    highScoreEls.forEach(el => el.textContent = this.highScore);
    streakEls.forEach(el => el.textContent = this.streak);
  }

  renderDiscoveredWords() {
    const container = document.getElementById('discovered-words-list');
    if (!container) return;

    if (this.discoveredWords.length === 0) {
      container.innerHTML = `<p class="empty-hint">No descriptive words discovered yet. Complete a challenge or place words on the board!</p>`;
      return;
    }

    container.innerHTML = this.discoveredWords.map(item => `
      <div class="discovered-card animate-pop">
        <div class="card-header">
          <strong>${item.word}</strong>
          <span class="badge badge-${item.category}">${item.category}</span>
          <button class="btn-mini-audio" onclick="window.soundEngine.speak('${item.word}')">🔊</button>
        </div>
        <p class="card-trans"><em>${item.translation}</em></p>
        <p class="card-ex">"${item.example}"</p>
      </div>
    `).join('');
  }
}

// Global Game Instance
window.scrabbleGame = new ScrabbleGame();
