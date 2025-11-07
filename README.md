## Stock Price Checker API


### A NestJS + Prisma + Postgres service for tracking stock prices.

How to run:

- Ensure Docker and Docker Compose are installed.

- Create a .env file in the project root (include DATABASE_URL and any other required vars).

- Start the stack:
``` shell
docker compose up
```


API docs (Swagger)

- Once the containers are up, open:

http://localhost:8000/api

Notes


- The database is a Postgres container managed by docker-compose.

- Prisma handles schema synchronization/migrations during startup.

- Stop the stack with:

``` shell
docker compose down
```