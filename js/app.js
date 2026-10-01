/**
 * Main Application Orchestrator (Project Tataa)
 * Routing, Navigation, Multimedia Controls, and View Lifecycle
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuthSystem();
  initNavigation();
  initHomeVocabularyCards();
  initRubricCalculator();
  initCertificateModal();
  initThemeAndAudioToggles();

  // Load view based on current URL hash or default to 'beranda'
  const initialView = window.location.hash.replace('#', '') || 'beranda';
  navigateToView(initialView);
});

// View Navigation System
function initNavigation() {
  const navLinks = document.querySelectorAll('[data-view-target]');
  const mobileToggle = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu-links');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-view-target');
      navigateToView(targetView);
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
      }
    });
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Product Subview Tab Listeners
  const productTabs = document.querySelectorAll('.product-tab-btn');
  productTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const tabMode = tab.getAttribute('data-tab');
      if (tabMode) {
        switchProductTab(tabMode);
      }
    });
  });

  // Handle browser back/forward
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'beranda';
    navigateToView(hash, false);
  });
}

function navigateToView(viewId, updateHash = true) {
  // Teacher View Route Guard
  if (viewId === 'guru') {
    if (!authManager.isTeacher()) {
      openAuthModal('teacher');
      const errBanner = document.getElementById('teacher-auth-error');
      if (errBanner) {
        errBanner.classList.remove('hidden');
        errBanner.innerHTML = '🔒 <strong>Akses Khusus Guru:</strong> Silakan masuk dengan akun guru untuk membuka Dashboard & Rekap Nilai.';
      }
      return;
    }
  }

  const views = document.querySelectorAll('.app-view');
  const targetViewEl = document.getElementById(`view-${viewId}`);

  if (!targetViewEl) {
    viewId = 'beranda';
  }

  views.forEach(view => {
    view.classList.remove('active-view');
    view.classList.add('hidden');
  });

  const activeView = document.getElementById(`view-${viewId}`);
  if (activeView) {
    activeView.classList.remove('hidden');
    activeView.classList.add('active-view');
  }

  // Update navigation active state
  document.querySelectorAll('[data-view-target]').forEach(link => {
    if (link.getAttribute('data-view-target') === viewId) {
      link.classList.add('active-nav');
    } else {
      link.classList.remove('active-nav');
    }
  });

  if (updateHash) {
    window.location.hash = viewId;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Lifecycle triggers
  if (viewId === 'produk') {
    if (!window.scrabbleGameInitialized) {
      window.scrabbleGame.initChallengeMode('all');
      window.scrabbleGameInitialized = true;
    }
  } else if (viewId === 'guru') {
    renderTeacherDashboard();
  }
}

// Global Helper to Open Specific Product Game Mode
function openProductGame(mode = 'challenge') {
  navigateToView('produk');
  const targetMode = (mode === 'lobby' || !mode) ? 'challenge' : mode;
  switchProductTab(targetMode);
}

// Home Vocabulary Interactive Cards
function initHomeVocabularyCards() {
  const categoryFilters = document.querySelectorAll('.vocab-filter-btn');
  const vocabGrid = document.getElementById('home-vocab-grid');

  if (!vocabGrid) return;

  function renderVocabCards(category = 'all') {
    const filtered = category === 'all' 
      ? DESCRIPTIVE_VOCABULARY 
      : DESCRIPTIVE_VOCABULARY.filter(item => item.category === category);

    vocabGrid.innerHTML = filtered.map(item => `
      <div class="vocab-card animate-fade-in" data-category="${item.category}">
        <div class="card-top">
          <span class="badge badge-${item.category}">${item.category.toUpperCase()}</span>
          <span class="vocab-points">${calculateWordBaseScore(item.word)} Pts</span>
        </div>
        <div class="card-word-row">
          <h3 class="vocab-word-title">${item.word}</h3>
          <button class="btn-voice" onclick="window.soundEngine.speak('${item.word}')" title="Listen to Pronunciation">
            🔊
          </button>
        </div>
        <p class="vocab-trans">${item.translation}</p>
        <p class="vocab-def">${item.definition}</p>
        <div class="vocab-ex-box">
          <small>Example:</small>
          <p class="vocab-ex">"${item.example}"</p>
        </div>
        <button class="btn-sm-play" onclick="playVocabWord('${item.word}')">
          🎮 Play in Scrabble
        </button>
      </div>
    `).join('');
  }

  categoryFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category');
      renderVocabCards(cat);
    });
  });

  // Initial render
  renderVocabCards('all');
}

function playVocabWord(word) {
  navigateToView('produk');
  // Switch to challenge mode with this word if possible
  const vocabIndex = DESCRIPTIVE_VOCABULARY.findIndex(v => v.word.toUpperCase() === word.toUpperCase());
  if (vocabIndex !== -1) {
    window.scrabbleGame.challengeCategory = 'all';
    window.scrabbleGame.challengeFilteredList = [...DESCRIPTIVE_VOCABULARY];
    window.scrabbleGame.challengeIndex = vocabIndex;
    window.scrabbleGame.loadCurrentChallenge();
    switchProductTab('challenge');
  } else {
    switchProductTab('challenge');
  }
}

// Product Page Tabs (Challenge vs Classic Board vs Sentence Builder)
function switchProductTab(tabName) {
  try {
    if (window.soundEngine && typeof window.soundEngine.play === 'function') {
      window.soundEngine.play('click');
    } else if (window.soundEngine && typeof window.soundEngine.playTileClick === 'function') {
      window.soundEngine.playTileClick();
    }
  } catch (e) {
    console.warn("Audio feedback error:", e);
  }

  // Update active state on tab buttons
  const tabs = document.querySelectorAll('.product-tab-btn');
  tabs.forEach(tab => {
    const target = tab.getAttribute('data-tab');
    if (target === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Toggle subviews visibility
  const subviews = [
    { name: 'challenge', id: 'product-mode-challenge' },
    { name: 'classic', id: 'product-mode-classic' },
    { name: 'sentence', id: 'product-mode-sentence' }
  ];

  subviews.forEach(view => {
    const el = document.getElementById(view.id);
    if (el) {
      if (view.name === tabName) {
        el.classList.remove('hidden');
        el.style.display = 'block';
      } else {
        el.classList.add('hidden');
        el.style.display = 'none';
      }
    }
  });

  // Mode-specific game initializations
  try {
    if (window.scrabbleGame) {
      window.scrabbleGame.currentMode = tabName;
      if (tabName === 'challenge') {
        if (!window.scrabbleGame.currentChallengeWord) {
          window.scrabbleGame.initChallengeMode('all');
        } else {
          window.scrabbleGame.renderChallengeUI();
        }
      } else if (tabName === 'classic') {
        if (!window.scrabbleGame.board || (window.scrabbleGame.board[7][7] === null && !window.scrabbleGame.board[7][2])) {
          window.scrabbleGame.initClassicMode();
        } else {
          window.scrabbleGame.renderClassicBoard();
          window.scrabbleGame.renderClassicRack();
          window.scrabbleGame.updateTurnLivePreview();
        }
      } else if (tabName === 'sentence') {
        window.scrabbleGame.initSentenceMode();
      }
      
      // Ensure scoreboard displays are updated
      if (typeof window.scrabbleGame.updateScoreDisplay === 'function') {
        window.scrabbleGame.updateScoreDisplay();
      }
    }
  } catch (err) {
    console.error("Error initializing mode " + tabName, err);
  }
}

// Bind navigation utilities to window
window.switchProductTab = switchProductTab;
window.navigateToView = navigateToView;
window.openProductGame = openProductGame;

// Rubrik Matrix Calculator
function initRubricCalculator() {
  const rubricSelects = document.querySelectorAll('.rubric-select');
  const totalScoreEl = document.getElementById('rubric-calculated-score');
  const rubricGradeEl = document.getElementById('rubric-calculated-grade');

  function calculateRubric() {
    let sum = 0;
    rubricSelects.forEach(select => {
      sum += parseInt(select.value || '0', 10);
    });

    if (totalScoreEl) totalScoreEl.textContent = `${sum}/100`;

    if (rubricGradeEl) {
      if (sum >= 86) rubricGradeEl.textContent = 'Predikat: Sangat Memuaskan (A)';
      else if (sum >= 71) rubricGradeEl.textContent = 'Predikat: Baik / Kompeten (B)';
      else if (sum >= 56) rubricGradeEl.textContent = 'Predikat: Cukup (C)';
      else rubricGradeEl.textContent = 'Predikat: Perlu Bimbingan (D)';
    }
  }

  rubricSelects.forEach(select => {
    select.addEventListener('change', calculateRubric);
  });
}

// Certificate Modal
function initCertificateModal() {
  const modal = document.getElementById('certificate-modal');
  const openBtn = document.getElementById('btn-open-certificate');
  const closeBtn = document.getElementById('btn-close-certificate');
  const generateBtn = document.getElementById('btn-render-cert');
  const downloadBtn = document.getElementById('btn-download-cert');
  const studentNameInput = document.getElementById('cert-student-name');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      const name = studentNameInput ? studentNameInput.value || 'Siswa Kelas 7 SMP' : 'Siswa Kelas 7 SMP';
      window.quizManager.generateCertificate(name);
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  if (generateBtn && studentNameInput) {
    generateBtn.addEventListener('click', () => {
      const name = studentNameInput.value.trim() || 'Siswa Kelas 7 SMP';
      window.quizManager.generateCertificate(name);
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      window.quizManager.downloadCertificate();
    });
  }
}

// Sound and Theme Toggles
function initThemeAndAudioToggles() {
  // Theme Toggle System
  const themeBtn = document.getElementById('btn-toggle-theme');
  const sunIcon = themeBtn ? themeBtn.querySelector('.theme-sun-icon') : null;
  const moonIcon = themeBtn ? themeBtn.querySelector('.theme-moon-icon') : null;
  const themeLabel = themeBtn ? themeBtn.querySelector('.theme-label') : null;

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);

    if (sunIcon && moonIcon) {
      if (theme === 'light') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
    }
    if (themeLabel) {
      themeLabel.textContent = theme === 'light' ? 'Light' : 'Dark';
    }
    if (themeBtn) {
      themeBtn.title = theme === 'light' ? 'Beralih ke Dark Mode' : 'Beralih ke Light Mode';
    }
  }

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('app-theme') || 'dark';
  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
    });
  }

  // Audio Dropdown System
  const soundBtnMenu = document.getElementById('btn-toggle-sound-menu');
  const soundPanel = document.getElementById('sound-dropdown-panel');
  if (soundBtnMenu && soundPanel) {
    soundBtnMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      soundPanel.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!soundBtnMenu.contains(e.target) && !soundPanel.contains(e.target)) {
        soundPanel.classList.add('hidden');
      }
    });

    // SFX bindings
    const toggleSfx = document.getElementById('toggle-sfx');
    const volumeSfx = document.getElementById('volume-sfx');
    if (toggleSfx) {
      toggleSfx.addEventListener('change', (e) => {
        window.soundEngine.toggleSound(e.target.checked);
        if (e.target.checked) window.soundEngine.playTileClick();
      });
    }
    if (volumeSfx) {
      volumeSfx.addEventListener('input', (e) => {
        window.soundEngine.setSfxVolume(parseFloat(e.target.value));
      });
    }

    // BGM bindings
    const toggleBgm = document.getElementById('toggle-bgm');
    const volumeBgm = document.getElementById('volume-bgm');
    if (toggleBgm) {
      toggleBgm.addEventListener('change', (e) => {
        window.soundEngine.toggleBGM(e.target.checked);
      });
    }
    if (volumeBgm) {
      volumeBgm.addEventListener('input', (e) => {
        window.soundEngine.setBgmVolume(parseFloat(e.target.value));
      });
    }
  }
}

/* =========================================================================
 * AUTHENTICATION & USER SESSION MANAGER
 * ========================================================================= */
