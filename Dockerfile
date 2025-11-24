# ==========================================
# Stage 1: Builder - Build k6 with Extensions
# Goal: Compile the custom k6 binary.
# ==========================================
# Use a Go 1.24 image as the builder
FROM golang:1.24 AS builder

# Install xk6 tool
RUN go install go.k6.io/xk6/cmd/xk6@latest

# Build k6 with the InfluxDB v2 extension
# We use /tmp/k6 as the output location for easy copying.
RUN xk6 build --with github.com/grafana/xk6-output-influxdb --output /tmp/k6

# ==========================================
# Stage 2: Runtime - Final Image (Secured)
# Goal: Create a small, secure image with the custom k6 binary.
# ==========================================
# Use a lean base image for the final k6 image
FROM alpine:3.19

# 1. Create a non-privileged user and group (alpine uses 'adduser' and 'addgroup')
# The -S flag creates a system account (no home dir/password), and -D skips password prompts.
RUN addgroup -S k6group && adduser -S -G k6group k6user

# 2. Set the working directory to a non-root-owned path
WORKDIR /home/k6user

# 3. Copy the custom k6 binary from the builder stage
# We copy it to a standard system path like /usr/local/bin
COPY --from=builder /tmp/k6 /usr/local/bin/k6

# 4. Switch to the non-root user for execution
# All subsequent commands and the ENTRYPOINT run as k6user.
USER k6user

# Set the entrypoint to run the k6 binary
ENTRYPOINT ["k6"]
