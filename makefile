.PHONY: setup run bash compile test console deploy coverage

NETWORK="localhost"

setup:
	docker compose run --rm hardhat npm install -D --verbose @nomicfoundation/hardhat-toolbox dotenv

bash:
	docker compose exec hardhat bash

compile:
	docker compose exec hardhat npx hardhat compile

test:
ifdef FILES
	docker compose exec hardhat npx hardhat test $(FILES) --network $(NETWORK)
else
	docker compose exec hardhat npx hardhat test --network $(NETWORK)
endif

run:
ifdef SCRIPT
	docker compose exec hardhat npx hardhat run $(SCRIPT) --network $(NETWORK)
else
	docker compose exec hardhat npx hardhat run ./scripts/deploy.ts --network $(NETWORK)
endif

console:
	docker compose exec hardhat npx hardhat console --network $(NETWORK)

coverage:
	docker compose exec hardhat npx hardhat coverage --network hardhat --solcoverjs ./.solcover.js
