cd "$(cd "$(dirname "$0")" && pwd)"

sh scripts/copy-files.sh

printf "\n***************************************\n"
printf "\n| Setup finished. Starting containers |\n"
printf "\n***************************************\n\n"

docker network create towardseda_shared_to_samples
docker build --build-arg MAIN_MODULE=config.rest --tag towardseda/sharedimgs-rest/prize-service ./src/shared-services/rest/prize-service
docker build --build-arg MAIN_MODULE=config.rest --tag towardseda/sharedimgs-rest/query-service ./src/shared-services/rest/query-service
docker build --build-arg MAIN_MODULE=config.rest --tag towardseda/sharedimgs-rest/laureate-service-02 ./src/shared-services/rest/laureate-service-sample-02
docker build --build-arg MAIN_MODULE=config.rest --tag towardseda/sharedimgs-rest/laureate-service-03 ./src/shared-services/rest/laureate-service-sample-03
docker build --build-arg MAIN_MODULE=config.amqp --tag towardseda/sharedimgs-ed/laureate-service-04 ./src/shared-services/event-driven/laureate-service-sample-04

docker compose -f ./src/docker-compose.yml -p towardseda-shared up -d

for dir in ./src/samples/sample-*; do
  nr=$(echo $dir | tr -dc '0-9')
  docker compose -f $dir/docker-compose.yml -p towardseda-sample-$nr up -d
done
