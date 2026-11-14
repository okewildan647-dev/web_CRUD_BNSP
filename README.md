# SIM Mahasiswa — Panduan Alur Kerja Aplikasi

Dokumen ini menjelaskan **cara kerja aplikasi secara keseluruhan** (bukan hanya login): dari aplikasi dibuka, proses login dan token, pengambilan data mahasiswa, tambah/edit/detail/hapus, sampai logout. Semua penjelasan mengacu pada kode yang ada di folder `backend/` dan `frontend/`.

## Daftar Isi

1. [Gambaran Proyek](#1-gambaran-proyek)
2. [Teknologi yang Digunakan](#2-teknologi-yang-digunakan)
3. [Struktur Folder](#3-struktur-folder)
4. [Cara Menjalankan Proyek](#4-cara-menjalankan-proyek)
5. [Arsitektur Umum](#5-arsitektur-umum)
6. [Alur Kerja Saat Aplikasi Dibuka](#6-alur-kerja-saat-aplikasi-dibuka)
7. [Alur Login Secara Detail](#7-alur-login-secara-detail)
8. [Kenapa Ada Token (JWT)](#8-kenapa-ada-token-jwt)
9. [Cara Token Dipakai Setelah Login](#9-cara-token-dipakai-setelah-login)
10. [Alur CRUD Data Mahasiswa](#10-alur-crud-data-mahasiswa)
11. [Alur Logout](#11-alur-logout)
12. [Peta Endpoint API](#12-peta-endpoint-api)
13. [Format Response dan Penanganan Error](#13-format-response-dan-penanganan-error)
14. [Struktur Database](#14-struktur-database)
15. [Validasi Berlapis](#15-validasi-berlapis)
16. [Catatan Penting Kondisi Kode Saat Ini](#16-catatan-penting-kondisi-kode-saat-ini)
17. [Ringkasan Alur dalam Satu Paragraf](#17-ringkasan-alur-dalam-satu-paragraf)
18. [Istilah Penting](#18-istilah-penting)

---

## 1. Gambaran Proyek

**SIM Mahasiswa** adalah aplikasi web sederhana untuk mengelola data mahasiswa:

- **Frontend** (React + TypeScript + Vite + Tailwind) menampilkan halaman login, dashboard statistik, daftar mahasiswa, form tambah, halaman detail, dan form edit.
- **Backend** (Express + TypeScript) menyediakan REST API untuk autentikasi dan CRUD data mahasiswa.
- **Database** PostgreSQL menyimpan tabel `users` (akun login) dan `mahasiswa` (data mahasiswa).

Poin penting: aplikasi ini memakai **JWT (JSON Web Token)** sebagai bukti autentikasi. Setelah login berhasil, backend mengirim token; frontend menyimpannya dan (secara desain) mengirimkannya pada request berikutnya melalui header `Authorization: Bearer <token>`.

---

## 2. Teknologi yang Digunakan

| Bagian | Teknologi | Keterangan |
|---|---|---|
| Backend runtime | Node.js + TypeScript (ESM) | `"type": "module"` di `backend/package.json`, import memakai akhiran `.js` |
| Web framework | Express 5 | `backend/src/app.ts` |
| Database | PostgreSQL + `pg` (Pool) | `backend/src/config/database.ts` |
| Hash password | `bcrypt` | `backend/src/services/authService.ts` |
| Token | `jsonwebtoken` | `backend/src/utils/token.ts` |
| CORS | `cors` | `app.use(cors())` — semua origin diizinkan |
| Frontend | React 19 + TypeScript + Vite | `frontend/` |
| Routing | `react-router-dom` v7 | `frontend/src/App.tsx` |
| HTTP client | `axios` | `frontend/src/services/mahasiswaService.ts` |
| Styling | Tailwind CSS v4 | `frontend/src/index.css` |
| Ikon | `lucide-react` | komponen UI |

---

## 3. Struktur Folder

```text
websaite/
├─ README.md
├─ backend/
│  ├─ .env                  # konfigurasi rahasia (DB, JWT) — JANGAN di-commit
│  ├─ .env.example          # saat ini kosong
│  ├─ .gitidnore            # typo dari .gitignore
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ src/
│     ├─ server.ts          # entry point: load env, tes DB, jalankan server
│     ├─ app.ts             # konfigurasi Express + pemasangan routes
│     ├─ config/
│     │  └─ database.ts     # Pool PostgreSQL + testConnection()
│     ├─ routes/
│     │  ├─ authRoutes.ts       # /api/auth/*
│     │  └─ mahasiswaRoutes.ts  # /api/mahasiswa/*
│     ├─ controllers/
│     │  ├─ authController.ts       # logika login, me, dashboard
│     │  └─ mahasiswaControllers.ts # validasi request + response CRUD
│     ├─ services/
│     │  ├─ authService.ts       # query user + bcrypt.compare
│     │  └─ mahasiswaServices.ts # query CRUD ke PostgreSQL
│     ├─ middleware/
│     │  ├─ authMiddleware.ts    # verifikasi Bearer token
│     │  └─ refreshMiddleware.ts # masih KOSONG (belum dipakai)
│     ├─ utils/
│     │  └─ token.ts             # generateToken & verifyToken
│     ├─ types/
│     │  └─ mahasiswa.ts         # tipe Mahasiswa & MahasiswaInput
│     └─ scripts/
│        └─ createUser.ts        # script membuat akun login (manual)
└─ frontend/
   ├─ .env                  # VITE_API_URL
   ├─ vite.config.ts
   ├─ package.json
   └─ src/
      ├─ main.tsx           # bootstrap React + BrowserRouter + AuthProvider
      ├─ App.tsx            # definisi route + route guard
      ├─ index.css
      ├─ context/
      │  └─ AuthContext.tsx # state user/token, login(), logout()
      ├─ services/
      │  ├─ Api.ts              # axios + interceptor Bearer (BELUM diimport siapa pun)
      │  └─ mahasiswaService.ts # axios instance CRUD (tanpa interceptor token)
      ├─ pages/
      │  ├─ login.tsx
      │  ├─ Dashboard.tsx
      │  ├─ Mahasiswa.tsx
      │  ├─ TambahMahasiswa.tsx
      │  ├─ DetailMahasiswa.tsx
      │  └─ EditMahasiswa.tsx
      ├─ layouts/
      │  └─ AdminLayout.tsx  # sidebar + navbar + <Outlet/>
      ├─ components/         # Sidebar, Navbar, StatCard, Toast, DeleteModal, Loading,
      │                      # MahasiswaForm, MahasiswaTable
      ├─ types/
      │  └─ mahasiswa.ts
      └─ utils/
         └─ format.ts        # formatTanggal(), getInitials()
```

---

## 4. Cara Menjalankan Proyek

### 4.1 Prasyarat

- Node.js dan npm
- PostgreSQL yang berjalan
- Dua tabel: `public.users` dan `public.mahasiswa` (lihat [Struktur Database](#14-struktur-database))

### 4.2 Konfigurasi Backend

Buat/isi `backend/.env`:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password_anda
DB_NAME=nama_database

JWT_SECRET=ganti_dengan_secret_panjang_dan_acak
JWT_EXPIRES_IN=1d
```

Catatan:
- `JWT_SECRET` **wajib** ada. Jika tidak, `generateToken`/`verifyToken` akan melempar error (`backend/src/utils/token.ts`).
- `JWT_EXPIRES_IN` opsional; default `1d`.
- `backend/.env` saat ini juga memuat `JWT_REFRESH_SECRET` dan `JWT_REFRESH_EXPIRES_IN`, tetapi **belum dipakai** oleh kode mana pun (refresh token belum diimplementasikan).

### 4.3 Menjalankan Backend

```bash
cd backend
npm install
npm run dev
```

- `npm run dev` menjalankan `tsx watch src/server.ts`.
- `server.ts` memanggil `testConnection()` dulu. Jika koneksi PostgreSQL gagal, proses langsung `process.exit(1)` (server tidak jalan).
- Jika berhasil, log: `Server berjalan di http://localhost:5000` dan `PostgreSQL berhasil terhubung!`.
- Build produksi: `npm run build` lalu `npm start` (menjalankan `dist/server.js`).

### 4.4 Membuat Akun Login Pertama

Belum ada halaman registrasi. Akun dibuat lewat script `backend/src/scripts/createUser.ts`:

```bash
cd backend
npx tsx src/scripts/createUser.ts
```

Isi script saat ini (hardcoded):

- `idMhs = 8` → **baris mahasiswa dengan `id = 8` harus sudah ada**.
- `email = 'admin@kampus.ac.id'`
- `password = 'Admin12345'`
- Password di-hash dengan `bcrypt.hash(password, 10)`, lalu di-`INSERT` ke `public.users`.

Script akan menolak jika mahasiswa tidak ditemukan atau email sudah terdaftar.

### 4.5 Konfigurasi dan Menjalankan Frontend

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
cd frontend
npm install
npm run dev
```

Vite berjalan default di `http://localhost:5173`. Build: `npm run build` (menjalankan `tsc --noEmit` lalu `vite build`).

### 4.6 Urutan Menyalakan

1. PostgreSQL aktif dan tabel tersedia.
2. Backend jalan (port 5000).
3. Frontend jalan (port 5173).
4. Buka browser → diarahkan ke `/login` → login dengan akun dari script.

---

## 5. Arsitektur Umum

```mermaid
flowchart LR
    subgraph Browser
        U[User] --> R[React App]
        R --> AC[AuthContext + localStorage]
        R --> AX[Axios mahasiswaService]
    end

    subgraph Backend["Backend Express :5000"]
        APP[app.ts]
        APP --> AR[/api/auth/]
        APP --> MR[/api/mahasiswa/]
        AR --> ACtrl[authController]
        ACtrl --> ASvc[authService]
        ACtrl --> TOK[token.ts JWT]
        AR --> MW[authMiddleware]
        MR --> MCtrl[mahasiswaControllers]
        MCtrl --> MSvc[mahasiswaServices]
    end

    AX -->|HTTP JSON| APP
    ASvc --> DB[(PostgreSQL)]
    MSvc --> DB
```

Prinsip pemisahan lapisan di backend:

| Lapisan | Tanggung jawab | Contoh file |
|---|---|---|
| Route | Menentukan URL + method + middleware | `routes/authRoutes.ts`, `routes/mahasiswaRoutes.ts` |
| Middleware | Pemeriksaan sebelum controller (token) | `middleware/authMiddleware.ts` |
| Controller | Validasi input, memanggil service, menyusun response | `controllers/*.ts` |
| Service | Query database / logika data | `services/*.ts` |
| Config/Utils | Koneksi DB, pembuatan token | `config/database.ts`, `utils/token.ts` |

Di frontend, pemisahannya:

| Lapisan | Tanggung jawab | Contoh file |
|---|---|---|
| Entry & routing | Bootstrap React, definisi URL halaman, route guard | `main.tsx`, `App.tsx` |
| State global | Menyimpan user/token & status login | `context/AuthContext.tsx` |
| Service | Memanggil API & menormalkan data | `services/mahasiswaService.ts` |
| Page | Mengatur state halaman, memanggil service, render UI | `pages/*.tsx` |
| Component | Bagian UI yang dapat dipakai ulang | `components/*.tsx` |
| Utils | Fungsi bantu format | `utils/format.ts` |

---

## 6. Alur Kerja Saat Aplikasi Dibuka

1. **`frontend/src/main.tsx`** menjalankan React dan membungkus `App` dengan `BrowserRouter` dan `AuthProvider`.
2. **`AuthProvider`** (`context/AuthContext.tsx:30`) membaca `localStorage` saat inisialisasi:
   - `user` ← `localStorage.getItem('user')` (di-`JSON.parse`, jika rusak dihapus).
   - `token` ← `localStorage.getItem('token')`.
3. Nilai turunan `isAuthenticated = Boolean(token && user)` (`AuthContext.tsx:70`).
4. **`App`** (`App.tsx:36`) memakai `isAuthenticated` untuk menentukan route:
   - Belum login + membuka `/login` → tampilkan halaman Login.
   - Sudah login + membuka `/login` → redirect ke `/dashboard`.
   - Belum login + membuka route lain (`/dashboard`, `/mahasiswa`, dst.) → redirect ke `/login`.
   - Sudah login + route di dalam `AdminLayout` → tampilkan halaman di dalam layout.
5. **`AdminLayout`** menampilkan `Sidebar`, `Navbar`, `<Outlet/>` (isi halaman), dan footer.

Penting dipahami: **route guard di frontend hanya memeriksa ada/tidaknya `token` dan `user` di localStorage**. Frontend tidak memanggil server untuk memastikan token masih valid/kedaluwarsa. Validasi token yang sebenarnya terjadi di backend saat endpoint terproteksi dipanggil.

```mermaid
flowchart TD
    A[App dibuka] --> B{localStorage punya user & token?}
    B -- Tidak --> C[/login]
    B -- Ya --> D[/dashboard]
    C -->|login berhasil| D
    D --> E[AdminLayout + halaman]
```

---

## 7. Alur Login Secara Detail

### 7.1 Diagram Sekuens

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant L as login.tsx
    participant AC as AuthContext
    participant B as Backend /api/auth/login
    participant S as authService
    participant DB as PostgreSQL
    participant T as token.ts

    U->>L: Isi email & password, klik Login
    L->>B: POST /api/auth/login { email, password }
    B->>B: Validasi tipe & isi field
    alt Input tidak valid
        B-->>L: 400 { success:false, message }
    else Input valid
        B->>S: loginUser(email, password)
        S->>DB: SELECT users JOIN mahasiswa WHERE email
        DB-->>S: Baris user (termasuk hash password) / kosong
        alt Email tidak ada
            S-->>B: null
            B-->>L: 401 { success:false, message }
        else Email ada
            S->>S: bcrypt.compare(password, hash)
            alt Password salah
                S-->>B: null
                B-->>L: 401 { success:false, message }
            else Password benar
                S-->>B: data user tanpa password
                B->>T: generateToken({uuid,email})
                T-->>B: JWT string
                B-->>L: 200 { success:true, data:{ user, token } }
                L->>AC: login(user, token)
                AC->>AC: localStorage.setItem('user'), setItem('token')
                AC-->>L: state user & token terisi
                L->>U: navigate('/dashboard')
            end
        end
    end
```

### 7.2 Langkah demi Langkah

**Langkah 1 — User submit form**
File: `frontend/src/pages/login.tsx`

- State lokal: `email`, `password`, `loading`, `error`.
- Saat submit, `handleLogin` mencegah reload (`e.preventDefault()`), mengosongkan error, dan set `loading = true`.
- Memanggil:
  ```http
  POST http://localhost:5000/api/auth/login
  Content-Type: application/json

  { "email": "...", "password": "..." }
  ```
  Base URL diambil dari `import.meta.env.VITE_API_URL` atau default `http://localhost:5000/api`.

**Langkah 2 — Backend menerima request**
File: `backend/src/controllers/authController.ts:6` (`login`)

- `express.json()` di `app.ts` sudah mem-parse body JSON.
- Validasi: `email` dan `password` harus string dan tidak kosong.
- Jika gagal → `400`:
  ```json
  { "success": false, "message": "Email dan password wajib diisi." }
  ```

**Langkah 3 — Verifikasi ke database**
File: `backend/src/services/authService.ts:24` (`loginUser`)

Query yang dijalankan:

```sql
SELECT
  u.uuid::text AS uuid,
  u.email,
  u.password,
  u.id_mhs,
  m.nim,
  m.nama_mahasiswa,
  m.kelas
FROM public.users u
INNER JOIN public.mahasiswa m ON u.id_mhs = m.id
WHERE LOWER(u.email) = LOWER($1)
  AND u.deleted_at IS NULL
LIMIT 1;
```

Yang perlu dipahami dari query ini:
- Email dicari **case-insensitive** (`LOWER(...)`), dan di-trim.
- `INNER JOIN` berarti akun hanya ditemukan jika `users.id_mhs` punya pasangan di `mahasiswa`. Jika data mahasiswa tidak ada, login dianggap gagal.
- `deleted_at IS NULL` = akun yang di-soft-delete tidak bisa login.
- Password **tidak** dibandingkan di SQL. Hash diambil, lalu dibandingkan dengan bcrypt.

Jika email tidak ditemukan → fungsi mengembalikan `null` → controller membalas `401`.

**Langkah 4 — Cek password dengan bcrypt**

```ts
const passwordValid = await bcrypt.compare(password, user.password);
```

- Password asli dari form **tidak pernah disimpan** dan tidak pernah dikirim balik.
- Hash di database dibuat dengan `bcrypt.hash(password, 10)` (lihat `createUser.ts`).
- `bcrypt.compare` mengembalikan `true/false`. Jika `false` → `null` → `401`.

**Langkah 5 — Bentuk data user yang dikembalikan**

`loginUser` mengembalikan objek **tanpa** field `password`:

```json
{
  "uuid": "…",
  "email": "admin@kampus.ac.id",
  "id_mhs": 8,
  "nim": "…",
  "nama_mahasiswa": "…",
  "kelas": "…"
}
```

**Langkah 6 — Membuat token JWT**
File: `backend/src/controllers/authController.ts` (sekitar baris 39) → `utils/token.ts:20`

```ts
const token = generateToken({ uuid: user.uuid, email: user.email });
```

Detail pembuatan token:
- Payload berisi `email`.
- `subject` (`sub`) diisi `uuid` pengguna.
- Ditandatangani dengan `JWT_SECRET` (algoritma default `jsonwebtoken`, yaitu HS256).
- Masa berlaku `JWT_EXPIRES_IN` (default `1d`).

**Langkah 7 — Response sukses**

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "user": { "uuid": "…", "email": "…", "id_mhs": 8, "nim": "…", "nama_mahasiswa": "…", "kelas": "…" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.…"
  }
}
```

**Langkah 8 — Frontend menyimpan hasil login**
File: `frontend/src/pages/login.tsx` → `frontend/src/context/AuthContext.tsx:49`

- `login(user, token)` dipanggil.
- Di `AuthContext`:
  - `localStorage.setItem('user', JSON.stringify(userData))`
  - `localStorage.setItem('token', jwtToken)`
  - `setUser(userData)` dan `setToken(jwtToken)`
- `isAuthenticated` otomatis menjadi `true`.
- `navigate('/dashboard')` (`login.tsx:53`).

**Langkah 9 — Jika gagal**

- `axios.isAxiosError(err)` → tampilkan `err.response?.data?.message` (mis. "Email atau password salah.").
- Jika jaringan/server mati → pesan fallback "Login gagal. Periksa koneksi backend."
- `loading` dikembalikan `false` di `finally`.

### 7.3 Ringkasan Kondisi HTTP pada Login

| Kondisi | Status | Efek |
|---|---|---|
| Email/password kosong atau bukan string | `400` | Pesan validasi |
| Email tidak ditemukan / password salah | `401` | "Email atau password salah." |
| DB/query error | `500` | "Terjadi kesalahan pada server." |
| Berhasil | `200` | `user` + `token` |

Catatan keamanan: pesan untuk "email tidak ditemukan" dan "password salah" **sengaja disamakan** agar penyerang tidak bisa menebak email mana yang terdaftar (mencegah user enumeration).

---

## 8. Kenapa Ada Token (JWT)

### 8.1 Masalah yang Diselesaikan

HTTP bersifat **stateless**: setiap request berdiri sendiri, server tidak otomatis "ingat" siapa yang mengirim request sebelumnya. Setelah user login, server butuh cara untuk mengenali request berikutnya **tanpa meminta password berulang kali**.

Ada dua pendekatan umum:
1. **Session** di server (server menyimpan data sesi, browser menyimpan cookie ID sesi).
2. **Token** (server memberi token bertanda tangan; browser menyimpan dan mengirim token; server cukup memverifikasi tanda tangan).

Proyek ini memakai pendekatan **token JWT (stateless)**.

### 8.2 Analogi Sederhana

- Login = menunjukkan KTP dan password ke petugas.
- Token = **gelang akses** yang diberikan petugas setelah identitas diverifikasi.
- Request berikutnya = cukup tunjukkan gelang, tidak perlu menunjukkan KTP dan password lagi.
- Tanda tangan digital pada gelang = membuat gelang sulit dipalsukan.
- Masa berlaku (`exp`) = gelang kedaluwarsa, harus mengurus ulang.

### 8.3 Struktur JWT

JWT terdiri dari tiga bagian dipisah titik:

```text
header.payload.signature
```

| Bagian | Isi pada proyek ini | Sifat |
|---|---|---|
| Header | Algoritma & tipe token (mis. `HS256`, `JWT`) | Terbaca (base64url), bukan rahasia |
| Payload | `sub` = uuid user, `email`, `iat`, `exp` | **Terbaca**, jangan isi data sensitif |
| Signature | Hasil tanda tangan memakai `JWT_SECRET` | Tidak bisa dipalsukan tanpa secret |

Poin penting yang sering salah paham: **JWT bukan enkripsi**. Payload-nya hanya di-encode base64url sehingga bisa dibaca siapa pun yang memegang token. Yang dilindungi adalah **keaslian** (tidak bisa diubah tanpa terdeteksi), bukan kerahasiaan isi.

### 8.4 Isi Token di Proyek Ini

Dibuat oleh `utils/token.ts:20`:

```ts
jwt.sign(
  { email: user.email },
  getJwtSecret(),
  { subject: user.uuid, expiresIn }
);
```

| Claim | Nilai | Arti |
|---|---|---|
| `sub` | `uuid` pengguna | Identitas utama |
| `email` | email pengguna | Identitas tambahan |
| `iat` | waktu terbit | Dibuat otomatis oleh library |
| `exp` | `iat + JWT_EXPIRES_IN` | Batas waktu berlaku |

### 8.5 Siklus Hidup Token

```mermaid
flowchart LR
    A[Login valid] --> B[Server terbitkan token]
    B --> C[Frontend simpan di localStorage]
    C --> D[Request ke endpoint terproteksi]
    D --> E[Kirim header Authorization: Bearer token]
    E --> F{verifyToken}
    F -- valid --> G[req.user terisi, lanjut controller]
    F -- invalid/expired --> H[401, harus login ulang]
    G --> D
```

### 8.6 Kenapa Token Diverifikasi di Server, Bukan Dipercaya Begitu Saja

Frontend bisa saja mengirim header palsu. Karena itu backend:
1. Memastikan header ada dan berformat `Bearer <token>`.
2. Memanggil `jwt.verify(token, JWT_SECRET)` (`utils/token.ts:34`).
3. Memastikan `sub` dan `email` bertipe string.
4. Baru mengisi `req.user` dan melanjutkan ke controller.

Jika tanda tangan tidak cocok, token diubah, atau `exp` sudah lewat, `jwt.verify` melempar error → middleware membalas `401`.

### 8.7 Kelebihan dan Konsekuensi

| Kelebihan | Konsekuensi |
|---|---|
| Server tidak perlu menyimpan sesi (stateless) | Token yang sudah terbit tetap valid sampai kedaluwarsa; logout tidak otomatis membatalkannya di server |
| Mudah dipakai lintas request/endpoint | Token disimpan di localStorage → rentan dibaca jika ada XSS |
| Bisa membawa identitas ringkas (`sub`, `email`) | Payload bisa dibaca; jangan simpan data sensitif |
| Masa berlaku bisa diatur (`exp`) | Perlu strategi refresh/login ulang saat expired |

---

## 9. Cara Token Dipakai Setelah Login

### 9.1 Middleware `authenticateToken`
File: `backend/src/middleware/authMiddleware.ts:17`

Alurnya:

1. Ambil `req.headers.authorization`.
2. Jika tidak ada atau tidak diawali `"Bearer "` → `401` "Token tidak ditemukan. Silakan login terlebih dahulu."
3. Ambil token setelah spasi: `authHeader.split(' ')[1]`.
4. `verifyToken(token)`.
5. Ambil `decoded.sub` (uuid) dan `decoded.email`; pastikan keduanya string.
6. Set `req.user = { uuid, email }`.
7. Panggil `next()` → controller dijalankan.

Jika terjadi error apa pun → `401` "Token tidak valid atau sudah kedaluwarsa."

Endpoint yang memakai middleware ini (`routes/authRoutes.ts:13-14`):

```ts
router.get('/me', authenticateToken, getMe);
router.get('/dashboard', authenticateToken, dashboard);
```

- `GET /api/auth/me` → mengembalikan `req.user`.
- `GET /api/auth/dashboard` → contoh endpoint terproteksi; mengembalikan `uuid`, `email`, dan status "Terverifikasi menggunakan token JWT".

### 9.2 Header yang Benar

```http
GET /api/auth/me HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

Kesalahan umum:
- `Authorization: <token>` (tanpa `Bearer `) → ditolak.
- Token ditempel di body/query → tidak dibaca middleware.
- Ada spasi/huruf terpotong saat copy token → `401`.

### 9.3 Kondisi Implementasi di Frontend Saat Ini

Ada **dua** file service di frontend:

- `frontend/src/services/Api.ts` — axios dengan interceptor yang otomatis menambahkan:
  ```ts
  config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  ```
  Namun file ini **tidak diimport oleh file mana pun** (berdasarkan pencarian di `frontend/src`).
- `frontend/src/services/mahasiswaService.ts` — axios instance tersendiri untuk CRUD mahasiswa, **tanpa** interceptor token.

Selain itu `pages/login.tsx` memakai `axios.post` langsung, bukan instance di atas.

Artinya, dalam kondisi kode sekarang:
- Token **benar-benar diverifikasi** hanya jika endpoint `/api/auth/me` atau `/api/auth/dashboard` dipanggil dengan header Bearer (misalnya lewat Postman atau setelah `Api.ts` benar-benar dipakai).
- CRUD mahasiswa di frontend berjalan **tanpa** mengirim token, dan route `/api/mahasiswa/*` di backend juga **tidak** memasang `authenticateToken` (`routes/mahasiswaRoutes.ts:14-18`).
- Route guard frontend tetap mencegah navigasi jika `token`/`user` tidak ada di localStorage, tetapi itu hanya kontrol di sisi klien.

Bagian ini dijelaskan lebih lanjut di [Catatan Penting](#16-catatan-penting-kondisi-kode-saat-ini).

---

## 10. Alur CRUD Data Mahasiswa

Semua operasi mahasiswa melewati pola yang sama:

```text
Page (React)
  → mahasiswaService (axios)
    → Route /api/mahasiswa
      → Controller (validasi + response)
        → Service (SQL)
          → PostgreSQL
```

Response backend selalu dibungkus `{ success, message, data }`. `mahasiswaService` membongkar `data` dan menormalkannya (`normalizeMahasiswa`) supaya tipe konsisten (mis. `tanggal_lahir` dipotong 10 karakter, `keterangan` kosong menjadi `null`).

### 10.1 Ambil Daftar Mahasiswa (Dashboard & Halaman Data)

**Frontend**
- `pages/Dashboard.tsx` dan `pages/Mahasiswa.tsx` memanggil `getAllMahasiswa()` (`services/mahasiswaService.ts:96`) saat halaman dimuat (`useEffect`).
- `getAllMahasiswa` → `GET /api/mahasiswa`.

**Backend**
- Route: `GET /api/mahasiswa` (`routes/mahasiswaRoutes.ts:14`)
- Controller: `getMahasiswa` (`controllers/mahasiswaControllers.ts:58`)
- Service: `getAllMahasiswa` (`services/mahasiswaServices.ts:5`) → `SELECT * FROM public.mahasiswa ORDER BY id ASC`

**Response**

```json
{
  "success": true,
  "message": "Data mahasiswa berhasil diambil.",
  "data": [ { "id": 1, "nim": "2021001234", "nama_mahasiswa": "…", "…": "…" } ]
}
```

**Setelah data diterima**
- `Mahasiswa.tsx` menyimpan di state `data`, lalu memfilter **di sisi klien** berdasarkan input pencarian:
  ```ts
  `${m.nim} ${m.nama_mahasiswa} ${m.kelas}`.toLowerCase().includes(search.toLowerCase())
  ```
  Jadi pencarian tidak memanggil API lagi.
- `Dashboard.tsx` menghitung statistik **di sisi klien** dari seluruh data:
  - total mahasiswa = `data.length`
  - jumlah laki-laki/perempuan = filter `jenis_kelamin`
  - jumlah kelas = `new Set(data.map(m => m.kelas)).size`
  - distribusi per kelas = hitung frekuensi lalu urutkan
  - 5 mahasiswa terbaru = urut `id` menurun, ambil 5
  Tidak ada endpoint statistik khusus.

### 10.2 Tambah Mahasiswa

**Frontend**
- Halaman: `pages/TambahMahasiswa.tsx`.
- Form punya state `form` berisi semua field. Saat submit:
  - `createMahasiswa(form)` (`services/mahasiswaService.ts:115`).
  - `buildPayload` men-trim semua string; `keterangan` kosong → `null`.
  - Jika sukses → `alert(...)` lalu `navigate('/mahasiswa')`.
  - Jika gagal → pesan error ditampilkan di form.

**Backend**
- Route: `POST /api/mahasiswa` (`routes/mahasiswaRoutes.ts:16`).
- Controller: `addMahasiswa` (`controllers/mahasiswaControllers.ts:112`).
- Validasi `validateInput`: field wajib harus string tidak kosong; `jenis_kelamin` harus `L` atau `P`; `tanggal_lahir` harus tanggal valid; `keterangan` (opsional) harus string.
- Service: `createMahasiswa` (`services/mahasiswaServices.ts:22`) → `INSERT ... RETURNING *`.

**Response**

| Kondisi | Status | Pesan |
|---|---|---|
| Berhasil | `201` | "Mahasiswa berhasil ditambahkan." |
| Validasi gagal | `400` | Pesan field yang bermasalah |
| NIM duplikat (kode PostgreSQL `23505`) | `409` | "NIM sudah terdaftar." |
| Error lain | `500` | "Gagal menambahkan mahasiswa." |

### 10.3 Detail Mahasiswa

**Frontend**
- Halaman: `pages/DetailMahasiswa.tsx`, mengambil `id` dari URL (`useParams`).
- Validasi id di klien: harus angka (`/^\d+$/`).
- Memanggil `getMahasiswaById(id)` (`services/mahasiswaService.ts:105`) → `GET /api/mahasiswa/:id`.
- Menampilkan data pribadi, akademik, orang tua, keterangan.
- Tombol **Edit** → `/mahasiswa/:id/edit`, tombol **Hapus** → buka `DeleteModal`.

**Backend**
- Route: `GET /api/mahasiswa/:id` (`routes/mahasiswaRoutes.ts:15`).
- Controller: `getMahasiswaDetail` (`controllers/mahasiswaControllers.ts:78`).
- `validId`: harus string angka dan `> 0`, jika tidak → `400`.
- Service: `getMahasiswaById` (`services/mahasiswaServices.ts:13`) → `SELECT * FROM public.mahasiswa WHERE id = $1`.
- Jika tidak ada baris → `404` "Mahasiswa tidak ditemukan."

### 10.4 Edit Mahasiswa

**Frontend**
- Halaman: `pages/EditMahasiswa.tsx`.
- Saat dimuat:
  1. `getMahasiswaById(id)` untuk data awal.
  2. `getAllMahasiswa()` untuk mengumpulkan daftar `nim` mahasiswa lain (dipakai validasi duplikat di klien).
- Form menggunakan komponen `components/MahasiswaForm.tsx` mode `edit`.
- `MahasiswaForm` punya validasi klien yang cukup ketat:
  - NIM: hanya angka 5–15 digit, dan tidak boleh sama dengan NIM mahasiswa lain.
  - Nama minimal 3 karakter, tempat lahir wajib, kelas wajib.
  - Tanggal lahir valid dan tidak boleh di masa depan.
  - Alamat minimal 5 karakter.
  - Nama ibu minimal 3 karakter.
  - No HP harus diawali `08`, panjang total 10–13 digit.
- Saat submit: `updateMahasiswa(id, payload)` (`services/mahasiswaService.ts:125`) → `PUT /api/mahasiswa/:id`.
- Sukses → kembali ke `/mahasiswa` dengan `state.notif` (pesan sukses yang bisa ditampilkan halaman tujuan).

**Backend**
- Route: `PUT /api/mahasiswa/:id` (`routes/mahasiswaRoutes.ts:17`).
- Controller: `editMahasiswa` (`controllers/mahasiswaControllers.ts:148`).
- Validasi id + `validateInput` yang sama seperti tambah.
- Service: `updateMahasiswa` (`services/mahasiswaServices.ts:47`) → `UPDATE ... SET ..., updated_at = CURRENT_TIMESTAMP WHERE id = $11 RETURNING *`.
- Jika id tidak ada → `404`; NIM bentrok → `409`.

### 10.5 Hapus Mahasiswa

**Frontend**
- Dari `DetailMahasiswa.tsx`, tombol Hapus membuka `DeleteModal` (komponen konfirmasi).
- Modal bisa ditutup dengan `Escape` atau klik overlay (kecuali sedang proses hapus).
- Konfirmasi → `deleteMahasiswa(id)` (`services/mahasiswaService.ts:136`) → `DELETE /api/mahasiswa/:id`.
- Sukses → `navigate('/mahasiswa')` dengan notifikasi sukses.
- Gagal → modal ditutup, muncul `Toast` error.

**Backend**
- Route: `DELETE /api/mahasiswa/:id` (`routes/mahasiswaRoutes.ts:18`).
- Controller: `removeMahasiswa` (`controllers/mahasiswaControllers.ts:201`).
- Service: `deleteMahasiswa` (`services/mahasiswaServices.ts:84`) → `DELETE FROM public.mahasiswa WHERE id = $1 RETURNING *`.
- Jika tidak ada baris → `404`; sukses → `200` dengan data yang dihapus.

Catatan: delete di sini **hard delete** (baris benar-benar dihapus), bukan soft delete. Soft delete hanya terlihat pada tabel `users` (`deleted_at`).

---

## 11. Alur Logout

File: `frontend/src/components/Sidebar.tsx:37` (`handleLogout`)

1. User klik tombol **Logout** di sidebar.
2. Muncul `window.confirm("Apakah Anda yakin ingin keluar dari aplikasi?")`.
3. Jika setuju:
   - `logout()` dari `AuthContext` (`context/AuthContext.tsx:57`):
     - `localStorage.removeItem('user')`
     - `localStorage.removeItem('token')`
     - `setUser(null)`, `setToken(null)`
   - `onClose()` menutup sidebar (mobile).
   - `navigate('/login', { replace: true })`.
4. Karena `isAuthenticated` menjadi `false`, route terproteksi akan mengarahkan ke `/login`.

Yang **tidak** terjadi saat logout:
- Tidak ada request ke backend untuk membatalkan token.
- Token lama secara teknis masih valid sampai `exp` habis jika masih dipegang seseorang. Ini konsekuensi desain JWT stateless. Jika butuh revokasi, perlu daftar blacklist/refresh-token rotation di server (belum ada di proyek ini).

---

## 12. Peta Endpoint API

Base URL backend: `http://localhost:5000`  
Base path: `/api`

### Auth (`routes/authRoutes.ts`)

| Method | Path | Middleware | Body | Sukses | Error |
|---|---|---|---|---|---|
| `POST` | `/api/auth/login` | — | `{ email, password }` | `200` `{ user, token }` | `400`, `401`, `500` |
| `GET` | `/api/auth/me` | `authenticateToken` | — | `200` `{ uuid, email }` | `401` |
| `GET` | `/api/auth/dashboard` | `authenticateToken` | — | `200` data dashboard | `401` |

### Mahasiswa (`routes/mahasiswaRoutes.ts`)

| Method | Path | Middleware | Body | Sukses | Error |
|---|---|---|---|---|---|
| `GET` | `/api/mahasiswa` | — | — | `200` array | `500` |
| `GET` | `/api/mahasiswa/:id` | — | — | `200` objek | `400`, `404`, `500` |
| `POST` | `/api/mahasiswa` | — | data mahasiswa | `201` objek | `400`, `409`, `500` |
| `PUT` | `/api/mahasiswa/:id` | — | data mahasiswa | `200` objek | `400`, `404`, `409`, `500` |
| `DELETE` | `/api/mahasiswa/:id` | — | — | `200` objek | `400`, `404`, `500` |

### Lain-lain

| Method | Path | Keterangan |
|---|---|---|
| `GET` | `/api/health` | Cek server hidup: `{ success: true, message: "Backend API Mahasiswa berjalan!" }` |

---

## 13. Format Response dan Penanganan Error

### 13.1 Konvensi Response Backend

Sukses:
```json
{ "success": true, "message": "…", "data": { } }
```

Gagal:
```json
{ "success": false, "message": "…" }
```

Semua controller mengikuti pola ini, sehingga frontend bisa memproses secara seragam.

### 13.2 Penanganan di Frontend

File: `frontend/src/services/mahasiswaService.ts`

- `handleRequest`:
  - Menjalankan request.
  - Jika `body.success === false` → lempar `Error(body.message)`.
  - Jika ada `data` → kembalikan `data`.
  - Jika bentuk response tidak dikenali → error "Format response API tidak dikenali."
- `extractErrorMessage`:
  - Ambil `response.data.message` jika ada.
  - Jika `ERR_NETWORK`/tidak ada response → "Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:5000."
  - Fallback ke pesan default per operasi.
- Semua error diubah menjadi `Error` dengan pesan yang siap ditampilkan di UI.

### 13.3 Pola UI per Halaman

| Halaman | Saat loading | Saat error | Saat sukses |
|---|---|---|---|
| Dashboard | skeleton/`StatCard loading` | kartu "Gagal Memuat Data" + tombol Coba Lagi | statistik + tabel 5 terbaru |
| Mahasiswa | teks "Memuat data mahasiswa..." | teks merah | tabel + info jumlah |
| Tambah | tombol "Menyimpan..." | pesan error | alert + redirect |
| Detail | komponen `Loading` | kartu "Mahasiswa Tidak Ditemukan" + Coba Lagi | kartu detail |
| Edit | komponen `Loading` | kartu error + Coba Lagi | form terisi |
| Hapus | tombol "Menghapus..." | `Toast` error | redirect + notifikasi |

---

## 14. Struktur Database

Berdasarkan query di kode, struktur yang dipakai adalah sebagai berikut (nama kolom mengikuti query; tipe/constraint detail menyesuaikan database Anda).

### Tabel `public.mahasiswa`

| Kolom | Dipakai untuk |
|---|---|
| `id` | Primary key, dipakai di URL `/mahasiswa/:id` |
| `nim` | Nomor induk mahasiswa; **unique** (kode error `23505`) |
| `nama_mahasiswa` | Nama lengkap |
| `jenis_kelamin` | `'L'` atau `'P'` |
| `tempat_lahir` | Tempat lahir |
| `tanggal_lahir` | Tanggal lahir |
| `kelas` | Kelas |
| `alamat` | Alamat |
| `nama_ibu_kandung` | Nama ibu |
| `no_hp_orang_tua` | Nomor HP orang tua |
| `keterangan` | Catatan opsional (boleh `NULL`) |
| `updated_at` | Diperbarui otomatis saat `UPDATE` (`CURRENT_TIMESTAMP`) |

`SELECT *` dipakai, jadi kolom tambahan (mis. `created_at`) akan ikut terkirim ke frontend; `normalizeMahasiswa` hanya mengambil field yang dikenal.

### Tabel `public.users`

| Kolom | Dipakai untuk |
|---|---|
| `uuid` | Identitas user, menjadi `sub` di JWT |
| `email` | Login (dicari case-insensitive) |
| `password` | **Hash bcrypt**, bukan plaintext |
| `id_mhs` | Relasi ke `mahasiswa.id` (JOIN) |
| `deleted_at` | Soft delete; akun dengan nilai ini tidak bisa login |

### Relasi

```mermaid
erDiagram
    MAHASISWA ||--o| USERS : "id = id_mhs"
    MAHASISWA {
        int id PK
        string nim
        string nama_mahasiswa
        string jenis_kelamin
        string tempat_lahir
        date tanggal_lahir
        string kelas
        string alamat
        string nama_ibu_kandung
        string no_hp_orang_tua
        string keterangan
    }
    USERS {
        uuid uuid PK
        string email
        string password
        int id_mhs FK
        timestamp deleted_at
    }
```

Satu akun `users` terhubung ke satu baris `mahasiswa`. Login memakai `INNER JOIN`, jadi akun tanpa data mahasiswa tidak bisa login.

---

## 15. Validasi Berlapis

Aplikasi ini memvalidasi di beberapa tempat. Tujuannya: UX cepat di klien, keamanan/konsistensi di server.

| Lapisan | File | Contoh aturan |
|---|---|---|
| Form edit (klien) | `components/MahasiswaForm.tsx` | NIM 5–15 digit, HP `08` + 10–13 digit, tanggal tidak di masa depan, cek NIM duplikat dari daftar yang sudah diambil |
| Form tambah (klien) | `pages/TambahMahasiswa.tsx` | Memakai atribut HTML `required`; belum seketat `MahasiswaForm` |
| Controller backend | `controllers/mahasiswaControllers.ts` (`validateInput`) | Semua field wajib string tidak kosong, `jenis_kelamin` `L`/`P`, tanggal valid |
| Controller auth | `controllers/authController.ts` | `email` & `password` harus string tidak kosong |
| Database | PostgreSQL | `nim` unique → error `23505` ditangkap controller menjadi `409` |

Prinsip: **jangan pernah hanya mengandalkan validasi frontend**, karena request bisa dikirim langsung ke API (mis. lewat Postman).

---

## 16. Catatan Penting Kondisi Kode Saat Ini

Bagian ini menjelaskan hal-hal yang perlu diketahui agar tidak bingung saat membaca/mengembangkan kode. Ini adalah deskripsi kondisi aktual, bukan instruksi.

1. **Interceptor token belum terpakai**
   - `frontend/src/services/Api.ts` sudah menyiapkan `Authorization: Bearer <token>`, tetapi tidak diimport di mana pun.
   - `mahasiswaService.ts` membuat axios instance sendiri tanpa token.
   - Akibat: token belum otomatis terkirim pada operasi CRUD.

2. **Endpoint mahasiswa belum diproteksi**
   - `routes/mahasiswaRoutes.ts` tidak memasang `authenticateToken`.
   - Akibat: siapa pun yang bisa menjangkau API dapat memanggil CRUD tanpa token.
   - Jika ingin mewajibkan login untuk CRUD, tambahkan middleware, misalnya:
     ```ts
     router.use(authenticateToken);
     ```
     lalu pastikan frontend mengirim header Bearer.

3. **Route guard frontend hanya berbasis localStorage**
   - `isAuthenticated` hanya mengecek `token` dan `user` ada.
   - Token kedaluwarsa/rusak tidak otomatis membuat user logout.
   - Validasi sebenarnya baru terjadi saat endpoint terproteksi dipanggil.

4. **Refresh token belum diimplementasikan**
   - `middleware/refreshMiddleware.ts` kosong.
   - `JWT_REFRESH_SECRET` dan `JWT_REFRESH_EXPIRES_IN` ada di `.env` tetapi tidak dibaca kode.
   - Saat token expired, alurnya adalah login ulang.

5. **`main.tsx` memanggil `createRoot` dua kali**
   - Baris `main.tsx:9` merender `App` **tanpa** `AuthProvider`, lalu `main.tsx:17` merender ulang dengan `AuthProvider`.
   - Render pertama berpotensi memunculkan error "useAuth harus digunakan di dalam AuthProvider" di console.
   - `index.css` juga diimport dua kali.
   - Sebaiknya hanya satu render dengan `AuthProvider` (yang di bawah).

6. **Beberapa komponen belum dipakai**
   - `components/MahasiswaTable.tsx` tidak diimport halaman mana pun (halaman `Mahasiswa.tsx` memakai tabel inline).
   - `pages/TambahMahasiswa.tsx` memakai form sendiri, bukan `components/MahasiswaForm.tsx`.
   - Ini bukan bug, tetapi menyebabkan gaya UI berbeda antara tambah dan edit.

7. **Navbar menampilkan identitas statis**
   - `components/Navbar.tsx` menulis "Administrator"/"AD" secara hardcoded, tidak mengambil `user` dari `AuthContext`.
   - Data user hasil login sebenarnya tersedia di context (`user.nama_mahasiswa`, `user.email`, dll.).

8. **File konfigurasi perlu dirapikan**
   - `backend/.gitidnore` kemungkinan typo dari `.gitignore`.
   - `backend/.env.example` masih kosong; sebaiknya diisi daftar variabel tanpa nilai rahasia.
   - `backend/.env` berisi secret; pastikan tidak ikut ter-commit. Jika pernah ter-commit, ganti `JWT_SECRET` dan password DB.

9. **`backend/.env` memuat `VITE_API_URL`**
   - Variabel berawalan `VITE_` hanya relevan untuk frontend. Di backend tidak dibaca kode, jadi tidak berpengaruh.

10. **Pencarian dan statistik dashboard dihitung di klien**
    - Seluruh data diambil sekali (`GET /api/mahasiswa`), lalu difilter/dihitung di browser.
    - Untuk data besar, pendekatan ini bisa berat; bisa ditingkatkan dengan query pencarian/pagination di server.

11. **CORS terbuka untuk semua origin**
    - `app.use(cors())` mengizinkan semua origin. Untuk produksi, batasi origin frontend.

12. **Login menampilkan pesan error yang disamakan**
    - "Email atau password salah." untuk email tidak ada maupun password salah — praktik baik untuk mencegah penebakan email.

---

## 17. Ringkasan Alur dalam Satu Paragraf

Saat aplikasi dibuka, React membaca `user` dan `token` dari `localStorage`; jika tidak ada, user diarahkan ke `/login`. User mengisi email dan password, frontend mengirim `POST /api/auth/login`. Backend memvalidasi input, mencari akun di PostgreSQL lewat `users JOIN mahasiswa` (case-insensitive, akun tidak terhapus), lalu membandingkan password dengan hash bcrypt. Jika cocok, backend membuat JWT yang berisi `sub` (uuid) dan `email`, ditandatangani dengan `JWT_SECRET` dan berlaku sesuai `JWT_EXPIRES_IN`. Frontend menyimpan `user` dan `token` di `localStorage` melalui `AuthContext`, lalu membuka `/dashboard`. Pada request ke endpoint terproteksi, token seharusnya dikirim sebagai `Authorization: Bearer <token>`; middleware memverifikasinya, mengisi `req.user`, dan meneruskan ke controller. Halaman dashboard dan data mahasiswa mengambil `GET /api/mahasiswa`, menampilkan tabel, serta menghitung statistik/pencarian di sisi klien. Tambah memakai `POST`, detail `GET /:id`, edit `PUT /:id` (dengan validasi form ketat), dan hapus `DELETE /:id` lewat modal konfirmasi. Logout menghapus `user` dan `token` dari `localStorage` lalu kembali ke `/login`; karena JWT stateless, token lama tetap valid sampai kedaluwarsa kecuali ditambahkan mekanisme revokasi di server.

---

## 18. Istilah Penting

| Istilah | Arti |
|---|---|
| **Autentikasi** | Proses membuktikan identitas (login). |
| **Otorisasi** | Menentukan apa yang boleh dilakukan setelah terautentikasi. |
| **JWT** | Token bertanda tangan berisi klaim (`sub`, `email`, `exp`, dll.). |
| **Stateless** | Server tidak menyimpan state sesi antar-request. |
| **Bearer token** | Pola pengiriman token di header `Authorization: Bearer <token>`. |
| **Hash (bcrypt)** | Bentuk satu arah dari password; tidak bisa dikembalikan ke aslinya. |
| **Salt** | Nilai acak yang ditambahkan saat hashing agar hash tiap user berbeda. |
| **Claim** | Pasangan key-value di dalam payload JWT. |
| **`exp`** | Waktu kedaluwarsa token (Unix timestamp). |
| **Middleware** | Fungsi yang berjalan sebelum controller (mis. cek token). |
| **Route guard** | Mekanisme di frontend untuk membatasi halaman berdasarkan status login. |
| **CORS** | Aturan browser mengenai request lintas origin. |
| **Soft delete** | Menandai data terhapus (mis. `deleted_at`) tanpa menghapus baris. |
| **Hard delete** | Menghapus baris dari database secara permanen. |
| **localStorage** | Penyimpanan key-value di browser; bertahan setelah refresh/tab ditutup. |
| **XSS** | Serangan menyisipkan script berbahaya; dapat membaca token di localStorage. |
