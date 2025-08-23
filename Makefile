# Use bash for better scripting
SHELL := /bin/bash

# Run migration generation inside the api container
migrate-gen:
	docker compose exec api npm run migrate:gen

# Apply migrations inside the api container
migrate-run:
	docker compose exec api npm run migrate:run

# Revert the last migration
migrate-revert:
	docker compose exec api npm run migrate:revert

# Build app (compiles NestJS to dist/)
build:
	docker compose exec api npm run build

# Start stack (api + db + nginx)
up:
	docker compose up -d

# Stop stack
down:
	docker compose down

# Check container logs
logs:
	docker compose logs -f api

# Install Node dependencies
install:
	cd api && npm install

# Lint code
lint:
	cd api && npm run lint

# Run tests
test:
	cd api && npm run test

# Clean build artifacts and Docker resources
clean:
	rm -rf api/dist api/node_modules api/coverage
	docker compose down -v --remove-orphans
	docker system prune -f
