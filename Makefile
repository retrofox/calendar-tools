build-dist: run-browserbuild

test: run-test

run-browserbuild:
	browserbuild lib/ -g caTools -m lib/calendar-tools.js

run-test:
	@node_modules/.bin/expresso -I lib --growl $(TEST_FLAGS) test/*.test.js

.PHONY: test
