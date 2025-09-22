# Use a Go 1.24 image as the builder to meet xk6's version requirement
FROM golang:1.24 as builder

# Install xk6
RUN go install go.k6.io/xk6/cmd/xk6@latest

# Build k6 with the InfluxDB v2 extension and specify the output location
RUN xk6 build --with github.com/grafana/xk6-output-influxdb --output /tmp/k6

# Use a lean base image for the final k6 image
FROM alpine:3.19

# Copy the custom k6 binary from the predictable location in the builder stage
COPY --from=builder /tmp/k6 /usr/bin/k6

# Set the entrypoint to run the k6 binary
ENTRYPOINT ["k6"]