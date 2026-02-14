{
  description = "Tauri App Development Environment";

  inputs = {
    # Linux: Use Unstable for latest WebKitGTK/GStreamer and Android API 36
    nixpkgs-linux.url = "github:nixos/nixpkgs/nixos-unstable";

    # macOS: Use 24.11 (Stable) to avoid deprecated Frameworks
    nixpkgs-darwin.url = "github:nixos/nixpkgs/nixos-24.11";

    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs-linux, nixpkgs-darwin, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        # 1. Detect OS
        isLinux = builtins.match ".*linux.*" system != null;

        # 2. Main Package Set (Unstable for Linux, Stable for Mac)
        pkgs = import (if isLinux then nixpkgs-linux else nixpkgs-darwin) {
          inherit system;
          config = {
            allowUnfree = true;
            android_sdk.accept_license = true;
          };
        };

        inherit (pkgs) lib;

        # 3. Android Configuration (Explicitly uses nixpkgs-linux)
        # We create a separate instance of nixpkgs-linux just for AndroidEnv
        # to guarantee we are getting the latest definitions (API 36) even if
        # logic elsewhere changes.
        pkgsAndroid = import nixpkgs-linux {
          inherit system;
          config = {
            allowUnfree = true;
            android_sdk.accept_license = true;
          };
        };

        ndkVersion = "26.3.11579264";

        androidComposition = if isLinux then pkgsAndroid.androidenv.composeAndroidPackages {
          cmdLineToolsVersion = "11.0";
          toolsVersion = "26.1.1";
          platformToolsVersion = "35.0.1";
          buildToolsVersions = [ "35.0.0" ];
          includeEmulator = false;

          # Explicitly requesting 36 as confirmed available in Unstable
          platformVersions = [ "36" ];

          includeSources = false;
          includeSystemImages = false;
          includeNDK = true;
          ndkVersions = [ ndkVersion ];
          cmakeVersions = [ "3.22.1" ];
          useGoogleAPIs = false;
          useGoogleTVAddOns = false;
        } else null;

        androidSdk = if androidComposition != null then androidComposition.androidsdk else null;

        # --- Linux Libraries ---
        linuxLibraries = with pkgs; [
          webkitgtk_4_1
          gtk3
          cairo
          gdk-pixbuf
          glib
          dbus
          openssl
          librsvg
          libayatana-appindicator
          libsoup_3
          libcanberra-gtk3
          mesa
          glib-networking
          libpulseaudio
          alsa-lib
          libnice
        ];

        linuxGstreamer = with pkgs.gst_all_1; [
          gstreamer
          gst-plugins-base
          gst-plugins-good
          gst-plugins-bad
          gst-plugins-ugly
          gst-libav
        ];

        # --- macOS Frameworks ---
        darwinFrameworks = with pkgs.darwin.apple_sdk.frameworks; [
          Security
          CoreServices
          CoreFoundation
          Foundation
          AppKit
          WebKit
        ] ++ [ pkgs.libiconv ];

        # --- Common Tools ---
        commonPackages = with pkgs; [
          rustup
          cargo
          cargo-tauri
          nodejs_22
          curl
          wget
          file
          gnumake
          binutils
          just
          pkg-config
        ];

      in
      {
        devShells.default = pkgs.mkShell {
          # Build Inputs
          buildInputs = commonPackages
            ++ lib.optionals isLinux (linuxLibraries ++ linuxGstreamer)
            ++ lib.optionals (!isLinux) darwinFrameworks;

          # Native Build Inputs
          nativeBuildInputs = with pkgs; [ pkg-config ]
            ++ lib.optionals isLinux [ wrapGAppsHook4 xdotool ];

          # Packages for PATH
          packages = lib.optionals isLinux [
            androidSdk
            pkgs.gradle
            pkgs.jdk17
          ];

          shellHook = ''
            # --- Android Setup (Linux Only) ---
            ${lib.optionalString isLinux ''
              export ANDROID_HOME=${androidSdk}/libexec/android-sdk
              export NDK_HOME=${androidSdk}/libexec/android-sdk/ndk/${ndkVersion}

              # Force Gradle to use the build-tools version we actually have installed
              export GRADLE_OPTS="-Dorg.gradle.project.android.aapt2FromMavenOverride=${androidSdk}/libexec/android-sdk/build-tools/35.0.0/aapt2"

              # NDK Toolchain Setup
              export NDK_TOOLCHAIN="$NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin"
              export CC_aarch64_linux_android="$NDK_TOOLCHAIN/aarch64-linux-android24-clang"
              export CXX_aarch64_linux_android="$NDK_TOOLCHAIN/aarch64-linux-android24-clang++"
              export AR_aarch64_linux_android="$NDK_TOOLCHAIN/llvm-ar"
              export CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER="$NDK_TOOLCHAIN/aarch64-linux-android24-clang"

              # Rust Target Initialization
              for target in aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android; do
                if ! rustup target list --installed | grep -q "^$target$"; then
                  echo "Initializing Android target: $target"
                  rustup target add "$target"
                fi
              done
            ''}

            # --- Linux Hooks (GStreamer / WebKit / Nvidia) ---
            ${lib.optionalString isLinux ''
              export LD_LIBRARY_PATH=/run/opengl-driver/lib:${lib.makeLibraryPath (linuxLibraries ++ linuxGstreamer)}:${pkgs.gst_all_1.gst-plugins-base}/lib:${pkgs.gst_all_1.gst-plugins-bad}/lib:${pkgs.mesa}/lib:${pkgs.libglvnd}/lib:$LD_LIBRARY_PATH

              export GIO_MODULE_DIR="${pkgs.glib-networking}/lib/gio/modules/"
              export GST_PLUGIN_SYSTEM_PATH_1_0=${pkgs.gst_all_1.gstreamer}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-plugins-base}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-plugins-good}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-plugins-bad}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-plugins-ugly}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-libav}/lib/gstreamer-1.0:${pkgs.libnice.out}/lib/gstreamer-1.0

              # GPU / WebRTC Workarounds
              if ! command -v nvidia-smi >/dev/null 2>&1; then
                  export WEBKIT_DISABLE_COMPOSITING_MODE=1
                  export WEBKIT_DISABLE_DMABUF_RENDERER=1
                  export LIBGL_ALWAYS_SOFTWARE=1
                  echo "Nvidia not detected."
              else
                  export WEBKIT_DISABLE_COMPOSITING_MODE=1
                  export WEBKIT_DISABLE_DMABUF_RENDERER=1
                  export LIBGL_ALWAYS_SOFTWARE=1
                  export WEBKIT_GST_DMABUF_SINK_ENABLED=0
                  echo "Nvidia detected: Disabling DMABuf sink."
              fi

              export GDK_BACKEND=x11
              export XDG_DATA_DIRS="${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$GSETTINGS_SCHEMAS_PATH:$XDG_DATA_DIRS"
            ''}
          '';
        };
      }
    );
}
