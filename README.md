# FleetCore Desktop

> **ℹ️ Note:** This README serves as a quick entry point. For the complete documentation, including user manuals and technical specifications, please visit our **[Official Documentation Site](https://FleetCorePlatform.github.io/FleetCoreDesktop/)**.

## 🚁 Mission Control for Unmanned Aerial Systems

FleetCore Desktop is the secure ground control station (GCS) interface for the FleetCore ecosystem. It orchestrates mission planning, fleet coordination, and geospatial infrastructure management through a high-performance hybrid architecture combining **Tauri**, **Rust**, and **React**.

## 📚 Documentation Structure

We maintain extensive documentation to support both operational users and platform developers:

- **📖 User Guide**: Comprehensive manuals for mission planning, telemetry monitoring, and infrastructure management.
- **🛠️ Technical Reference**: Deep dives into the split-stack architecture, security protocols, and IPC patterns.
- **💻 Developer Handbook**: Instructions for setting up the Nix-based environment, contribution workflows, and build processes.

## ⚡️ Quick Start

This project utilizes **Nix** to guarantee a reproducible development environment across all platforms.

### Prerequisites

- [Nix Package Manager](https://nixos.org/download.html) (with Flakes enabled)
- Git

### Launch Development Environment

```bash
# 1. Clone the repository
git clone https://github.com/FleetCorePlatform/FleetCoreDesktop.git
cd FleetCoreDesktop

# 2. Enter the reproducible shell (installs Rust, Node, Tauri, system libs)
nix develop

# 3. Install frontend dependencies
npm install

# 4. Start the application
npm run tauri dev
```

## 🏗️ Build

To create a production release:

```bash
npm run tauri build
```

---

_Maintained by the FleetCore Team._
