default: lint build/dev test

install:
	npm ci

install/cli:
	npm install -g @angular/cli

codegen:
	npm run codegen

build/dev:
	ng build --configuration development

build/prod:
	ng build

test:
	ng test --watch false

lint:
	ng lint --fix

serve:
	ng serve
