default: check

install:
	npm ci

install/cli:
	npm install -g @angular/cli

codegen:
	npx @openapitools/openapi-generator-cli generate -g typescript-angular -i openapi/auth_basic.yaml -o src/app/services/auth-basic && npx @openapitools/openapi-generator-cli generate -g typescript-angular -i openapi/backend.yaml -o src/app/services/backend

format:
	npx prettier --write .

format/check:
	npx prettier --check .

lint:
	ng lint --fix

lint/ci:
	ng lint

build/dev:
	ng build --configuration development

build/prod:
	ng build

test:
	ng test --watch false

serve:
	ng serve

# Everything CI runs, in order.
check: format/check lint/ci build/prod test

.PHONY: default install install/cli codegen format format/check lint lint/ci build/dev build/prod test serve check
