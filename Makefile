# Makefile for Orbyt Template Studio

# Use .PHONY to ensure these targets run even if files with the same name exist.
.PHONY: install dev build test lint clean

# =================================================================================================# VARIABLES
# =================================================================================================DOCKER_COMPOSE = docker-compose -f infra/docker-compose.yml

# =================================================================================================# TARGETS
# =================================================================================================

## install: Install all dependencies using pnpm
install:
	@echo "Installing dependencies..."
	pnpm install

## dev: Start all services in detached mode using Docker Compose
dev:
	@echo "Starting all services with Docker Compose..."
	$(DOCKER_COMPOSE) up --build -d

## build: Build all packages and services using Turborepo
build:
	@echo "Building all packages and services..."
	pnpm turbo run build

## test: Run tests across all workspaces
test:
	@echo "Running tests..."
	pnpm turbo run test

## lint: Run linting across all workspaces
lint:
	@echo "Linting codebase..."
	pnpm turbo run lint

## clean: Remove all node_modules and build artifacts
clean:
	@echo "Cleaning up the monorepo..."
	rm -rf node_modules
	pnpm turbo run clean
	rm -rf apps/*/dist
	rm -rf apps/*/.next
	rm -rf services/*/dist
	rm -rf packages/*/dist

## stop: Stop all running Docker containers
stop:
	@echo "Stopping all services..."
	$(DOCKER_COMPOSE) down
