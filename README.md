# Technical Assessments

This repository contains two standalone technical assessment submissions:

1. **[React — Google Places Autocomplete](./reactjs-assessment)** — a React app that
   uses Google Places Autocomplete to search for a location, displays it on a map, and keeps a
   Redux-backed history of searches within the session.
2. **[Java — Spring Boot API](./java-assessment)** — a Spring Boot backend with a
   layered project structure, MSSQL persistence, request/response logging, transactional
   service methods, a paginated GET endpoint, and an endpoint that calls out to a 3rd-party API.

The two projects are independent and can each be run on their own. Optionally, the React app's
"favourite place" feature calls the Java API's `/api/favourites` endpoint to persist a place —
see each project's own README for details on running them together.

## Repository structure

```
.
├── reactjs-assessment/   # Frontend — React + Redux Toolkit + Google Maps
│   └── README.md         # setup & run instructions specific to this project
└── java-assessment/      # Backend — Spring Boot + MSSQL
    ├── postman/           # Postman collection for the API
    └── README.md          # setup & run instructions specific to this project
```

## Prerequisites

| Tool                                                                      | Needed for                     |
| ------------------------------------------------------------------------- | ------------------------------ |
| Node.js (LTS)                                                             | React project                  |
| A Google Maps API key with Places API (New) + Maps JavaScript API enabled | React project                  |
| JDK 17+                                                                   | Java project                   |
| Maven (or the included `mvnw` wrapper)                                    | Java project                   |
| Docker Desktop (Rosetta emulation enabled on Apple Silicon)               | Java project — runs MSSQL      |
| Postman                                                                   | Testing/reviewing the Java API |

Neither project ships with real credentials committed — see each sub-project's README for how
to supply your own via environment variables / `.env`.

## Quick start

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

# Frontend
cd reactjs-assessment
npm install
cp .env.example .env   # add your Google Maps API key
npm run dev

# Backend (in a separate terminal)
cd java-assessment
export MSSQL_SA_PASSWORD='YourStrong!Passw0rd'
docker compose up -d          # starts MSSQL — see java-assessment/README.md for DB setup
./mvnw spring-boot:run
```

## Notes for reviewers

- Each sub-project has its own README with setup steps, architecture notes, and any
  design decisions worth flagging (e.g. `@Transactional` usage in the Java project, the Redux
  middleware choice in the React project).
- The Postman collection for the API lives at
  [`java-assessment/postman/java-assessment.postman_collection.json`](./java-assessment/postman/java-assessment.postman_collection.json).
- If anything doesn't run cleanly from a fresh clone, please let me know — happy to walk through
  it live.