class AuthManager {
  constructor() {
    this.role = localStorage.getItem('project_tataa_role') || null; // 'student' | 'teacher' | null
    this.username = localStorage.getItem('project_tataa_username') || '';
    this.studentClass = localStorage.getItem('project_tataa_class') || '';
  }

  isStudent() {
    return this.role === 'student';
  }

  isTeacher() {
    return this.role === 'teacher';
  }

  loginStudent(name, className) {
    this.role = 'student';
    this.username = name.trim();
    this.studentClass = className;
    localStorage.setItem('project_tataa_role', 'student');
    localStorage.setItem('project_tataa_username', this.username);
    localStorage.setItem('project_tataa_class', this.studentClass);
    this.updateUI();
    
    // Sync to certificate input
    const certInput = document.getElementById('cert-student-name');
    if (certInput) certInput.value = `${this.username} (${this.studentClass})`;
  }

  loginTeacher() {
    this.role = 'teacher';
    this.username = 'admin';
    this.studentClass = 'Guru / Fasilitator';
    localStorage.setItem('project_tataa_role', 'teacher');
    localStorage.setItem('project_tataa_username', 'admin');
    localStorage.setItem('project_tataa_class', 'Guru');
    this.updateUI();
  }

  logout() {
    this.role = null;
    this.username = '';
    this.studentClass = '';
    localStorage.removeItem('project_tataa_role');
    localStorage.removeItem('project_tataa_username');
    localStorage.removeItem('project_tataa_class');
    this.updateUI();
    navigateToView('beranda');
  }

