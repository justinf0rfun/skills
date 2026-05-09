PACKAGE ?= @justinforfun/redo-skill

.PHONY: install build check pack publish run clean

install:
	npm install

build:
	npm run build -w $(PACKAGE)

check:
	npm run check

pack:
	npm pack --dry-run -w $(PACKAGE)

publish:
	npm publish -w $(PACKAGE) --access public

run:
	node packages/redo-skill/bin/install.js

clean:
	rm -rf packages/redo-skill/skills node_modules *.tgz
