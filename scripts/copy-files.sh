cd "$( cd "$( dirname "$0" )" && pwd)"

if [[ "$OSTYPE" == "darwin"* ]]; then IS_OSX=true; fi

single_db_samples="01 02"
multi_db_samples="03 04"
multi_sync_service_samples="02 03"

# DB Initialization

for x in $single_db_samples; do
  mkdir -p ../src/samples/sample-$x/database/scripts ../src/samples/sample-$x/database/data
  cp ../data/csv_data/shared/*.csv ../src/samples/sample-$x/database/data/
  cp ../shared/default-files/database-init/shared/* ../src/samples/sample-$x/database/scripts/
  cp ../data/csv_data/monolith_only/*.csv ../src/samples/sample-$x/database/data/
  cp ../shared/default-files/database-init/monolith_only/* ../src/samples/sample-$x/database/scripts/
done

for x in $multi_db_samples; do
  mkdir -p ../src/samples/sample-$x/databases/prizes/scripts ../src/samples/sample-$x/databases/prizes/data/
  cp ../data/csv_data/shared/prize*.csv ../src/samples/sample-$x/databases/prizes/data/
  cp ../shared/default-files/database-init/shared/0-init-prize.sql ../src/samples/sample-$x/databases/prizes/scripts/
  cp ../shared/default-files/database-init/distributed_only/1-init-prize-to-laureate.sql ../src/samples/sample-$x/databases/prizes/scripts/
  cp ../shared/default-files/database-init/shared/a-copy-prize.sql ../src/samples/sample-$x/databases/prizes/scripts/
  cp ../shared/default-files/database-init/shared/c-copy-prize-to-laureate.sql ../src/samples/sample-$x/databases/prizes/scripts/

  for y in $(ls ../data/csv_data/distributed_only/); do
    category=$(echo $y | sed 's/.csv//' | sed 's/laureates_//')
    mkdir -p ../src/samples/sample-$x/databases/laureates/$category/scripts ../src/samples/sample-$x/databases/laureates/$category/data
    cp ../data/csv_data/distributed_only/$y ../src/samples/sample-$x/databases/laureates/$category/data/
    cp ../shared/default-files/database-init/shared/0-init-laureate.sql ../src/samples/sample-$x/databases/laureates/$category/scripts/
    cp ../shared/default-files/database-init/distributed_only/a-copy-laureates_$category.sql ../src/samples/sample-$x/databases/laureates/$category/scripts/
  done
done

echo "=> Copied database initialization files (scripts and data)"

# Copy Vert.x Dockerfile/.dockerignore

for x in ../src/samples/sample-*/services/*; do
  cp ../shared/default-files/vertx-init/vertx.Dockerfile $x/Dockerfile
  cp ../shared/default-files/vertx-init/vertx.dockerignore $x/.dockerignore
done

for x in ../src/shared-services/*/*; do
  cp ../shared/default-files/vertx-init/vertx.Dockerfile $x/Dockerfile
  cp ../shared/default-files/vertx-init/vertx.dockerignore $x/.dockerignore
done

echo "=> Copied files for dockerizing Vert.x projects"

# Copy API documentation files

for x in "01" $multi_sync_service_samples; do
  mkdir -p ../src/samples/sample-$x/api-documentation/resources ../src/samples/sample-$x/api-documentation/schemas
done

cp ../shared/api-docs/resources/query.yaml ../src/samples/sample-01/api-documentation/resources/
cp ../shared/api-docs/schemas/* ../src/samples/sample-01/api-documentation/schemas/

for x in $multi_sync_service_samples; do
  cp ../shared/api-docs/resources/* ../src/samples/sample-$x/api-documentation/resources/
  cp ../shared/api-docs/schemas/* ../src/samples/sample-$x/api-documentation/schemas/
done

echo "=> Copied API documentation files"
