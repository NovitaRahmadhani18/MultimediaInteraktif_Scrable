# Descriptive Scrabble Adventure - Media Pembelajaran Bahasa Inggris SMP Kelas 7

> **Topik Utama:** Descriptive Text (Kurikulum Merdeka - SMP Kelas 7)  
> **Integrasi Gamifikasi:** English Scrabble Adventure & Audio Synthesis

---

## 🌟 Tentang Aplikasi
**Descriptive Scrabble Adventure** adalah media pembelajaran interaktif berbasis web yang memadukan modul pembelajaran teks terstruktur, video penjelasan terfokus, dan gamifikasi *Scrabble* untuk menguasai materi *Descriptive Text* bahasa Inggris kelas 7 SMP.

---

## 📑 Struktur Halaman & Menu

1. **1. 🏠 Beranda (Home):**
   - Pengantar materi *Descriptive Text* dengan ubin Scrabble beranimasi.
   - 4 Pilar Karakteristik Objek (*Describing People, Animals, Places, Things*).
   - Kamus kosakata interaktif terbagi 4 kategori dilengkapi audio pelafalan asli (*Web Speech API*) dan nilai poin Scrabble.

2. **2. 📖 Materi Teks (Text-based Learning Material):**
   - **Bab 1:** Definisi & Fungsi Sosial (*To describe a particular entity in detail*).
   - **Bab 2:** Struktur Teks (*Generic Structure: Identification & Description*).
   - **Bab 3:** Kaidah Kebahasaan (*Language Features: Simple Present Tense nominal & verbal, Adjective classifications, Sensory Verbs*).
   - **Bab 4:** 4 Contoh Teks Nyata Beranotasi & Bersuara (*Person, Animal, Place, Object*).
   - **Bab 5:** Checklist Kiat Sukses Menulis Descriptive Text.

3. **3. 🎮 Produk Game (Interactive Scrabble Game Engine):**
   - **Mode A (Tantangan Petunjuk Level):** Menyusun huruf berdasarkan deskripsi kontekstual dengan petunjuk (*Hint*) dan audio kalimat contoh.
   - **Mode B (Papan Scrabble 15x15 Klasik):** Ubin bonus pengali (DL, TL, DW, TW), rak 7 ubin pemain, fitur acak/tukar, kamus kata deskriptif, dan skor otomatis.
   - **Mode C (Mini-Lab Kalimat Deskriptif):** Praktik menyusun kalimat *Simple Present Tense* berpola *Subject + Verb to-be/has + Adjective*.
   - **Sidebar Kata Terpecahkan:** Menyimpan daftar kata yang berhasil dibentuk siswa.

4. **4. 🎥 Video Penjelasan (Single Focused Explanatory Video):**
   - Video penjelasan komprehensif konsep, struktur, dan kaidah kebahasaan *Descriptive Text* kelas 7 SMP dilengkapi rangkuman 4 poin inti.

5. **5. 📝 Penilaian (Assessment & Evaluation):**
   - Kuis interaktif 10 soal pilihan ganda standar kurikulum dengan pembahasan langsung dan *timer*.
   - **Generator Sertifikat Prestasi (Canvas):** Otomatis mencantumkan nama siswa, skor perolehan, tanggal, serta tombol unduh format **PNG**.
   - Rubrik Penilaian Keterampilan Siswa (kalkulator nilai guru/siswa).

---

## 🚀 Panduan Menjalankan di Localhost

Aplikasi ini dibuat menggunakan standar web (**HTML5, CSS3, Vanilla JavaScript ES6+**) tanpa *node_modules* eksternal yang rumit, sehingga dapat dijalankan dengan mudah:

### Cara 1: Menggunakan Node.js / NPX (Rekomendasi)
```bash
npx serve -l 3000 .
```
atau
```bash
npm start
```
Buka peramban di: **`http://localhost:3000`**

---

### Cara 2: Menggunakan Python
```bash
python -m http.server 3000
```
Buka peramban di: **`http://localhost:3000`**

---

### Cara 3: Langsung Buka File (Offline / Standalone)
Klik ganda (double-click) file **`index.html`** di Windows File Explorer. Semua fitur audio (*Web Audio API* dan *Web Speech API*), modul teks, game Scrabble, dan kuis berjalan 100% tanpa kendala!

---

## 📂 Struktur Berkas
```
Project_tataa/
├── index.html            # Berkas HTML utama (Beranda, Materi, Produk, Video, Penilaian)
├── package.json          # Konfigurasi localhost server
├── README.md             # Dokumentasi & panduan
├── css/
│   └── style.css         # Styling Glassmorphism modern & responsif
└── js/
    ├── audio.js          # Web Audio API synthesizer & Web Speech API
    ├── dictionary.js     # Bank kosakata deskriptif & skor Scrabble
    ├── scrabble.js       # Game Engine Scrabble (Board, Challenge, Sentence)
    ├── quiz.js           # Kuis 10 soal, Rubrik & Generator Sertifikat Canvas
    └── app.js            # Router navigasi SPA & orchestrator interaktif
```
