FROM maven:3.8.4-eclipse-temurin-17 AS build
WORKDIR /home/app
COPY .. .
RUN mvn -f /home/app/pom.xml clean package -B

FROM adoptopenjdk/openjdk16:jre
WORKDIR /application
ARG MAIN_MODULE
# default env variables
ENV RABBIT_USER=guest
ENV RABBIT_PASSWORD=guest
ENV RABBIT_PORT=5672
ENV PG_USER=postgres
ENV PG_PASSWORD=postgres
ENV PG_DB=db
ENV PG_PORT=5432
COPY --from=build /home/app/$MAIN_MODULE/target/*-fat.jar app.jar
ENTRYPOINT ["sh", "-c"]
CMD ["exec java -jar app.jar"]
