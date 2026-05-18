# 📱 Watched-It — Data

A Python scraper that collects movie data from IMDB, generates fake user data, and loads everything into a Supabase database.

---

## Requirements

- [uv](https://docs.astral.sh/uv/) (Python package manager)
- Python 3.12+
- A [Supabase](https://supabase.com) project

---

## Environment Setup

Create a `.env` file in the `data/` folder based on `.env.example`:

```
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```

You can find both values in your Supabase project under **Settings → API**:
- `SUPABASE_URL` → Project URL
- `SUPABASE_SERVICE_KEY` → `service_role` secret key (not the `anon` key)

> ⚠️ Never commit your `.env` file. It contains sensitive credentials.

---

## What It Does

### Movies (`loadMovies.py`)
- Uses Selenium to scrape movie data from IMDB
- Extracts title, year, country, length, genre, age restriction, synopsis, image URL, and popularity
- Loads the movies into the `movies` table in Supabase

### Users (`loadUsers.py`)
- Generates fake user data
- Skips loading if the database already has 100 or more users
- Creates users in Supabase Auth with `email` and `password`
- A database trigger automatically syncs new auth users into the public `usuario` table

---

## Running the Scripts

**1. Install dependencies:**
```bash
uv sync
```

**2. Run the loaders:**
```bash
uv run python main.py
```
