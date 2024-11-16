cd "$(cd "$(dirname "$0")" && pwd)"

sh scripts/remove-copies.sh

printf "\n***************************************************\n"
printf "\n| File removal finished. Shutting down containers |\n"
printf "\n***************************************************\n\n"


docker compose -f ./src/docker-compose.yml -p towardseda-shared down -v --rmi 'local'

for dir in ./src/samples/sample-*; do
  nr=$(echo $dir | tr -dc '0-9')
  docker compose -f $dir/docker-compose.yml -p towardseda-sample-$nr down -v --rmi 'local'
done

docker rmi towardseda/sharedimgs-rest/prize-service
docker rmi towardseda/sharedimgs-rest/query-service
docker rmi towardseda/sharedimgs-rest/laureate-service-02
docker rmi towardseda/sharedimgs-rest/laureate-service-03
docker rmi towardseda/sharedimgs-ed/laureate-service-04

docker network rm towardseda_shared_to_samples

rm -rf ./src/samples/sample-04/rabbitmq-data
rm -rf ./src/stats-mongodata

printf "\nImages removed in this shutdown are limited to those specifically built in this application.\n"
echo "Please check if all images could be removed successfully consider removing official used images, such as 'postgres:14-alpine', if necessary."
echo "To this end, you can use the command 'docker rmi <image ID/name:tag>' (more images can be added separated by spaces)."
echo "In order to list all installed images, run 'docker images'."