  updateUI() {
    const sessionBtn = document.getElementById('btn-user-session');
    const sessionDisplay = document.getElementById('session-display-name');
    const guruDisplay = document.getElementById('guru-session-display');
    const navGuruItem = document.getElementById('nav-guru-item');

    if (!sessionBtn || !sessionDisplay) return;

    sessionBtn.classList.remove('logged-in-student', 'logged-in-teacher');

    if (this.isStudent()) {
      sessionBtn.classList.add('logged-in-student');
      sessionDisplay.style.display = 'inline-block';
      sessionDisplay.textContent = `${this.username} (${this.studentClass})`;
      sessionBtn.title = `Siswa Aktif: ${this.username} (${this.studentClass}) - Klik untuk keluar / ganti akun`;
      if (navGuruItem) navGuruItem.style.display = 'none'; // Sembunyikan menu Rekap Nilai dari Siswa
    } else if (this.isTeacher()) {
      sessionBtn.classList.add('logged-in-teacher');
      sessionDisplay.style.display = 'inline-block';
      sessionDisplay.textContent = `Guru`; // Tanpa emoji
      sessionBtn.title = `Sesi Guru: Administrator - Klik untuk keluar / beralih akun`;
      if (guruDisplay) guruDisplay.textContent = 'admin (Administrator Guru Aktif)';
      if (navGuruItem) navGuruItem.style.display = ''; // Munculkan kembali menu Rekap Nilai untuk Guru
    } else {
      sessionDisplay.style.display = 'inline-block';
      sessionDisplay.textContent = 'Masuk';
      sessionBtn.title = 'Masuk Siswa / Guru';
      if (navGuruItem) navGuruItem.style.display = 'none'; // Sembunyikan dari tamu/guest
    }
  }
}

