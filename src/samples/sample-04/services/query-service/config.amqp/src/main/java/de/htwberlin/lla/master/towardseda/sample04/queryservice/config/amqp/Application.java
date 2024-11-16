package de.htwberlin.lla.master.towardseda.sample04.queryservice.config.amqp;

import io.vertx.core.Vertx;
import io.vertx.core.spi.VerticleFactory;
import io.vertx.rabbitmq.RabbitMQClient;
import io.vertx.rabbitmq.RabbitMQOptions;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan
public class Application {

    public static void main(String[] args) {
        final String packages = "de.htwberlin.lla.master.towardseda.sample04.queryservice";
        final AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(packages);
        final Vertx vertx = context.getBean(Vertx.class);
        final VerticleFactory factory = context.getBean(VerticleFactory.class);
        vertx.deployVerticle(factory.prefix() + ":" + QueryVerticle.class.getName());
    }

    @Bean
    public Vertx vertx(final VerticleFactory verticleFactory) {
        Vertx vertx = Vertx.vertx();
        vertx.registerVerticleFactory(verticleFactory);
        return vertx;
    }

    @Bean
    public RabbitMQClient rabbitClient(final Vertx vertx) {
        final String user = System.getenv("RABBIT_USER");
        final String password = System.getenv("RABBIT_PASSWORD");
        final String host = System.getenv("RABBIT_HOST");
        final String port = System.getenv("RABBIT_PORT");
        final String connectionUri = "amqp://" + user + ":" + password + "@" + host + ":" + port;

        final RabbitMQOptions config = new RabbitMQOptions();
        config.setReconnectInterval(2000);
        config.setReconnectAttempts(Integer.MAX_VALUE);
        config.setUri(connectionUri);
        final RabbitMQClient client = RabbitMQClient.create(vertx, config);
        System.out.println("Application: Created Rabbit client.");
        return client;
    }
}