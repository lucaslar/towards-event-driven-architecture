FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY index.html /usr/share/nginx/html/index.html
COPY query-ws/template /usr/share/nginx/html/query-ws
COPY query-amqp/template /usr/share/nginx/html/query-amqp
COPY laureate-amqp/template /usr/share/nginx/html/laureate-amqp
COPY prize-amqp/template /usr/share/nginx/html/prize-amqp