const authManager = new AuthManager();
window.authManager = authManager;

function initAuthSystem() {
  authManager.updateUI();
  
  // Prepopulate sample student recap data if empty
  if (!localStorage.getItem('teacher_student_records')) {
    // Silently initialize empty array if first time
    localStorage.setItem('teacher_student_records', JSON.stringify([]));
  }
}

function openAuthModal(defaultTab = 'student') {
  const modal = document.getElementById('auth-modal-overlay');
  if (!modal) return;
  
  // If user is already logged in, prompt logout confirmation
  if (authManager.role) {
    const userDesc = authManager.isStudent() ? `Siswa: ${authManager.username} (${authManager.studentClass})` : `Guru (admin)`;
    const confirmLogout = confirm(`Anda saat ini masuk sebagai ${userDesc}.\n\nApakah Anda ingin keluar (Logout) atau mengganti akun?`);
    if (confirmLogout) {
      authManager.logout();
      return;
    } else {
      return;
    }
  }

  modal.classList.remove('hidden');
  switchAuthTab(defaultTab);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal-overlay');
  if (modal) modal.classList.add('hidden');
  
  // Clear teacher error
  const errBanner = document.getElementById('teacher-auth-error');
  if (errBanner) {
    errBanner.classList.add('hidden');
    errBanner.textContent = '';
  }
}

function switchAuthTab(tab) {
  const studentBtn = document.getElementById('tab-btn-student');
  const teacherBtn = document.getElementById('tab-btn-teacher');
  const studentForm = document.getElementById('auth-form-student');
  const teacherForm = document.getElementById('auth-form-teacher');
  const errBanner = document.getElementById('teacher-auth-error');

  if (errBanner) errBanner.classList.add('hidden');

  if (tab === 'student') {
    if (studentBtn) studentBtn.classList.add('active');
    if (teacherBtn) teacherBtn.classList.remove('active');
    if (studentForm) studentForm.classList.remove('hidden');
    if (teacherForm) teacherForm.classList.add('hidden');
  } else {
    if (studentBtn) studentBtn.classList.remove('active');
    if (teacherBtn) teacherBtn.classList.add('active');
    if (studentForm) studentForm.classList.add('hidden');
    if (teacherForm) teacherForm.classList.remove('hidden');
  }
}

