cd "$( cd "$( dirname "$0" )" && pwd)"

rm -rf ../src/samples/sample-*/database
rm -rf ../src/samples/sample-*/databases
echo "=> Removed copied database files (scripts and data)"

rm ../src/samples/sample-*/services/**/Dockerfile
rm ../src/samples/sample-*/services/**/.dockerignore
rm ../src/shared-services/**/**/Dockerfile
rm ../src/shared-services/**/**/.dockerignore
echo "=> Removed copied files for dockerizing Vert.x projects"

rm -rf ../src/samples/sample-*/api-documentation/resources
rm -rf ../src/samples/sample-*/api-documentation/schemas
echo "=> Removed copied API documentation files"
