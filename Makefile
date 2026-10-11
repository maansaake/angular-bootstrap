default: build test

install:
	(cd sample && npm ci)

install/cli:
	npm install -g @angular/cli

codegen:
	(cd sample && npm run codegen)

build/dev:
	(cd sample && ng build --configuration development)

build/prod:
	(cd sample && ng build)

test:
	(cd sample && ng test)

lint:
	(cd sample && ng lint)
