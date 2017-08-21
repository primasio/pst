Git 

.PHONY: default
default: all

.PHONY: all
all: test


build/PrimasToken.abi: src/main.sol solidity.py
	python2 solidity.py
build/PrimasToken.bin: src/main.sol solidity.py
	python2 solidity.py

.PHONY: test
test: build/PrimasToken.abi build/PrimasToken.bin
	node tests/test.js

.PHONY: deploy
deploy:
	node src/deploy.js

# test:
# 	npm install -d
# 	node tests/tests.js
