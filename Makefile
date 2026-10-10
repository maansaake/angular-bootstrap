default: build test

install:
	(cd sample && npm ci)

install/cli:
	npm install -g @angular/cli

build:
	(cd sample && ng build)

test:
	(cd sample && ng test)

lint:
	(cd sample && ng lint)
