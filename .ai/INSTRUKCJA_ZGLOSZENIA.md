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
   - Logo "10xCards" z gradientowym tłem
   - Formularz z polami Email i Password
   - Przyciski "Sign In" i "Create account"

---

### 2. Strona główna / Ekran po zalogowaniu
**Co pokazać:** Dashboard z listą decków i formularzami
**Jak zrobić:**
1. Zaloguj się do aplikacji
2. Przejdź do `http://localhost:3000/dashboard`
3. Zrób screenshot pokazujący:
   - Sidebar z listą decków i liczbą kart
   - Licznik AI quota w sidebarze (np. "15/75 remaining")
   - Mini-stats widget (streak, today's reviews, accuracy)
   - Nagłówek z nawigacją (Dashboard/Stats/Profile/Logout)

---

### 3. Główna funkcjonalność nr 1 (formularz zapisu danych)
**Co pokazać:** Generowanie fiszek z AI z podglądem
**Jak zrobić:**
1. Wybierz deck w dashboardzie
2. W sekcji "AI Generate Flashcards" wklej przykładowy tekst
3. Kliknij "Generate Flashcards"
4. Zrób screenshot pokazujący:
   - Dialog "Review Generated Flashcards"
   - Lista wygenerowanych fiszek z checkboxami
   - Możliwość edycji treści (pola Front/Back)
   - Przyciski "Cancel" i "Save X Cards"
   - Scroll dla wielu fiszek

**Alternatywnie:** Możesz pokazać formularz ręcznego tworzenia fiszki (pola Front/Back + przycisk Create)

---

### 4. Główna funkcjonalność nr 2 (prezentacja danych)
**Co pokazać:** Study Mode z Spaced Repetition (SM-2)
**Jak zrobić:**
1. Wybierz deck z fiszkami w dashboardzie
2. Kliknij przycisk "Study All" lub "Review Due"
3. Przejdź przez kilka fiszek
4. Zrób screenshot pokazujący:
   - Fiszkę z pytaniem lub odpowiedzią
   - Przyciski oceny: Again (1), Hard (2), Good (3), Easy (4)
   - Licznik kart "Card X/Y"
   - Pasek postępu
   - Przyciski nawigacji (Previous/Shuffle/Next)

**Alternatywnie:** Możesz pokazać stronę Statistics (`/stats`) z wykresami i statystykami

---

### 5. Poprawnie działający test lub zestaw testów
**Co pokazać:** Terminal z wynikami testów
**Jak zrobić:**
1. Otwórz terminal
2. Uruchom `npm test` (testy jednostkowe)
3. Zrób screenshot pokazujący:
   - Zielone checkmarki przy testach
   - Podsumowanie "X passed"
   - Nazwy plików testowych (spaced-repetition.test.ts, openrouter.test.ts)

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

🔐 Autentykacja:
• Rejestracja, logowanie, wylogowanie (Supabase Auth)
• Strony login/register z logo i gradientowym tłem

📚 Zarządzanie deckami:
• Pełny CRUD - tworzenie, edycja nazwy/opisu, usuwanie
• Lista decków z liczbą kart i kart do powtórki

🃏 Zarządzanie fiszkami:
• Tworzenie ręczne (formularz Front/Back)
• Edycja i usuwanie fiszek
• Lista fiszek z podglądem treści

🤖 Generowanie AI:
• Integracja z OpenRouter (Claude 3.5 Haiku)
• Podgląd wygenerowanych fiszek przed zapisem
• Edycja fiszek w preview dialog
• Wybór fiszek do zapisania (checkboxy)
• Limit 75 fiszek lifetime z widocznym licznikiem

📖 Study Mode:
• Nauka fiszek z animacją flip
• Nawigacja: previous/next, shuffle
• Progress bar i licznik kart
• Keyboard shortcuts (Space/Enter, Arrows, Esc, 1-4)

🧠 Spaced Repetition (SM-2):
• Algorytm SM-2 do optymalnego planowania powtórek
• Oceny: Again (1), Hard (2), Good (3), Easy (4)
• Automatyczne planowanie następnej powtórki
• Przycisk "Review Due" dla kart do powtórki

📊 Statystyki:
• Study streak (dni z rzędu)
• Accuracy (procent poprawnych)
• Reviews today/this week
• Wykres powtórek z ostatnich 30 dni
• Statystyki per deck (mastered/learning/due)
• Mini-stats widget w dashboardzie

STACK TECHNOLOGICZNY:
• Frontend: Astro 5 + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui
• Backend: Astro API Routes + Supabase (PostgreSQL + Row Level Security)
• AI: OpenRouter.ai (Claude 3.5 Haiku)
• Walidacja: Zod
• Testy: Vitest (unit) + Playwright (e2e)
• CI/CD: GitHub Actions (lint, typecheck, unit tests, e2e tests, build)
• Deploy: Cloudflare Pages

DOKUMENTACJA AI (folder .ai/):
• prd.md - Product Requirements Document z user stories
• tech-stack.md - dokumentacja stacku technologicznego
• db-plan.md - schemat bazy danych z diagramem ERD
• api-plan.md - specyfikacja REST API

DODATKOWE FUNKCJONALNOŚCI (ponad minimum):
• Spaced Repetition (SM-2) - algorytm optymalnych powtórek
• Strona statystyk z wykresami
• Mini-stats widget w dashboardzie
• Podgląd i edycja fiszek przed zapisem z AI
• Edycja decków i fiszek
• Keyboard shortcuts w Study Mode
• Responsywny design
• Landing page z opisem funkcjonalności

AI WORKFLOW - JAK PRACOWALIŚMY:
Projekt rozwijany z wykorzystaniem Claude Code (CLI) jako głównego narzędzia AI-assisted development.

Proces pracy:
1. Przygotowanie dokumentacji w folderze .ai/ (PRD, tech-stack, db-plan, api-plan)
2. Tworzenie issues na GitHub z opisem funkcjonalności
3. Issue-driven development: "Implement issue #X" → Claude Code tworzy branch, implementuje, commituje, tworzy PR
4. Code review przez OpenAI Codex na GitHub → merge lub poprawki
5. Iteracyjne dodawanie nowych funkcjonalności

Narzędzia AI:
• Claude Code (CLI) - główne narzędzie do pisania kodu, debugowania, refactoringu
• OpenAI Codex - code review Pull Requestów na GitHub
• Claude 3.5 Haiku (via OpenRouter) - generowanie fiszek w aplikacji

Korzyści z AI workflow:
• Szybka implementacja boilerplate'u i powtarzalnych wzorców
• Automatyczne tworzenie testów jednostkowych i E2E
• Spójna struktura kodu i konwencje nazewnictwa
• Dokumentacja generowana równolegle z kodem
• Debugging z pełnym kontekstem projektu
```

---

## Checklist przed wysłaniem

- [ ] Sprawdzony URL z Cloudflare Pages (działa publicznie)
- [ ] 6 screenshotów przygotowanych
- [ ] Repozytorium publiczne LUB @przeprogramowani dodany jako collaborator
- [ ] Komentarz skopiowany i dostosowany
- [ ] Przetestowane logowanie na produkcji

---

## Przydatne komendy

```bash
# Uruchom aplikację lokalnie
npm run dev

# Uruchom testy jednostkowe (dla screenshota)
npm test

# Uruchom testy E2E
npm run test:e2e

# Sprawdź linting i typy
npm run lint && npm run typecheck

# Build produkcyjny
npm run build

# Sprawdź status CI/CD
gh run list --limit 1

# Sprawdź URL Cloudflare (jeśli masz wrangler)
npx wrangler pages list
```

---

## Przykładowy tekst do generowania fiszek

Możesz użyć tego tekstu do pokazania generowania AI:

```
React Hooks are functions that let you use state and other React features
in functional components. The useState hook allows you to add state to
functional components. It returns an array with two elements: the current
state value and a function to update it. The useEffect hook lets you perform
side effects in components, such as data fetching, subscriptions, or manually
changing the DOM. It runs after every render by default, but you can control
when it runs by passing a dependency array.
```

---

*Dokument zaktualizowany: 14 grudnia 2024*
