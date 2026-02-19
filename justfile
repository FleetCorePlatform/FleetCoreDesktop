# Development
[arg("target", help='Platform: mac, windows, linux, android, ios, ""')]
dev target="":
    cargo tauri {{ if target == "" { "dev" } else { target + " dev" } }}

# Build for production
[arg("target", help="Platform: mac, windows, linux, android, ios, current")]
build target="default":
    cargo tauri {{ if target == "mac" { "build --target aarch64-apple-darwin" } else if target == "windows" { "build --target x86_64-pc-windows-msvc" } else if target == "linux" { "build --target x86_64-unknown-linux-gnu" } else if target == "android" { "android build --apk true" } else if target == "ios" { "ios build" } else if target == "default" { "build" } else { error("Unsuported platform") } }}

# Frontend only
dev-frontend:
    npm run dev

build-frontend:
    npm run build

# Rust backend only
dev-rust:
    cd src-tauri && cargo run

# Check react frontend for linitng errors
check-frontend:
    tsc

# Check rust backend for linitng errors
check-rust:
    cd src-tauri && cargo check

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

# Clean build artifacts
[confirm("Are you sure you want to clean everything?")]
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
