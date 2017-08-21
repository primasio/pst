
.PHONY: default
default: all

.PHONY: all
all: test

build/PrimasToken.abi:
	python2 solidity.py
build/PrimasToken.bin:
	python2 solidity.py

node_modules:
	npm install -d

build: build/PrimasToken.abi build/PrimasToken.bin src/main.sol solidity.py
	python2 solidity.py

.PHONY: test
test: build node_modules
	node tests/test.js

.PHONY: deploy
deploy: node_modules
	node src/deploy.js

