# Stage 1: Build Stage
FROM alpine:latest AS monitor-build
RUN apk add --no-cache curl bash docker-cli
WORKDIR /app
COPY monitor_docker_containers.sh .
RUN chmod +x monitor_docker_containers.sh

# Stage 2: Final Stage 
FROM alpine:latest
RUN apk add --no-cache docker-cli
WORKDIR /app
COPY --from=monitor-build /app/monitor_docker_containers.sh .
# Runs script every 20 seconds
CMD ["sh", "-c", "while true; do sh /app/monitor_docker_containers.sh; sleep 20; done"]
