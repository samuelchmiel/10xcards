# Instrukcja zgłoszenia projektu 10xCards

## Formularz zgłoszeniowy

### Dane podstawowe

| Pole | Co wpisać |
|------|-----------|
| **Email** | [Twój adres email] |
| **Imię i nazwisko** | [Twoje imię i nazwisko] |
| **Typ projektu** | `10xCards` |
| **Zgoda na promocję** | Zaznacz, jeśli wyrażasz zgodę |
| **Repozytorium GitHub** | `https://github.com/samuelchmiel/10xcards` |
| **Publiczny URL** | [Twój URL z Cloudflare Pages - sprawdź dashboard] |

---

## Screenshoty do załączenia

### 1. Ekran logowania
**Co pokazać:** Strona `/login` z formularzem logowania
**Jak zrobić:**
1. Uruchom `npm run dev`
2. Przejdź do `http://localhost:3000/login`
3. Zrób screenshot pokazujący:
   - Formularz z polami Email i Password
   - Przyciski "Sign In" i "Create account"
   - Logo/tytuł aplikacji

---

### 2. Strona główna / Ekran po zalogowaniu
**Co pokazać:** Dashboard z listą decków i formularzami
**Jak zrobić:**
1. Zaloguj się do aplikacji
2. Przejdź do `http://localhost:3000/dashboard`
3. Zrób screenshot pokazujący:
   - Sidebar z listą decków
   - Licznik AI quota w sidebarze
   - Formularz tworzenia nowego decka
   - Nagłówek z nawigacją (Dashboard/Profile/Logout)

---

### 3. Główna funkcjonalność nr 1 (formularz zapisu danych)
**Co pokazać:** Generowanie fiszek z AI z podglądem
**Jak zrobić:**
1. Wybierz deck w dashboardzie
2. W sekcji "Generate with AI" wklej przykładowy tekst
3. Kliknij "Generate Flashcards"
4. Zrób screenshot pokazujący:
   - Dialog podglądu z wygenerowanymi fiszkami
   - Checkboxy do wyboru fiszek
   - Możliwość edycji treści fiszek
   - Przyciski "Cancel" i "Save Selected"

**Alternatywnie:** Możesz pokazać formularz ręcznego tworzenia fiszki (pola Front/Back + przycisk Create)

---

### 4. Główna funkcjonalność nr 2 (prezentacja danych)
**Co pokazać:** Study Mode - tryb nauki fiszek
**Jak zrobić:**
1. Wybierz deck z fiszkami w dashboardzie
2. Kliknij przycisk "Study (X)" gdzie X to liczba fiszek
3. Przejdź do `/study/[deckId]`
4. Zrób screenshot pokazujący:
   - Fiszkę z pytaniem (front)
   - Licznik kart "Card X/Y"
   - Pasek postępu
   - Przyciski Previous/Shuffle/Next
   - Przycisk "Exit Study"

**Alternatywnie:** Możesz pokazać listę fiszek w dashboardzie z opcjami Edit/Delete

---

### 5. Poprawnie działający test lub zestaw testów
**Co pokazać:** Terminal z wynikami testów
**Jak zrobić:**
1. Otwórz terminal
2. Uruchom `npm test` (testy jednostkowe)
3. Zrób screenshot pokazujący:
   - Zielone checkmarki przy testach
   - Podsumowanie "X passed"
   - Nazwy plików testowych

**Alternatywnie:** Możesz uruchomić `npm run test:e2e` dla testów E2E (wymaga konfiguracji credentials)

---

### 6. Scenariusz działającego procesu CI/CD
**Co pokazać:** GitHub Actions z zielonymi checkmarkami
**Jak zrobić:**
1. Przejdź do: `https://github.com/samuelchmiel/10xcards/actions`
2. Kliknij na ostatni workflow run (powinien być zielony)
3. Zrób screenshot pokazujący:
   - Nazwę workflow "CI"
   - Wszystkie joby: Lint, Type Check, Unit Tests, E2E Tests, Build
   - Zielone checkmarki przy wszystkich krokach
   - Status "Success"

---

## Twój komentarz (sugerowana treść)

```
Projekt 10xCards - generator fiszek edukacyjnych z wykorzystaniem AI.

ZAIMPLEMENTOWANE FUNKCJONALNOŚCI:
• Autentykacja użytkowników (Supabase Auth) - rejestracja, logowanie, wylogowanie
• Pełny CRUD decków - tworzenie, edycja nazwy i opisu, usuwanie
• Pełny CRUD fiszek - tworzenie ręczne, edycja, usuwanie
• Generowanie fiszek z AI (OpenRouter + Claude 3.5 Haiku) z podglądem i selekcją przed zapisem
• Limit generacji AI (75 fiszek lifetime) z widocznym licznikiem w dashboardzie i na profilu
• Study Mode - nauka fiszek z animacją flip, nawigacja previous/next, shuffle, progress bar
• Landing page z opisem funkcjonalności i CTA
• Strona profilu użytkownika z historią wykorzystania AI
• Nawigacja między Dashboard i Profile

STACK TECHNOLOGICZNY:
• Frontend: Astro 5 + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui
• Backend: Astro API Routes + Supabase (PostgreSQL + Row Level Security)
• AI: OpenRouter.ai (Claude 3.5 Haiku)
• Walidacja: Zod
• Testy: Vitest (unit - 2 pliki) + Playwright (e2e - 9 testów)
• CI/CD: GitHub Actions (lint, typecheck, unit tests, e2e tests, build)
• Deploy: Cloudflare Pages

DOKUMENTACJA AI (folder .ai/):
• prd.md - Product Requirements Document z user stories i statusami implementacji
• tech-stack.md - szczegółowa dokumentacja stacku technologicznego
• db-plan.md - schemat bazy danych PostgreSQL z diagramem ERD
• api-plan.md - specyfikacja REST API
• issues.md - lista issues do implementacji

DODATKOWE FUNKCJONALNOŚCI (ponad minimum):
• Podgląd i edycja fiszek przed zapisem (AI Preview Dialog)
• Edycja decków (zmiana nazwy i opisu)
• Edycja fiszek (zmiana treści front/back)
• Study Mode z keyboard shortcuts (Space/Enter = flip, Arrows = navigate, Esc = exit)
• Progress bar i licznik kart w Study Mode
• Responsywny design

Projekt rozwijany z wykorzystaniem Claude Code jako głównego narzędzia AI-assisted development.
```

---

## Checklist przed wysłaniem

- [ ] Zaktualizowany PRD (Study Mode oznaczony jako zaimplementowany)
- [ ] Sprawdzony URL z Cloudflare Pages
- [ ] 6 screenshotów przygotowanych
- [ ] Repozytorium publiczne LUB @przeprogramowani dodany jako collaborator
- [ ] Komentarz skopiowany i dostosowany

---

## Przydatne komendy

```bash
# Uruchom aplikację lokalnie
npm run dev

# Uruchom testy jednostkowe (dla screenshota)
npm test

# Sprawdź status CI/CD
gh run list --limit 1

# Sprawdź URL Cloudflare (jeśli masz wrangler)
npx wrangler pages list
```

---

*Dokument przygotowany: 14 grudnia 2024*
