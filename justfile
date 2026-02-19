# Start development server
[group('Development')]
[arg("target", help='Platform: mac, windows, linux, android, ios, ""')]
dev target="":
    cargo tauri {{ if target == "" { "dev" } else { target + " dev" } }}

# Frontend only
[group('Development')]
dev-frontend:
    npm run dev

# Rust backend only
[group('Development')]
dev-rust:
    cd src-tauri && cargo run

# Mock API server
[group('Development')]
mock openapi_yaml="api.yaml" port="8080" *args="":
    npx @stoplight/prism-cli mock -d {{ openapi_yaml }} -p {{ port }} {{ args }}

# Build for production
[group('Build')]
[arg("target", help="Platform: mac, windows, linux, android, ios, default")]
build target="default":
    cargo tauri {{ if target == "mac" { "build --target aarch64-apple-darwin" } else if target == "windows" { "build --target x86_64-pc-windows-msvc" } else if target == "linux" { "build --target x86_64-unknown-linux-gnu" } else if target == "android" { "android build --apk true" } else if target == "ios" { "ios build" } else if target == "default" { "build" } else { error("Unsuported platform") } }}

# Build frontend only
[group('Build')]
build-frontend:
    npm run build

# Create installer
[group('Build')]
bundle:
    cargo tauri build --bundles deb rpm

# Generate icons
[group('Build')]
icons:
    cargo tauri icon src-tauri/icons/icon.png

# Check react frontend for typescript errors
[group('QA')]
check-frontend:
    tsc

# Check rust backend for errors
[group('QA')]
check-rust:
    cd src-tauri && cargo check

# Run component checks
[group('QA')]
check component="all":
    @if [ "{{component}}" = "all" ]; then \
        just check-frontend; just check-rust; \
    elif [ "{{component}}" = "frontend" ]; then \
        just check-frontend; \
    elif [ "{{component}}" = "rust" ]; then \
        just check-rust; \
    else \
        echo "Invalid component: {{component}}"; exit 1; \
    fi

# Lint the frontend and backend
[group('QA')]
lint:
    npx run eslint
    cd src-tauri && cargo clippy

# Format code
[group('QA')]
format:
    npx prettier . --write
    cd src-tauri && cargo fmt

# Run tests
[group('QA')]
test:
    npm test
    cd src-tauri && cargo test

# Install dependencies
[group('Maintenance')]
install:
    npm install
    cd src-tauri && cargo fetch

# Update dependencies
[group('Maintenance')]
update:
    npm update
    cd src-tauri && cargo update

# Clean build artifacts
[group('Maintenance')]
[confirm("Are you sure you want to clean everything?")]
clean:
    cd src-tauri && cargo clean
    rm -rf dist/
    rm -rf src-tauri/target/