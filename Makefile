default: build test

install:
	(cd sample && npm install)

build:
	(cd sample && ng build)

test:
	(cd sample && ng test)

lint:
	(cd sample && ng lint)
