package de.htwberlin.lla.master.towardseda.sample04.prizeservice.config.amqp;

import io.vertx.core.Vertx;
import io.vertx.core.spi.VerticleFactory;
import io.vertx.pgclient.PgConnectOptions;
import io.vertx.pgclient.PgPool;
import io.vertx.rabbitmq.RabbitMQClient;
import io.vertx.rabbitmq.RabbitMQOptions;
import io.vertx.sqlclient.PoolOptions;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan
public class Application {

    public static void main(String[] args) {
        final String packages = "de.htwberlin.lla.master.towardseda.sample04.prizeservice";
        final AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(packages);
        final Vertx vertx = context.getBean(Vertx.class);
        final VerticleFactory factory = context.getBean(VerticleFactory.class);
        vertx.deployVerticle(factory.prefix() + ":" + PrizeVerticle.class.getName());
    }

    @Bean
    public Vertx vertx(final VerticleFactory verticleFactory) {
        Vertx vertx = Vertx.vertx();
        vertx.registerVerticleFactory(verticleFactory);
        return vertx;
    }

    @Bean
    public PgPool pgPool(final Vertx vertx) {
        final PoolOptions poolOptions = new PoolOptions().setMaxSize(5);
        final PgConnectOptions connectOptions = new PgConnectOptions()
                .setPort(Integer.parseInt(System.getenv("PG_PORT")))
                .setHost(System.getenv("PG_HOST"))
                .setDatabase(System.getenv("PG_DB"))
                .setUser(System.getenv("PG_USER"))
                .setPassword(System.getenv("PG_PASSWORD"))
                .setReconnectAttempts(2)
                .setReconnectInterval(1000);

        final PgPool pool = PgPool.pool(vertx, connectOptions, poolOptions);
        System.out.println("Application: Database connection established.");
        return pool;
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
