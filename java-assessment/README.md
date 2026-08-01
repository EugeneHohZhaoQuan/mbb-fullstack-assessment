# FavouritePlace Assessment API

Spring Boot 3.5.3 / Java 17 backend built for the Cards IT Java assessment. One resource,
`FavouritePlace`, carries every requirement in the brief: CRUD, pagination, `@Transactional`,
request/response logging, and a nested 3rd-party API call.

## Stack

- Java 17, Spring Boot 3.5.3, Maven (wrapper included, no local Maven install needed)
- Spring Web, Spring Data JPA, Bean Validation
- MSSQL via `mssql-jdbc`
- Logback, configured to write to `logs/app.log`

> Note on Spring Boot version: the brief asked for Boot 3.x. As of the time this was built,
> start.spring.io's hosted Initializr only generates Boot 4.x projects (its own compatibility
> check rejects any 3.x version). The project was scaffolded on the 4.x default and the parent
> POM version was manually pinned to `3.5.3` (a real, current 3.x GA release on Maven Central),
> with the two starter artifact IDs that changed name in Boot 4 (`spring-boot-starter-web`,
> `spring-boot-starter-test`) restored to their 3.x names. Everything below was built and tested
> against 3.5.3.

## Database setup

**Docker MSSQL** — started cleanly on the first try on this Apple Silicon machine with Rosetta
emulation enabled in Docker Desktop.

```bash
export MSSQL_SA_PASSWORD='YourStrong!Passw0rd'
docker compose up -d
```

The `docker-compose.yml` at the project root pulls `mcr.microsoft.com/mssql/server:2022-latest`
under `platform: linux/amd64`. On Apple Silicon this requires Docker Desktop's Rosetta emulation
(Settings → General → "Use Rosetta for x86_64/amd64 emulation on Apple Silicon").

The container doesn't create a named database by itself — after it's up, create `TESTDB` once:

```bash
docker exec <container-name> /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa \
  -P 'YourStrong!Passw0rd' -C -Q "CREATE DATABASE TESTDB"
```

(`docker ps` to find `<container-name>`, e.g. `java-assessment-mssql-1`.)

### Credentials

Never hardcoded — `application.yml` reads `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` from the
environment, defaulting to the local Docker values if unset. Copy `.env.example` to `.env` and
adjust as needed:

```bash
cp .env.example .env
```

**Values containing `;` (the MSSQL JDBC URL) must stay double-quoted in `.env`** — sourcing an
unquoted value with `;` in bash splits it into separate commands and silently truncates the URL.

Schema is created automatically via `spring.jpa.hibernate.ddl-auto=update` — no manual schema
scripts needed.

## Running the app

```bash
set -a && source .env && set +a
./mvnw spring-boot:run
```

App starts on `http://localhost:8080`. CORS is enabled for `http://localhost:5173` (Vite's
default dev server port) on `/api/**`, so the React app's favourite-place button can call this
directly.

## Endpoints

| Method | Path                  | Description                                          |
|--------|-----------------------|-------------------------------------------------------|
| POST   | `/api/favourites`     | Create a favourite; triggers reverse-geocode enrichment |
| GET    | `/api/favourites/{id}`| Get one by id                                         |
| GET    | `/api/favourites`     | Paginated list — `page` (default 0), `size` (default 10) |
| PUT    | `/api/favourites/{id}`| Update                                                |
| DELETE | `/api/favourites/{id}`| Delete                                                |

Postman collection: [`postman/java-assessment.postman_collection.json`](postman/java-assessment.postman_collection.json)
— import it, it covers all five endpoints including pagination params and the enrichment call.

Quick curl check:

```bash
curl -X POST http://localhost:8080/api/favourites \
  -H "Content-Type: application/json" \
  -d '{"placeId":"ChIJP3Sa8ziYEmsRUKgyFmh9AQM","name":"Sydney Opera House","address":"Bennelong Point, Sydney NSW","latitude":-33.8568,"longitude":151.2153}'
```

## Nested 3rd-party API call

`POST /api/favourites` saves the place first, then calls OpenStreetMap's free Nominatim reverse-
geocoding API (`client/ThirdPartyEnrichmentClient.java`, via `RestClient`) with the saved
lat/lng, and includes the result as `enrichedLocation` in the response. If the outbound call
fails or times out, the favourite is still saved — `enrichedLocation` is just `null` in that
response. The call only happens on create; `GET`/list responses don't re-fetch it.

## Request/response logging

`config/LoggingFilterConfig.java` is a global `OncePerRequestFilter` that wraps every request/
response in Spring's `ContentCachingRequestWrapper`/`ContentCachingResponseWrapper`, and logs
method, path, and body on the way in, and status and body on the way out — for every endpoint,
without per-controller boilerplate. `logback-spring.xml` routes all logs (this filter, Spring,
Hibernate) to both console and a rolling file at `logs/app.log` (10MB per file, 14 days / 200MB
retention).

## `@Transactional` reasoning

`FavouritePlaceServiceImpl` is annotated `@Transactional(readOnly = true)` at the class level,
which the read methods (`getById`, `list`) inherit — `readOnly` lets Hibernate skip dirty
checking and lets the driver/connection pool optimize for a read-only session. The three write
methods (`create`, `update`, `delete`) each override this with a plain `@Transactional`, which
gives them:

- **Propagation**: default `REQUIRED` — each call runs in its own transaction since none of
  these methods call each other, so there's no propagation nuance to reason about beyond "one
  write = one transaction."
- **Rollback rules**: Spring's default is rollback-on-unchecked-exception only. Every exception
  thrown from the service layer here (`FavouritePlaceNotFoundException`, `DuplicatePlaceException`)
  is a `RuntimeException`, so the default is exactly right — no `rollbackFor` needed. A failed
  update (e.g. entity not found) rolls back cleanly with no partial write.
- **`update()`** relies on JPA dirty checking instead of an explicit `save()` call — since the
  entity is loaded and mutated inside the same transaction, Hibernate flushes the changes at
  commit automatically.
- **Deliberate tradeoff in `create()`**: the outbound reverse-geocode HTTP call happens *inside*
  the transactional method, after the `save()`. That means the DB connection stays checked out
  for the duration of an external HTTP call, which isn't ideal under load — a stricter design
  would split the DB write and the enrichment call into separate transactional boundaries so a
  slow 3rd-party API can't hold a connection open. Kept as one method here for simplicity; noted
  in a comment in `FavouritePlaceServiceImpl.create()` as the first thing to split out if this
  needs to scale.
