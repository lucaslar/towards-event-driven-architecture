# Nobel Prize Data Collector

## About

This Node.js application is used for downloading/updating data from the Nobel Prize API and process it (this includes requesting a Nominatim service).
The produced data, will then be used for initializing the sample implementations (see [parent README](../../../README.md) of this repository for more information).

The Nobel Prize Data Collector requires an active Internet connection and is intended to run in a Docker container (see information below).

However, as this data is under version control, it is not required to run this tool for initializing the project.

## Getting it started locally

### Build an image

```shell
docker build --tag nobel-prize-data-collector .
```

### Run the containerized data collector

```shell
docker run -v <data-directory>:/usr/src/app/data --rm nobel-prize-data-collector
```

- `-v <data-directory>:/usr/src/app/data`: Path to the directory the data is to be stored at (mounted to container).
- `--rm`: Remove the container after being stopped.

Example:
```shell
docker run -v /Users/lla/IntelliJProjects/towards-event-driven-design-samples/data:/usr/src/app/data --rm nobel-prize-data-collector
```
