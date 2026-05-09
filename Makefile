NPM_SCOPE ?= @justinforfun
SKILL_ARG := $(word 2,$(MAKECMDGOALS))
ifneq ($(SKILL_ARG),)
SKILL ?= $(SKILL_ARG)
endif
PACKAGE = $(NPM_SCOPE)/$(SKILL)-skill
ifneq ($(OTP),)
OTP_FLAG = --otp $(OTP)
endif

.PHONY: install build check pack publish run version clean require-skill require-bump

require-skill:
ifndef SKILL
	$(error SKILL is required, for example: make publish SKILL=redo or make publish redo)
endif

require-bump:
ifndef BUMP
	$(error BUMP is required, for example: make version redo BUMP=patch)
endif

install:
	npm install

build: require-skill
	npm run build -w $(PACKAGE)

check:
	npm run check

pack: require-skill
	npm pack --dry-run -w $(PACKAGE)

publish: require-skill check pack
	npm publish -w $(PACKAGE) --access public $(OTP_FLAG)

run: require-skill
	npm run start -w $(PACKAGE)

version: require-skill require-bump
	npm version $(BUMP) -w $(PACKAGE)

clean:
	rm -rf packages/*/skills node_modules *.tgz

%:
	@:
