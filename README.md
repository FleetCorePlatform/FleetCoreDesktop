# FleetCore Desktop

FleetCore Desktop is the mission control interface for the FleetCore Project, designed to manage Unmanned Aerial System (UAS) operations. Built on a hybrid architecture using Tauri (Rust) and React, it provides a secure environment for mission planning, fleet coordination, and geospatial infrastructure management.

![Project Status](https://img.shields.io/badge/status-active-success)
![Tauri](https://img.shields.io/badge/Tauri-v2-FEC00F?logo=tauri)
![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react)
![Rust](https://img.shields.io/badge/Rust-backend-000000?logo=rust)

## Overview

This application serves as the primary ground control station (GCS) client for the FleetCore fleet. It interfaces with the backend orchestration layer to facilitate:

*   **Mission Planning:** Configuration of automated survey parameters, including altitude constraints and target designations.
*   **Infrastructure Management:** Definition of outposts and operational zones using vector-based geofencing tools.
*   **Fleet Telemetry:** Real-time monitoring of drone connection status, battery levels, and group assignments.
*   **Secure Communication:** Implementation of a Rust-based proxy layer to handle authenticated API requests and isolate sensitive credentials.

## Architecture

The system utilizes a split-stack architecture to ensure performance and security:

*   **Runtime:** Tauri v2 (utilizing system webview)
*   **Core Logic:** Rust (Backend interactions, file system access, API proxying)
*   **User Interface:** React 19, TypeScript, Tailwind CSS
*   **Geospatial Engine:** Leaflet

## Development Environment

Project dependencies are managed via Nix to ensure reproducibility across development environments.

### Prerequisites

*   **Nix Package Manager** (with Flakes enabled)
*   **Git**

### Setup

1.  **Initialize Environment**
    Enter the Nix shell to load the required toolchain (Node.js, Rust, Cargo, Tauri CLI, and system libraries):
    ```bash
    nix develop
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Local Development**
    Start the Vite development server and the Tauri application window:
    ```bash
    npm run tauri dev
    ```

## Build

To compile the application for production distribution:

```bash
npm run tauri build
```

Artifacts are generated in the `src-tauri/target/release/bundle/` directory.
