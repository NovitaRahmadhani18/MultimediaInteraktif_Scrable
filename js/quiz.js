/**
 * Assessment & Evaluation Engine (Penilaian)
 * Features:
 * 1. Interactive 10-Question Quiz (SMP Grade 7 Descriptive Text)
 * 2. Dynamic Certificate Generator (Canvas + Print/Download)
 * 3. Rubrik Penilaian Keterampilan (Assessment Matrix)
 * 4. Lembar Refleksi Diri Siswa (Self-Assessment)
 */

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Apa tujuan utama dari Descriptive Text?",
    options: [
      "Menceritakan dongeng atau legenda",
      "Menggambarkan benda, tempat, atau orang tertentu",
      "Mengajarkan langkah-langkah membuat sesuatu",
      "Memberikan berita peristiwa terbaru"
    ],
    correctIndex: 1,
    explanation: "Teks Deskriptif bertujuan untuk menggambarkan orang, hewan, tempat, atau benda tertentu secara spesifik."
  },
  {
    id: 2,
    question: "Tenses (bentuk waktu) apa yang selalu digunakan dalam Descriptive Text?",
    options: [
      "Simple Past Tense",
      "Future Tense",
      "Simple Present Tense",
      "Past Continuous Tense"
    ],
    correctIndex: 2,
    explanation: "Teks deskriptif menggunakan Simple Present Tense (V1 atau to-be is/am/are) karena menyatakan fakta yang ada saat ini."
  },
  {
    id: 3,
    question: "Apa dua bagian utama (struktur) dari Descriptive Text?",
    options: [
      "Identification and Description",
      "Orientation and Complication",
      "Opening and Closing",
      "Goal and Steps"
    ],
    correctIndex: 0,
    explanation: "Struktur teks deskriptif terdiri dari 1) Identification (mengenalkan objek) dan 2) Description (menjelaskan ciri-ciri fisiknya)."
  },
  {
    id: 4,
    question: "Which adjective is correct to describe an elephant?",
    options: [
      "Small and light",
      "Fast and tiny",
      "Big and heavy",
      "Thin and weak"
    ],
    correctIndex: 2,
    explanation: "Gajah (elephant) memiliki tubuh yang sangat besar (big) dan berat (heavy)."
  },
  {
    id: 5,
    question: "Read the sentence: 'My cat has soft fur.' The word 'soft' means...",
    options: [
      "Keras",
      "Kasar",
      "Halus atau Lembut",
      "Tajam"
    ],
    correctIndex: 2,
    explanation: "Kucing biasanya memiliki bulu (fur) yang halus dan lembut (soft)."
  },
  {
    id: 6,
    question: "Kata sifat (adjectives) apa yang tepat untuk menggambarkan teman yang baik?",
    options: [
      "Lazy and angry",
      "Friendly and kind",
      "Fierce and wild",
      "Slow and weak"
    ],
    correctIndex: 1,
    explanation: "Seorang teman yang baik biasanya ramah (friendly) dan baik hati (kind)."
  },
  {
    id: 7,
    question: "Lengkapi kalimat berikut: 'A cheetah is a very ____ animal.'",
    options: [
      "Slow",
      "Fast",
      "Tame",
      "Heavy"
    ],
    correctIndex: 1,
    explanation: "Cheetah dikenal sebagai hewan darat yang sangat cepat (fast)."
  },
  {
    id: 8,
    question: "Choose the correct To-Be: 'He ____ tall and handsome.'",
    options: [
      "is",
      "am",
      "are",
      "have"
    ],
    correctIndex: 0,
    explanation: "Untuk subjek tunggal 'He' (Dia laki-laki), kata kerja bantu (to-be) yang tepat adalah 'is'."
  },
  {
    id: 9,
    question: "Lengkapi kalimat berikut: 'I ____ a cute rabbit at home.'",
    options: [
      "has",
      "is",
      "are",
      "have"
    ],
    correctIndex: 3,
    explanation: "Untuk subjek 'I', kata kerja kepemilikan yang tepat adalah 'have' (Saya memiliki)."
  },
  {
    id: 10,
    question: "Which of these words is NOT an adjective?",
    options: [
      "Beautiful",
      "Tall",
      "Run",
      "Smart"
    ],
    correctIndex: 2,
    explanation: "'Run' (berlari) adalah kata kerja (verb), bukan kata sifat (adjective)."
  }
];

class QuizManager {
  constructor() {
    this.questions = QUIZ_QUESTIONS;
    this.currentIndex = 0;
    this.userAnswers = Array(QUIZ_QUESTIONS.length).fill(null);
    this.quizStarted = false;
    this.quizFinished = false;
    this.score = 0;
    this.timerSeconds = 0;
    this.timerInterval = null;
  }

