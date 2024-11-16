# Towards Event-Driven Architecture: Samples [Master Thesis]

This is a practical project implemented within the scope of a master thesis written in 2021/2022 at HTW Berlin:

> Transitioning from Synchronous to Event-Driven Architectures - [hidden project-related subtitle]

The monorepo aims at illustrating the migration towards event-driven architectures by hands-on examples.

## About

The chosen example, the _Laureate Search Tool_, is based on an actual project (stack, components, ...) for which a migration was analyzed within the thesis.
Its core functionality is an advanced search logic.
However, the real-life project is not mentioned in this repository version.

This project contains the following five Docker Compose configurations:
- `towardseda-shared`:
  - **UI** for the implemented Laureate Search Tool which runs on port `8321` and communicates with the Parallel Run Service described below.
  - **Parallel Run Service** used for proxying a request to the "source of truth", the microservice implementation (sample 03), and emitting an event/sending the same request to the other three architecture implementations in order to compare results.
  - **Parallel Run Monitor Frontend** running on port `8322` to display statistics about how requests were handled by the four implementations.
  - **Statistics DB** (MongoDB) for storing data.
- `towardseda-sample-01`: [Modular monolith](./src/samples/sample-01/README.md)
- `towardseda-sample-02`: [Service-Based Architecture (synchronous communication)](./src/samples/sample-02/README.md)
- `towardseda-sample-03`: [Microservices (synchronous communication)](./src/samples/sample-03/README.md)
- `towardseda-sample-04`: [Microservices (event-driven/asynchronous communication)](./src/samples/sample-04/README.md)

The [Nobel Prize Data Collector](./src/helpers/nobel-prize-data-collector/README.md) is a helper tool implemented for fetching the used data.

Further functionality of both the exemplary _Laureate Search Tool_ and other implemented logic is described in the master thesis.

## Set it up locally

### Cloning 

When cloning, please pay attention that all files were loaded properly (any failures will be printed in your terminal).
As some paths and file names in this repository are long, your OS - particularly Windows - might have problems to store them.
In this case, clone the repository to a directory with a shorter path.

### Requirements

- Terminal supporting `Shell` files:
    - Mac OS/Linux: Natively supported
    - Windows: [Git Bash](https://gitforwindows.org/) (among others)
- [Docker](https://www.docker.com/) + [Docker-Compose](https://docs.docker.com/compose/)

Some services will use port mapping in order to be accessible from your machine.
Suche being the case, please make sure the following ports are unused:
- `8101`
- `8102`
- `8103`
- `8104`
- `8321`
- `8322` (added after handing in the thesis for demonstration purposes, see [here](./src/monitor-frontend/README.md))
- `15672`

If necessary, port mappings are adjustable in the respective Docker Compose files.

### Setup

In order to start all services locally, run the application's [setup script](./setup.sh) from your terminal:

```shell
sh setup.sh
```

It will:
- copy shared files required for initialization/documentation
- create a shared network for communication between containers of different compose setups
- build shared images (such as laureate (micro)services)
- start Docker Compose configurations with a predefined prefix, i.e.:
  - samples (01-04) with an API documentation externally available on port `810<sample nr>` for each sample
  - shared containers (Parallel Run Service + DB, Monitor Frontend on port [`8321`](http://localhost:8322) and Application Frontend on port [`8321`](http://localhost:8321))

Have a coffee. The initialization might take a moment. ☕

> **Note:** The setup script aims at minimizing efforts for setting up the project locally.
However, unforeseen errors might occur, e.g. due to network problems.
Therefore, please check logs if services do not appear to have been started properly and re-run the script in case of doubt (stable Docker Compose configurations will not be affected by re-running the script and the Docker Compose command, respectively).

### Shutdown

Similar to the setup script described above, this repository provides a [shutdown script](shutdown.sh) for shutting down the project.
You can run it as:

```shell
sh shutdown.sh
```

Accordingly, it will:

- remove shared copied initialization/documentation files
- shut down all Docker Compose configurations including volumes and local images (see information below)
- remove shared images (such as laureate (micro)services)
- remove the created network for shared access
- in addition, the script will remove the mounted Rabbit MQ data (necessary for storing messages if broker is deleted/stopped and restarted)

> **Note:** The shutdown script will only remove local images. Official images such as `postgres:14-alpine` will not be removed as they might be in use in a different context.
> In order to remove them, run: `docker rmi <image name(s)>`
