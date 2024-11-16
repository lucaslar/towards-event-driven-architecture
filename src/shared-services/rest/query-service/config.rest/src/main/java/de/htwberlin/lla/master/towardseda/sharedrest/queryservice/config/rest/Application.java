package de.htwberlin.lla.master.towardseda.sharedrest.queryservice.config.rest;

import io.vertx.config.ConfigRetriever;
import io.vertx.config.ConfigRetrieverOptions;
import io.vertx.config.ConfigStoreOptions;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.DecodeException;
import io.vertx.core.json.JsonObject;
import io.vertx.core.spi.VerticleFactory;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan
public class Application {

    public static void main(String[] args) {
        final String packages = "de.htwberlin.lla.master.towardseda.sharedrest.queryservice";
        final AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(packages);
        final Vertx vertx = context.getBean(Vertx.class);
        final VerticleFactory factory = context.getBean(VerticleFactory.class);

        final String configPath = "config.json";
        final JsonObject config = new JsonObject().put("path", configPath);
        final ConfigStoreOptions fileStore = new ConfigStoreOptions().setType("file").setConfig(config);
        final ConfigRetrieverOptions options = new ConfigRetrieverOptions().addStore(fileStore);

        ConfigRetriever.create(vertx, options).getConfig(ar -> {
            if (ar.failed()) {
                System.err.println("Application: Failed to retrieve required config (Path: " + configPath + ").");
                System.err.println("Application: If you're running in Docker please mount a config to '/application/" + configPath + "'.");
                System.exit(1);
            } else {
                final String lsKey = "laureateServices";
                if (!ar.result().containsKey(lsKey)) {
                    System.err.println("Application: Invalid config. Requires JSON array '" + lsKey + "'.");
                    System.exit(1);
                } else {
                    try {
                        System.out.println("Application: Starting with laureate service config: " + ar.result().getJsonArray(lsKey).toString());
                    } catch (Exception e) {
                        System.err.println("Application: Config file seems to be invalid. Expectation is a JSON array '" + lsKey + "':");
                        System.err.println(e);
                        System.exit(1);
                    }
                    final DeploymentOptions deploymentOptions = new DeploymentOptions().setConfig(ar.result());
                    vertx.deployVerticle(factory.prefix() + ":" + QueryVerticle.class.getName(), deploymentOptions);
                }
            }
        });
    }

    @Bean
    public Vertx vertx(final VerticleFactory verticleFactory) {
        Vertx vertx = Vertx.vertx();
        vertx.registerVerticleFactory(verticleFactory);
        return vertx;
    }
}