function handleStudentLogin(e) {
  e.preventDefault();
  const nameInput = document.getElementById('student-auth-name');
  const classSelect = document.getElementById('student-auth-class');

  const name = nameInput ? nameInput.value.trim() : '';
  const className = classSelect ? classSelect.value : '';

  if (!name || !className) {
    alert('Mohon lengkapi Nama Lengkap dan Pilihan Kelas.');
    return;
  }

  authManager.loginStudent(name, className);
  closeAuthModal();

  if (window.soundEngine && typeof window.soundEngine.playSuccess === 'function') {
    window.soundEngine.playSuccess();
  }

  alert(`Selamat datang, ${name}! Profil belajar Anda (${className}) telah aktif.`);
}

function handleTeacherLogin(e) {
  e.preventDefault();
  const userInput = document.getElementById('teacher-auth-user');
  const passInput = document.getElementById('teacher-auth-pass');
  const errBanner = document.getElementById('teacher-auth-error');

  const username = userInput ? userInput.value.trim().toLowerCase() : '';
  const password = passInput ? passInput.value.trim() : '';

  // Validation: admin & admin123
  if (username === 'admin' && password === 'admin123') {
    if (errBanner) errBanner.classList.add('hidden');
    authManager.loginTeacher();
    closeAuthModal();

    if (window.soundEngine && typeof window.soundEngine.playSuccess === 'function') {
      window.soundEngine.playSuccess();
    }

    navigateToView('guru');
  } else {
    if (errBanner) {
      errBanner.classList.remove('hidden');
      errBanner.innerHTML = '⚠️ <strong>Gagal Masuk:</strong> Username atau Password guru tidak sesuai. (Gunakan <code>admin</code> / <code>admin123</code>).';
    }
    if (window.soundEngine && typeof window.soundEngine.playError === 'function') {
      window.soundEngine.playError();
    }
  }
}

function logoutUser() {
  if (confirm('Apakah Anda yakin ingin keluar dari sesi saat ini?')) {
    authManager.logout();
  }
}

/* =========================================================================
 * TEACHER DASHBOARD & STUDENT RECAP RECORDS SYSTEM (GOOGLE SHEETS VERSION)
 * ========================================================================= */

// GANTI URL INI DENGAN URL WEB APP GOOGLE SCRIPT ANDA
const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbzlSTBVf87hb5pNHjs_XCaBm3p8kD4Wq4gl0j9kvz07gh-t3GJphkdH8x0KEWAE0M2XHw/exec';

let cachedTeacherRecords = [];

