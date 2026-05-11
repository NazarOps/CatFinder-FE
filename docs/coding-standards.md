# Kodregler och projektstandard - CatFinder Frontend

Detta dokument beskriver de kodregler, konventioner och standarder som gäller för frontend-delen av CatFinder (React-applikationen). Alla i gruppen förväntas följa dessa regler för att hålla en konsekvent och läsbar kodbas.

---

# Allmänna regler

## Versionshantering och Git

- All utveckling sker i feature branches, aldrig direkt på `main`.
- `main` är skyddad med branch protection rules.
- Alla features, bugfixar och förbättringar ska kopplas till en GitHub Issue.
- Pull Requests krävs för merge till `main`.
- Minst en annan gruppmedlem ska reviewa och godkänna PR innan merge.

---

# Branch-namngivning

Använd följande prefix:

- `feature/`
- `bugfix/`
- `refactor/`
- `docs/`
- `style/`

Exempel:

```bash
feature/create-advertisement-page
bugfix/fix-login-validation
refactor/extract-navbar-component
docs/update-readme
```

Använd kebab-case och tydliga namn.

---

# Commit-meddelanden

Commit-meddelanden ska vara korta, tydliga och skrivna på engelska.

Bra exempel:

```bash
Add advertisement card component
Fix navbar mobile layout
Implement login form validation
```

Dåliga exempel:

```bash
fix stuff
wip
update
```

En commit ska fokusera på en sak.

---

# GitHub Project Board

- Alla tasks ska finnas som GitHub Issues.
- Issues ska innehålla:
  - beskrivning
  - eventuella subtasks
  - acceptanskriterier
- Labels ska användas:
  - `frontend`
  - `bug`
  - `feature`
  - `docs`
  - `style`
- Issues ska flyttas mellan:
  - Todo
  - In Progress
  - Review
  - Done

---

# Filstruktur

```txt
src/
│
├── assets/          Bilder, ikoner och statiska filer
├── components/      Återanvändbara komponenter
│   ├── ui/          Generiska UI-komponenter
│   ├── layout/      Layout-komponenter
│   └── features/    Domänspecifika komponenter
│
├── pages/           Sidor kopplade till routes
├── hooks/           Custom hooks
├── services/        API-anrop och Axios-instanser
├── context/         React Context providers
├── helpers/         Hjälpfunktioner
├── constants/       Konstanter och enums
├── styles/          Globala styles
│
├── App.jsx
└── main.jsx
```

Skapa inte undermappar i onödan. Håll strukturen enkel och tydlig.

---

# Namnkonventioner

## Komponenter

- PascalCase
- En komponent per fil

Exempel:

```txt
AdvertisementCard.jsx
Navbar.jsx
CommentSection.jsx
```

## Hooks

- camelCase
- Måste börja med `use`

Exempel:

```txt
useAuth.js
useAdvertisements.js
```

## Helpers

- camelCase

Exempel:

```txt
formatDate.js
truncateText.js
```

## Services

- camelCase + `Service`

Exempel:

```txt
authService.js
advertisementService.js
```

## Konstanter

- UPPER_SNAKE_CASE

Exempel:

```js
MAX_DESCRIPTION_LENGTH
API_TIMEOUT
```

---

# Allmänna kodregler

- Använd alltid `const` om variabeln inte behöver ändras.
- Använd aldrig `var`.
- Undvik magic strings och magic numbers.
- Ingen död kod eller kommenterad kod får committas.
- Ta bort `console.log` innan merge.
- Använd tydliga variabelnamn.
- Skriv självdokumenterande kod istället för onödiga kommentarer.
- Använd arrow functions konsekvent.

---

# React-komponenter

- Endast funktionskomponenter.
- Inga klasskomponenter.
- Komponenter ska ha ett tydligt ansvar.
- Om en komponent blir för stor ska den delas upp.
- Props ska destruktureras.

Exempel:

```jsx
function AdvertisementCard({ title, city, imageUrl })
```

- Undvik prop drilling i många nivåer.
- Återanvänd UI-komponenter där det är möjligt.

---

# State och Hooks

- `useState` används för lokal state.
- `useEffect` används för side effects.
- Återanvänd logik via custom hooks.
- Global state hanteras via Context API.
- Lyft endast state när flera komponenter behöver den.

---

# API-kommunikation

- All kommunikation med backend sker via Axios.
- Skapa en central Axios-instans i:

```txt
services/api.js
```

- Alla API-anrop ska ligga i service-filer.

Exempel:

```txt
authService.js
commentService.js
advertisementService.js
```

- API-anrop ska hanteras med `try/catch`.
- Visa användarvänliga felmeddelanden.
- Skicka JWT automatiskt via Axios interceptors.

---

# Styling

- Tailwind CSS används konsekvent i hela projektet.
- Undvik inline styles.
- Designen ska vara:
  - responsiv
  - modern
  - konsekvent
- Samma spacing och färgsystem ska användas genom hela appen.
- Mobilanpassning är obligatorisk.

---

# Formulär

- Formulär ska använda controlled components.
- Input ska valideras på klienten.
- Felmeddelanden ska vara tydliga.
- Submit-knappar ska disable:as under loading.

Återanvändbara komponenter ska användas:

```txt
Input
Button
Textarea
Modal
```

---

# Routing

- React Router används för routing.
- Skyddade sidor ska använda `ProtectedRoute`.
- Delade layouts ska ligga i layout-komponenter.
- Ingen känslig information får skickas via URL-parametrar.

---

# Felhantering

- Alla async-funktioner ska hantera fel.
- Loading states ska visas tydligt.
- Empty states ska hanteras.
- Känslig information får aldrig loggas till console.

---

# Miljövariabler

- Alla miljövariabler ska ligga i `.env`.
- Vite-variabler måste börja med:

```txt
VITE_
```

Exempel:

```env
VITE_API_URL=http://localhost:5000
```

- `.env` ska ignoreras via `.gitignore`.
- `.env.example` ska finnas i repot.

---

# Authentication

Frontend ansvarar för:

- Login
- Register
- Logout
- Hantering av JWT-token
- Protected routes

Logout ska:
- rensa auth state
- rensa token
- redirecta till login/home

---

# Dokumentation

## README

README ska innehålla:

- projektbeskrivning
- teknikstack
- installationsinstruktioner
- hur projektet startas
- miljövariabler
- länk till backend-repot

---

# Code Review

Vid PR-review ska följande kontrolleras:

- följs kodstandarden?
- är komponenterna läsbara?
- finns onödig kod?
- hanteras fel korrekt?
- är komponenterna återanvändbara?
- är commit-historiken tydlig?

Feedback ska vara konstruktiv och respektfull.

---

# Sammanfattning

Vi prioriterar:

- läsbar kod
- tydlig struktur
- återanvändbarhet
- teamwork
- konsekvent design

Det är bättre att skriva enkel och tydlig kod än avancerad kod som ingen förstår.