  startQuiz() {
    if (window.authManager && !window.authManager.isStudent() && !window.authManager.isTeacher()) {
      alert("Harap masuk (login) terlebih dahulu untuk memulai kuis dan menyimpan nilai Anda.");
      if (typeof window.openAuthModal === 'function') {
        window.openAuthModal();
      }
      return;
    }

    this.currentIndex = 0;
    this.userAnswers = Array(this.questions.length).fill(null);
    this.quizStarted = true;
    this.quizFinished = false;
    this.score = 0;
    this.timerSeconds = 0;

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay();
    }, 1000);

    const quizIntro = document.getElementById('quiz-intro-box');
    const quizCard = document.getElementById('quiz-question-card');
    const quizResult = document.getElementById('quiz-result-card');

    if (quizIntro) quizIntro.classList.add('hidden');
    if (quizResult) quizResult.classList.add('hidden');
    if (quizCard) quizCard.classList.remove('hidden');

    this.renderCurrentQuestion();
  }

  updateTimerDisplay() {
    const timerEl = document.getElementById('quiz-timer-text');
    if (timerEl) {
      const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
      const secs = (this.timerSeconds % 60).toString().padStart(2, '0');
      timerEl.textContent = `⏱️ ${mins}:${secs}`;
    }
  }

  renderCurrentQuestion() {
    const q = this.questions[this.currentIndex];
    const qNumEl = document.getElementById('quiz-q-num');
    const qTextEl = document.getElementById('quiz-q-text');
    const optionsContainer = document.getElementById('quiz-options-container');
    const qProgressEl = document.getElementById('quiz-progress-bar-fill');
    const prevBtn = document.getElementById('btn-quiz-prev');
    const nextBtn = document.getElementById('btn-quiz-next');

    if (!q || !qTextEl || !optionsContainer) return;

    if (qNumEl) qNumEl.textContent = `Question ${this.currentIndex + 1} of ${this.questions.length}`;
    qTextEl.innerHTML = q.question;

    if (qProgressEl) {
      const progressPercent = ((this.currentIndex + 1) / this.questions.length) * 100;
      qProgressEl.style.width = `${progressPercent}%`;
    }

    const currentSelected = this.userAnswers[this.currentIndex];

    optionsContainer.innerHTML = '';
    q.options.forEach((optText, optIdx) => {
      const optBtn = document.createElement('button');
      optBtn.className = `quiz-option-btn ${currentSelected === optIdx ? 'selected' : ''}`;
      optBtn.innerHTML = `
        <span class="option-letter">${String.fromCharCode(65 + optIdx)}</span>
        <span class="option-text">${optText}</span>
      `;
      optBtn.onclick = () => {
        this.selectAnswer(optIdx);
      };
      optionsContainer.appendChild(optBtn);
    });

    if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
    if (nextBtn) {
      if (this.currentIndex === this.questions.length - 1) {
        nextBtn.innerHTML = 'Finish & Submit 🏆';
        nextBtn.className = 'btn btn-accent';
      } else {
        nextBtn.innerHTML = 'Next Question ➔';
        nextBtn.className = 'btn btn-primary';
      }
    }
  }

  selectAnswer(optIdx) {
    this.userAnswers[this.currentIndex] = optIdx;
    window.soundEngine.playTileClick();
    this.renderCurrentQuestion();
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderCurrentQuestion();
    }
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.renderCurrentQuestion();
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz() {
    clearInterval(this.timerInterval);
    this.quizFinished = true;

    // Calculate score (each question = 10 points)
    let correctCount = 0;
    this.questions.forEach((q, idx) => {
      if (this.userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    this.score = Math.round((correctCount / this.questions.length) * 100);

    const quizCard = document.getElementById('quiz-question-card');
    const quizResult = document.getElementById('quiz-result-card');

    if (quizCard) quizCard.classList.add('hidden');
    if (quizResult) quizResult.classList.remove('hidden');

    window.soundEngine.playVictoryFanfare();

    this.renderQuizResults(correctCount);
  }

  renderQuizResults(correctCount) {
    const scoreValEl = document.getElementById('result-score-val');
    const scoreSummaryEl = document.getElementById('result-score-summary');
    const reviewListEl = document.getElementById('quiz-review-list');
    const badgeEl = document.getElementById('result-achievement-badge');

    if (scoreValEl) scoreValEl.textContent = `${this.score}/100`;

    let grade = 'A';
    let feedbackMsg = '';
    let badgeText = '🏆 Master of Descriptive Text';

    if (this.score >= 85) {
      grade = 'A (Sangat Baik / Outstanding)';
      feedbackMsg = 'Luar biasa! Pemahaman konsep Descriptive Text dan kosakata bahasa Inggris Anda sangat matang!';
      badgeText = '🌟 Scrabble & Descriptive Grandmaster';
    } else if (this.score >= 70) {
      grade = 'B (Baik / Competent)';
      feedbackMsg = 'Bagus sekali! Anda telah menguasai kaidah struktur dan kata sifat deskriptif dengan baik.';
      badgeText = '🥈 Descriptive Explorer';
    } else {
      grade = 'C (Perlu Remedial / Developing)';
      feedbackMsg = 'Tetap semangat! Anda dapat mempelajari kembali materi Generic Structure dan kamus kosakata pada halaman Beranda.';
      badgeText = '🌱 Junior Learner';
    }

    if (scoreSummaryEl) {
      scoreSummaryEl.innerHTML = `
        <p>Benar: <strong>${correctCount}</strong> dari ${this.questions.length} soal | Predikat: <strong>${grade}</strong></p>
        <p class="feedback-desc">${feedbackMsg}</p>
      `;
    }

    if (badgeEl) badgeEl.textContent = badgeText;

    // Automatically record student quiz result for teacher dashboard
    if (typeof window.recordStudentQuizResult === 'function') {
      window.recordStudentQuizResult(this.score, grade);
    }

    // Auto-update certificate student name input if student logged in
    const certInput = document.getElementById('cert-student-name');
    if (certInput && window.authManager && window.authManager.isStudent()) {
      certInput.value = `${window.authManager.username} (${window.authManager.studentClass})`;
    }

    // Render Review of all questions
    if (reviewListEl) {
      reviewListEl.innerHTML = this.questions.map((q, idx) => {
        const userAns = this.userAnswers[idx];
        const isCorrect = userAns === q.correctIndex;
        const userAnsText = userAns !== null ? q.options[userAns] : 'Belum Dijawab';
        const correctAnsText = q.options[q.correctIndex];

        return `
          <div class="review-item ${isCorrect ? 'correct-item' : 'wrong-item'}">
            <div class="review-header">
              <span class="q-badge">${idx + 1}</span>
              <strong>${q.question}</strong>
              <span class="status-tag">${isCorrect ? '✔ Benar (+10)' : '✖ Salah'}</span>
            </div>
            <p class="ans-line">Jawaban Anda: <span class="${isCorrect ? 'text-success' : 'text-danger'}">${userAnsText}</span></p>
            ${!isCorrect ? `<p class="ans-line">Kunci Jawaban: <span class="text-success">${correctAnsText}</span></p>` : ''}
            <div class="explanation-box">
              💡 <strong>Pembahasan:</strong> ${q.explanation}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  /* =========================================================================
   * CERTIFICATE GENERATOR (HTML5 Canvas)
   * ========================================================================= */
  generateCertificate(studentName = 'Siswa Kelas 7 SMP') {
    const canvas = document.getElementById('certificate-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 600;

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 900, 600);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e1b4b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 900, 600);

    // Decorative Borders
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.strokeRect(25, 25, 850, 550);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 35, 830, 530);

    // Corner Ornaments
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(20, 20, 16, 16);
    ctx.fillRect(864, 20, 16, 16);
    ctx.fillRect(20, 564, 16, 16);
    ctx.fillRect(864, 564, 16, 16);

    // Header Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 24px Outfit, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF ACADEMIC ACHIEVEMENT', 450, 90);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px Outfit, Inter, sans-serif';
    ctx.fillText('PENGEMBANGAN MULTIMEDIA PEMBELAJARAN (MTP 2026)', 450, 120);

    // Subtitle
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px Outfit, Inter, sans-serif';
    ctx.fillText('This certificate is proudly awarded to:', 450, 175);

    // Student Name
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px Outfit, Playfair Display, serif';
    ctx.fillText(studentName.toUpperCase(), 450, 230);

    // Divider Line under name
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(250, 248);
    ctx.lineTo(650, 248);
    ctx.stroke();

    // Achievement Description
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16px Outfit, Inter, sans-serif';
    ctx.fillText('For demonstrating outstanding competence and vocabulary mastery in', 450, 290);
    
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px Outfit, Inter, sans-serif';
    ctx.fillText('ENGLISH DESCRIPTIVE TEXT & SCRABBLE CHALLENGE (GRADE 7 SMP)', 450, 325);

    // Score Box
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(360, 360, 180, 55);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(360, 360, 180, 55);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px Outfit, Inter, sans-serif';
    ctx.fillText(`SCORE: ${this.score}/100`, 450, 396);

    // Date and Signatures
    const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Outfit, Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Date: ${dateStr}`, 80, 480);
    ctx.fillText('Media: Project Tataa Interactive Scrabble', 80, 505);

    ctx.textAlign = 'right';
    ctx.fillText('Course: Pengembangan Multimedia', 820, 480);
    ctx.fillText('Instructor / Penguji: Dosen Pengampu MTP', 820, 505);

    // Verified Seal
    ctx.beginPath();
    ctx.arc(450, 490, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px Outfit, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED', 450, 487);
    ctx.fillText('GRADE 7 SMP', 450, 499);
  }

  downloadCertificate() {
    const canvas = document.getElementById('certificate-canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `Certificate_Descriptive_Scrabble_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

// Global Quiz Manager Instance
window.quizManager = new QuizManager();
