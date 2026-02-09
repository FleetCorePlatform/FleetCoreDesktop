# Development
dev:
    cargo tauri dev

# Build for production
build:
    cargo tauri build

# Build for specific platform
build-mac:
    cargo tauri build --target aarch64-apple-darwin

build-windows:
    cargo tauri build --target x86_64-pc-windows-msvc

build-linux:
    cargo tauri build --target x86_64-unknown-linux-gnu

# Frontend only
dev-frontend:
    npm run dev

build-frontend:
    npm run build

# Rust backend only
dev-rust:
    cd src-tauri && cargo run

check-rust:
    cd src-tauri && cargo check

# Clean build artifacts
clean:
    cd src-tauri && cargo clean
    rm -rf dist/
    rm -rf src-tauri/target/

# Install dependencies
install:
    npm install
    cd src-tauri && cargo fetch

# Lint and format
lint:
    npm run lint
    cd src-tauri && cargo clippy

format:
    npm run format
    cd src-tauri && cargo fmt

# Generate icons
icons:
    cargo tauri icon src-tauri/icons/icon.png

# Update dependencies
update:
    npm update
    cd src-tauri && cargo update

# Run tests
test:
    npm test
    cd src-tauri && cargo test

# Create installer
bundle:
    cargo tauri build --bundles deb rpm

mock openapi_yaml="api.yaml" port="8080" *args="":
    npx @stoplight/prism-cli mock -d {{ openapi_yaml }} -p {{ port }} {{ args }}