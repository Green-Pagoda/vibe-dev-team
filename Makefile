all: checkov


checkov:
	# Checkov static analysis
	checkov


yor:
	# Update Yor tags
	yor tag -d .


atmos-validate:
	# Validate Atmos stacks and schemas
	cd infra && atmos validate stacks && atmos validate schema


atmos-describe:
	# Generate stack descriptions
	cd infra && atmos describe stacks


test-infra:
	# Run complete infrastructure test suite
	cd infra && npm run test:infra


git_sync:
	# Synchronize with Github
	git checkout master
	git pull
	git remote prune origin | grep pruned | cut -d' ' -f4 | sed 's/origin\///' | xargs -I {} git branch -D {} 2>/dev/null


# Docker Development Commands
# ==========================

.PHONY: up
up: ## Start all services with docker-compose
	docker-compose up -d

.PHONY: down
down: ## Stop all services
	docker-compose down

.PHONY: logs
logs: ## Show logs for all services
	docker-compose logs -f

.PHONY: logs-dispatcher
logs-dispatcher: ## Show logs for plane-event-dispatcher
	docker-compose logs -f plane-event-dispatcher

.PHONY: restart
restart: ## Restart all services
	docker-compose restart

.PHONY: restart-dispatcher
restart-dispatcher: ## Restart plane-event-dispatcher
	docker-compose restart plane-event-dispatcher

.PHONY: build
build: ## Build all Docker images
	docker-compose build

.PHONY: build-dispatcher
build-dispatcher: ## Build plane-event-dispatcher image
	docker-compose build plane-event-dispatcher

.PHONY: shell
shell: ## Get shell in plane-event-dispatcher container
	docker-compose exec plane-event-dispatcher sh

.PHONY: shell-agent
shell-agent: ## Get shell in feature-estimator container
	docker-compose exec feature-estimator sh

.PHONY: install
install: ## Install dependencies for all services
	cd services/plane-event-dispatcher && bun install
	cd services/agents/feature-estimator && bun install

.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	cd services/plane-event-dispatcher && bun run typecheck

.PHONY: lint
lint: ## Run linting
	cd services/plane-event-dispatcher && bun run lint

.PHONY: format
format: ## Format code with Prettier
	cd services/plane-event-dispatcher && bun run format

.PHONY: test
test: ## Run tests
	@echo "TODO: Add test command"

.PHONY: health
health: ## Run full system health check (typecheck, format, lint)
	npm run typecheck && npm run format:check && npm run lint

.PHONY: demo
demo: ## Run feature estimator demo
	npm run demo:feature-estimator

.PHONY: clean
clean: ## Clean up generated files and containers
	docker-compose down -v
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	find . -name "dist" -type d -prune -exec rm -rf '{}' +

