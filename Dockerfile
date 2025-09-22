# Use a more stable, non-alpine builder image
FROM golang:1.22 as builder

# Install xk6 and the InfluxDB v2 extension
RUN go install go.k6.io/xk6/cmd/xk6@latest
RUN xk6 build --with github.com/grafana/xk6-output-influxdb

# Use a lean base image for the final k6 image
FROM alpine:3.19

# Copy the custom k6 binary from the builder stage
COPY --from=builder /go/k6 /usr/bin/k6

# Set the entrypoint to run the k6 binary
ENTRYPOINT ["k6"]