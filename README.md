# Distributed Finance Engine

**A polyglot, containerised microservice system: a React client talks to a Python
gateway, which routes authentication to Django and financial computation to a C++
service, with MySQL behind them — five containers, one `docker compose up`.**

The point of the project is the *architecture*, not the arithmetic: separating a
system by responsibility and language, then making the pieces talk to each other
reliably across a Docker network.

---

## Architecture

```
                    ┌──────────────────────┐
                    │  React Frontend      │  :3000
                    │  login + calculator  │
                    └──────────┬───────────┘
                               │ HTTP (CORS)
                    ┌──────────▼───────────┐
                    │  Flask API Gateway   │  :8000
                    │  routing only        │
                    └───┬──────────────┬───┘
                        │              │
         POST /login    │              │  POST /calculate
                        │              │
        ┌───────────────▼───┐   ┌──────▼────────────────┐
        │ Django Auth       │   │ C++ Crow Finance      │
        │ Service     :8001 │   │ Engine          :8002 │
        │ token issuance    │   │ compound projection   │
        └───────────────┬───┘   └───────────────────────┘
                        │
                 ┌──────▼──────┐
                 │  MySQL 8.0  │  :3306
                 └─────────────┘
```

Every service is its own container, defined in `docker-compose.yml`. The gateway
addresses the others by Docker network name (`auth-service`, `finance_backend`),
not by host port — so the internal topology can change without touching the client.

## The services

| Service | Language / stack | Port | Responsibility |
|---|---|---|---|
| `frontend` | React (Create React App) | 3000 | Login form and retirement calculator UI; gates the calculator behind a successful login |
| `gateway` | Python, Flask, flask-cors | 8000 | Pure routing. Forwards `/login` to the auth service and `/calculate` to the finance engine, relaying status codes and bodies unchanged. Holds no business logic |
| `auth_service` | Python, Django, DRF | 8001 | Token-based authentication via a `CustomAuthToken` view at `/login/` |
| `finance_service` | C++17, Crow, `<cmath>` | 8002 | `POST /calculate-retirement` — compound-interest projection with monthly contributions |
| `db` | MySQL 8.0 | 3306 | Persistence, with a named volume so data survives a container restart |

## Design decisions worth calling out

**The gateway is deliberately dumb.** It validates nothing and computes nothing. It
exists so the browser talks to exactly one origin while the backend is free to be
two different languages. Each proxy route wraps its upstream call and returns a
`500` with a readable message if the service is unreachable, rather than hanging.

**Computation lives in C++, authentication in Django.** Each half is written in the
stack that suits it: Django brings a mature auth and token system for free, while
the projection loop is numeric work that C++ handles directly. This is the actual
reason to build a polyglot system rather than a single Django app.

**Services resolve each other by container name.** `http://auth-service:8000` and
`http://finance_backend:8080` are Docker-network addresses. Nothing depends on
host port mapping, so the compose file can be rearranged without code changes.

**CORS is scoped at the gateway**, the only service the browser ever sees.

## The financial model

`POST /calculate-retirement` takes `age` and `monthly_savings` and returns the
projected balance at retirement age 67, assuming a 7 % nominal annual return
compounded monthly:

```
r = 0.07 / 12                       # monthly rate
n = (67 − age) × 12                 # contribution periods
FV = monthly_savings × ((1 + r)^n − 1) / r × (1 + r)
```

This is the future value of an **annuity due** — contributions are made at the
start of each period, hence the trailing `(1 + r)` factor. The service returns
`retirement_total` and `years_left`, and short-circuits with a plain message when
the user is already at or past 67.

The 7 % return is a hard-coded assumption, not a forecast. See *Limitations*.

## Running it

```bash
git clone https://github.com/kaiffarooqui970/distributed-finance-engine.git
cd distributed-finance-engine
docker compose up --build
```

Then open <http://localhost:3000>. You will need a Django user before the login
form will succeed:

```bash
docker compose exec auth-service python manage.py migrate
docker compose exec auth-service python manage.py createsuperuser
```

| URL | What it is |
|---|---|
| http://localhost:3000 | React client |
| http://localhost:8000 | Gateway health check |
| http://localhost:8001 | Django auth service |
| http://localhost:8002 | C++ finance engine |

Calling the engine directly, bypassing the gateway:

```bash
curl -X POST http://localhost:8002/calculate-retirement \
  -H "Content-Type: application/json" \
  -d '{"age": 25, "monthly_savings": 400}'
```

## Limitations

These are deliberate scope boundaries, stated so the project is not read as more
than it is:

- **The 7 % return is hard-coded** and nominal — no inflation adjustment, no
  volatility, no sequence-of-returns risk. It is a deterministic projection, not a
  simulation. (For the stochastic version of this problem, see
  [QuantShield](https://github.com/kaiffarooqui970/QuantShield), which runs Monte
  Carlo over 20,000 correlated paths.)
- **The auth token is received but not yet enforced** on the `/calculate` route —
  the frontend gates the UI, but the endpoint itself is currently unauthenticated.
- **Credentials in `docker-compose.yml` are development defaults.** They must be
  moved to environment variables before this runs anywhere real.
- No test suite yet; the services have been exercised manually via the UI and curl.

## Repository layout

```
distributed-finance-engine/
├── docker-compose.yml      five services, one network
├── gateway/                Flask routing layer
│   └── main.py
├── auth_service/           Django + DRF token auth
│   ├── config/
│   └── users/
├── finance_service/        C++ Crow HTTP service
│   └── main.cpp
└── frontend/               React client
    └── src/App.js
```
