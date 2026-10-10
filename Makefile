default: build test

build:
	(cd sample && ng build)

test:
	(cd sample && ng test)
