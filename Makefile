.PHONY: logto-init migrate

logto-init:
	docker compose run --remove-orphans --rm logto cli db seed -- --swe
	docker compose run --remove-orphans --rm logto cli db alteration deploy
	docker compose run --remove-orphans --rm -e PGPASSWORD=logto logto-db \
		psql -h logto-db -U logto -d logto \
		-c "ALTER TABLE _logto_configs ENABLE ROW LEVEL SECURITY; ALTER TABLE _logto_configs FORCE ROW LEVEL SECURITY;"

migrate:
	docker compose exec backend uv run alembic upgrade head

build:
	docker compose down -v frontend
	docker compose build
