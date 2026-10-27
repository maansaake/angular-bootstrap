default: check

install:
	npm ci

install/cli:
	npm install -g @angular/cli

codegen:
	npm run codegen

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
