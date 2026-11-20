# Multi-stage build for the Rust zorbio server.
#
#   podman build -t zorbio-rust .
#   podman run -p 8080:8080 -p 31000:31000 zorbio-rust
#
# The client/ directory from the repo root is copied in as the static root.
# Override the ports / env at runtime (HTTP_PORT, WS_LISTEN_PORT, ZOR_ENV, ...).

FROM rust:1-bookworm AS builder

WORKDIR /build

# cache dependencies
COPY Cargo.toml Cargo.lock* ./
RUN mkdir -p src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src

# build the real binary
COPY src ./src
COPY data ./data
RUN touch src/main.rs && cargo build --release

# --- runtime ---------------------------------------------------------
FROM debian:bookworm-slim

RUN useradd -u 1001 appuser

COPY --from=builder /build/target/release/zorbio-server /usr/local/bin/zorbio-server

# static client content (copy the repo's client/ or dist/ before building,
# or mount it at /srv/client at runtime)
COPY client /srv/client

USER 1001
ENV ZOR_ENV=""
EXPOSE 8080 31000

CMD ["/usr/local/bin/zorbio-server", "/srv/client"]
