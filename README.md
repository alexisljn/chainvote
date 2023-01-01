# Chainvote

Chainvote allows small organizations to leverage blockchain capacities
in order to organize votings. 

The project is an enhancement of the three first projects of 
the blockchain developer course from Alyra, the French blockchain school.

1) https://github.com/alexisljn/alyra-voting-project Smart contract project
2) https://github.com/alexisljn/alyra-test-project Smart contract testing project
3) https://github.com/alexisljn/alyra-front-project Frontend project

I have rewritten the contract to avoid loops and other iterations to avoid 
gas consumption. I wasn't really aware on how the gas aspect is clearly
leading the way we write code when I did the first version.

I kept most of the features that was requested in the Alyra project 
to preserve the continuity between the projects

## Requirements
- Docker
- Make

**Don't forget to fill .env files to run the project locally**
## Commands

### Start
`docker compose up` to launch container and start hardhat local node

### Compilation
`make compile` 

### Testing
*Read makefile to consult options*

`make test`

### Coverage
`make coverage`

### Running scripts
*Read makefile to consult options*

`make run`

### Miscellaneous 
#### launch hardhat console
`make console`

#### launch hardhat container bash
`make bash`
