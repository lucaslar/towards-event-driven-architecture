# Sample 04: Event-Driven Architecture (Microservices)

This sample contains the following architecture (dockerized):

- Message Broker (RabbitMQ)
- Services (Vert.x)
    - Query Service
    - Laureate Service per category (6)
    - Prize Service
- Multiple Databases (Postgres)
    - Laureate data per category (6)
    - Prize data
- API documentation (AsyncAPI (over Nginx))

The communication is **asynchronous**.

---

Please check the [parent README](../../../README.md) of this repository for more information.
