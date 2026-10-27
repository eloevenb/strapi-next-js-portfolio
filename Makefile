-include .env.prod
NETWORK_NAME ?= portfolio-prod

.PHONY: help start-prod stop-prod build-prod clean-prod start-dev stop-dev build-dev rebuild-dev clean-dev logs-dev logs-prod ensure-dev-network

# Default target
help:
	@echo "Available targets:"
	@echo "  Production:"
	@echo "    make start-prod  - Start production containers"
	@echo "    make stop-prod   - Stop production containers"
	@echo "    make build-prod  - Build production containers"
	@echo "    make clean-prod  - Stop and remove production containers, networks, and volumes"
	@echo "    make logs-prod   - Show production logs"
	@echo ""
	@echo "  Development:"
	@echo "    make start-dev   - Start Strapi, Postgres, and the frontend"
	@echo "    make stop-dev    - Stop those containers (leaves the devcontainer running)"
	@echo "    make build-dev   - Build Strapi and frontend images"
	@echo "    make rebuild-dev - Rebuild and recreate the app containers"
	@echo "    make clean-dev   - Remove app containers and the database volume"
	@echo "    make logs-dev    - Show development logs"

# Production targets
start-prod:
	@echo "Starting production environment..."
	docker compose --env-file .env.prod -f docker-compose.prod.yml up -d

stop-prod:
	@echo "Stopping production environment..."
	docker compose --env-file .env.prod -f docker-compose.prod.yml down

build-prod:
	@echo "Starting Strapi so the frontend build can fetch data..."
	docker compose --env-file .env.prod -f docker-compose.prod.yml up -d strapi strapiDB
	@echo "Ensuring buildx builder for the $(NETWORK_NAME) network exists..."
	@docker network inspect $(NETWORK_NAME) >/dev/null 2>&1 || docker network create $(NETWORK_NAME)
	@docker buildx inspect portfolio-builder >/dev/null 2>&1 && docker buildx use portfolio-builder || docker buildx create --name portfolio-builder --driver docker-container --driver-opt network=$(NETWORK_NAME) --use
	@echo "Waiting for Strapi to be ready..."
	@until docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T strapi curl -sf http://localhost:1337/admin >/dev/null; do \
		echo "  Strapi not ready yet, waiting..."; \
		sleep 3; \
	done
	@echo "Building frontend production image..."
	docker compose --env-file .env.prod -f docker-compose.prod.yml build frontend
	@echo "Production build complete."

clean-prod:
	@echo "Cleaning production environment (removing containers, networks, and volumes)..."
	docker compose --env-file .env.prod -f docker-compose.prod.yml down -v

logs-prod:
	docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f

# Development targets. The devcontainer is a separate Compose project, so these
# never recreate it. Bind mounts go through the host Docker daemon: inside the
# devcontainer, "." is /workspace, which the host cannot mount.
DEV_COMPOSE = --env-file .env.dev -f docker-compose.dev.yml
APP_SERVICES = strapi strapiDB frontend
DEV_NETWORK_NAME := $(shell awk -F= '/^NETWORK_NAME=/ {print $$2; exit}' .env.dev 2>/dev/null)
ifeq ($(DEV_NETWORK_NAME),)
DEV_NETWORK_NAME := portfolio-dev
endif

# HOST_WORKSPACE_FOLDER is set by devcontainer.json after a rebuild. Until then,
# read the workspace mount from the running devcontainer.
define host_workspace_env
host_ws="$${HOST_WORKSPACE_FOLDER:-}"; \
if [ -z "$$host_ws" ]; then \
	host_ws=$$(docker inspect portfolio-devcontainer --format '{{range .Mounts}}{{if eq .Destination "/workspace"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || true); \
fi; \
if [ -z "$$host_ws" ]; then host_ws="."; fi; \
HOST_WORKSPACE_FOLDER="$$host_ws"
endef

ensure-dev-network:
	@docker network inspect $(DEV_NETWORK_NAME) >/dev/null 2>&1 || docker network create $(DEV_NETWORK_NAME)

start-dev: ensure-dev-network
	@echo "Starting development environment..."
	@$(host_workspace_env) docker compose $(DEV_COMPOSE) up -d $(APP_SERVICES)

stop-dev:
	@echo "Stopping development environment..."
	@$(host_workspace_env) docker compose $(DEV_COMPOSE) stop $(APP_SERVICES)

build-dev:
	@echo "Building development containers..."
	@$(host_workspace_env) docker compose $(DEV_COMPOSE) build $(APP_SERVICES)

rebuild-dev: ensure-dev-network
	@echo "Rebuilding development containers..."
	@$(host_workspace_env) docker compose $(DEV_COMPOSE) up -d --build $(APP_SERVICES)

clean-dev:
	@echo "Removing development app containers and the database volume..."
	@$(host_workspace_env) docker compose $(DEV_COMPOSE) down -v

logs-dev:
	@$(host_workspace_env) docker compose $(DEV_COMPOSE) logs -f $(APP_SERVICES)