async function getStudentRecapData() {
  try {
    const response = await fetch(GOOGLE_SHEETS_API_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    cachedTeacherRecords = data;
    localStorage.setItem('teacher_student_records', JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Gagal mengambil data dari Google Sheets, menggunakan data lokal:", error);
    const raw = localStorage.getItem('teacher_student_records');
    cachedTeacherRecords = raw ? JSON.parse(raw) : [];
    return cachedTeacherRecords;
  }
}

async function renderTeacherDashboard() {
  const tbody = document.getElementById('teacher-rekap-tbody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr class="empty-state-row">
      <td colspan="9">Sedang mengambil data dari server Google Sheets... ⏳</td>
    </tr>
  `;

  const records = await getStudentRecapData();
  const totalStudentsEl = document.getElementById('t-stat-total-students');
  const avgScoreEl = document.getElementById('t-stat-avg-score');
  const passRateEl = document.getElementById('t-stat-pass-rate');
  const highestScoreEl = document.getElementById('t-stat-highest-score');
  const topStudentEl = document.getElementById('t-stat-top-student');
  const badgeCountEl = document.getElementById('rekap-badge-count');

  const total = records.length;
  if (totalStudentsEl) totalStudentsEl.textContent = total;
  if (badgeCountEl) badgeCountEl.textContent = `${total} Data Siswa`;

  if (total === 0) {
    if (avgScoreEl) avgScoreEl.textContent = '0.0';
    if (passRateEl) passRateEl.textContent = '0%';
    if (highestScoreEl) highestScoreEl.textContent = '0';
    if (topStudentEl) topStudentEl.textContent = '-';
    tbody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="9">Belum ada data penilaian siswa di database Google Sheets.</td>
      </tr>
    `;
    return;
  }

  let sumScore = 0;
  let passedCount = 0;
  let maxScore = -1;
  let topStudent = '-';

  records.forEach(r => {
    const finalScore = Number(r.totalScore !== undefined ? r.totalScore : r.quizScore);
    sumScore += finalScore;
    if (finalScore >= 75) passedCount++;
    if (finalScore > maxScore) {
      maxScore = finalScore;
      topStudent = `${r.name} (${r.className})`;
    }
  });

  const avg = (sumScore / total).toFixed(1);
  const passRate = Math.round((passedCount / total) * 100);

  if (avgScoreEl) avgScoreEl.textContent = avg;
  if (passRateEl) passRateEl.textContent = `${passRate}%`;
  if (highestScoreEl) highestScoreEl.textContent = maxScore >= 0 ? maxScore : '0';
  if (topStudentEl) topStudentEl.textContent = topStudent;

  filterTeacherTable();
}

function filterTeacherTable() {
  const records = cachedTeacherRecords;
  const tbody = document.getElementById('teacher-rekap-tbody');
  const classFilter = document.getElementById('filter-guru-class') ? document.getElementById('filter-guru-class').value : 'all';
  const searchQuery = document.getElementById('search-guru-student') ? document.getElementById('search-guru-student').value.toLowerCase().trim() : '';

  if (!tbody) return;

  let filtered = records.filter(r => {
    const matchClass = classFilter === 'all' || r.className === classFilter;
    const matchSearch = !searchQuery || String(r.name).toLowerCase().includes(searchQuery);
    return matchClass && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="9">Tidak ditemukan data siswa yang cocok dengan filter.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((r, idx) => {
    const finalScore = Number(r.totalScore !== undefined ? r.totalScore : Math.round((r.quizScore * 0.6) + (r.rubricScore * 0.4)));
    const isPassed = finalScore >= 75;
    const timeStr = r.timestamp || new Date().toLocaleString('id-ID');
    const statusHtml = isPassed 
      ? `<span class="status-badge status-tuntas">Tuntas (${r.grade || 'A'})</span>` 
      : `<span class="status-badge status-remedial">Remedial (${r.grade || 'C'})</span>`;

    return `
      <tr>
        <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
        <td style="font-size: 0.82rem; color: #94a3b8;">${timeStr}</td>
        <td><strong>${r.name || '-'}</strong></td>
        <td><span class="badge badge-accent">${r.className || '-'}</span></td>
        <td style="font-weight: 700; color: #38bdf8;">${r.quizScore || 0}</td>
        <td style="font-weight: 600; color: #a78bfa;">${r.rubricScore || 0}</td>
        <td style="font-weight: 800; font-size: 1rem; color: #f59e0b;">${finalScore}</td>
        <td>${statusHtml}</td>
        <td style="text-align: center;">
          <button class="btn btn-sm btn-outline-danger" onclick="deleteStudentScoreRecord('${r.id}')" title="Hapus Data Siswa">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddScoreModal() {
  const modal = document.getElementById('modal-add-score');
  if (modal) modal.classList.remove('hidden');
}

function closeAddScoreModal() {
  const modal = document.getElementById('modal-add-score');
  if (modal) modal.classList.add('hidden');
}

function handleManualAddScore(e) {
  e.preventDefault();
  const nameInput = document.getElementById('manual-student-name');
  const classInput = document.getElementById('manual-student-class');
  const quizInput = document.getElementById('manual-quiz-score');
  const rubricInput = document.getElementById('manual-rubric-score');

  const name = nameInput ? nameInput.value.trim() : '';
  const className = classInput ? classInput.value : '7A';
  const quizScore = parseInt(quizInput ? quizInput.value : '0', 10);
  const rubricScore = parseInt(rubricInput ? rubricInput.value : '0', 10);
  const totalScore = Math.round((quizScore * 0.6) + (rubricScore * 0.4));
  let grade = totalScore >= 85 ? 'A' : (totalScore >= 75 ? 'B' : 'C');

  const newRecord = {
    id: 'rec_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
    name: name,
    className: className,
    quizScore: quizScore,
    rubricScore: rubricScore,
    totalScore: totalScore,
    grade: grade
  };

  // Tutup modal dan beri tahu user sedang menyimpan
  closeAddScoreModal();
  
  const tbody = document.getElementById('teacher-rekap-tbody');
  if (tbody) tbody.innerHTML = `<tr><td colspan="9">Menyimpan data manual ke Google Sheets... ⏳</td></tr>`;

  fetch(GOOGLE_SHEETS_API_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify(newRecord)
  }).then(() => {
    if (nameInput) nameInput.value = '';
    renderTeacherDashboard(); // Refresh data dari Google Sheets
  }).catch(err => {
    console.error(err);
    alert('Gagal menyimpan data manual ke server.');
    renderTeacherDashboard();
  });
}

function deleteStudentScoreRecord(id) {
  alert('Penghapusan data tidak dapat dilakukan dari sini karena data terhubung ke Google Sheets.\nSilakan hapus baris data secara langsung di dalam dokumen Google Sheets Anda.');
}

function resetStudentRecapData() {
  alert('Reset data tidak dapat dilakukan dari sini karena data terhubung ke Google Sheets.\nSilakan hapus baris-baris data secara langsung di dalam dokumen Google Sheets Anda.');
}

function generateSampleStudentData(reRender = true) {
  alert('Generasi data simulasi dinonaktifkan pada versi Google Sheets untuk menghindari spam data ke server Anda.\nSilakan coba input manual atau kerjakan kuis sebagai siswa.');
}

function exportStudentDataCSV() {
  const records = cachedTeacherRecords;
  if (records.length === 0) {
    alert('Tidak ada data siswa untuk diekspor.');
    return;
  }

  let csvContent = 'No,Waktu,Nama Siswa,Kelas,Skor Kuis,Nilai Rubrik,Total Akhir,Predikat\\n';
  records.forEach((r, idx) => {
    const finalScore = r.totalScore !== undefined ? r.totalScore : r.quizScore;
    csvContent += `"${idx + 1}","${r.timestamp || ''}","${r.name}","${r.className}","${r.quizScore}","${r.rubricScore || 85}","${finalScore}","${r.grade || 'A'}"\\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekap_Nilai_Bahasa_Inggris_Kelas7_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Function to automatically record quiz submissions
function recordStudentQuizResult(quizScore, grade) {
  if (authManager.isTeacher()) {
    console.log("Teacher tested the quiz, score not saved to server.");
    return;
  }

  const name = authManager.isStudent() ? authManager.username : (document.getElementById('cert-student-name')?.value || 'Siswa Kelas 7');
  const className = authManager.isStudent() ? authManager.studentClass : '7A';
  const rubricScore = 85;
  const totalScore = Math.round((quizScore * 0.6) + (rubricScore * 0.4));

  const newRecord = {
    id: 'rec_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
    name: name,
    className: className,
    quizScore: quizScore,
    rubricScore: rubricScore,
    totalScore: totalScore,
    grade: quizScore >= 85 ? 'A' : (quizScore >= 75 ? 'B' : 'C')
  };

  fetch(GOOGLE_SHEETS_API_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify(newRecord)
  }).then(() => {
    console.log("Data berhasil dikirim ke Google Sheets!");
    alert("Berhasil! Nilai kuis Anda telah otomatis tersimpan ke server dan Dashboard Guru.");
  }).catch(error => {
    console.error("Gagal mengirim data:", error);
    alert("Gagal menyimpan nilai ke server. Pastikan koneksi internet stabil.");
  });
}

// Expose global methods to window
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleStudentLogin = handleStudentLogin;
window.handleTeacherLogin = handleTeacherLogin;
window.logoutUser = logoutUser;
window.openAddScoreModal = openAddScoreModal;
window.closeAddScoreModal = closeAddScoreModal;
window.handleManualAddScore = handleManualAddScore;
window.deleteStudentScoreRecord = deleteStudentScoreRecord;
window.resetStudentRecapData = resetStudentRecapData;
window.generateSampleStudentData = generateSampleStudentData;
window.exportStudentDataCSV = exportStudentDataCSV;
window.filterTeacherTable = filterTeacherTable;
window.renderTeacherDashboard = renderTeacherDashboard;
window.recordStudentQuizResult = recordStudentQuizResult;


