{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs, ...}:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs {
        inherit system;
#        overlays = [
#          (final: prev: {
#            webkitgtk_4_1 = prev.webkitgtk_4_1.overrideAttrs (old: {
#              cmakeFlags = (old.cmakeFlags or []) ++ [
#                "-DENABLE_MEDIA_STREAM=ON"
#                "-DENABLE_WEB_RTC=ON"
#              ];
#              buildInputs = (old.buildInputs or []) ++ [ final.openssl ];
#            });
#          })
#        ];
        config = {
          allowUnfree = true;
          android_sdk.accept_license = true;
        };
      };

      androidComposition = pkgs.androidenv.composeAndroidPackages {
        cmdLineToolsVersion = "11.0";
        toolsVersion = "26.1.1";
        platformToolsVersion = "35.0.1";
        buildToolsVersions = [ "35.0.0" ];
        includeEmulator = false;
        platformVersions = [ "36" ];
        includeSources = false;
        includeSystemImages = false;
        includeNDK = true;
        ndkVersions = [ "26.3.11579264" ];
        cmakeVersions = [ "3.22.1" ];
        useGoogleAPIs = false;
        useGoogleTVAddOns = false;
      };

      androidSdk = androidComposition.androidsdk;
      ndkVersion = "26.3.11579264";
    in {
      devShells.${system}.default = pkgs.mkShell {
        nativeBuildInputs = with pkgs; [
          pkg-config
          wrapGAppsHook4
          cargo
          cargo-tauri
          nodejs_24
        ];

        buildInputs = with pkgs; [
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
        ] ++ (with pkgs.gst_all_1; [
          gstreamer
          gst-plugins-base
          gst-plugins-good
          gst-plugins-bad
          gst-plugins-ugly
          gst-libav
        ]);

        packages = with pkgs; [
          rustup
          gcc
          gnumake
          binutils
          curl
          wget
          file
          xdotool
          just
          gradle
          jdk17
          androidSdk
          wrapGAppsHook4
        ];

        shellHook = ''
          export LD_LIBRARY_PATH=/run/opengl-driver/lib:${pkgs.lib.makeLibraryPath (with pkgs; [
            webkitgtk_4_1 gtk3 cairo gdk-pixbuf glib dbus openssl librsvg
            libayatana-appindicator libsoup_3 libcanberra-gtk3 mesa glib-networking
            libpulseaudio alsa-lib libnice
          ] ++ (with pkgs.gst_all_1; [
            gstreamer gst-plugins-base gst-plugins-good gst-plugins-bad gst-plugins-ugly gst-libav
          ]))}:${pkgs.gst_all_1.gst-plugins-base}/lib:${pkgs.gst_all_1.gst-plugins-bad}/lib:${pkgs.mesa}/lib:${pkgs.libglvnd}/lib:$LD_LIBRARY_PATH

          export GST_PLUGIN_SYSTEM_PATH_1_0=${pkgs.gst_all_1.gstreamer}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-plugins-base}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-plugins-good}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-plugins-bad}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-plugins-ugly}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-libav}/lib/gstreamer-1.0:${pkgs.libnice.out}/lib/gstreamer-1.0

          if ! command -v nvidia-smi >/dev/null 2>&1
          then
               export WEBKIT_DISABLE_COMPOSITING_MODE=1
               export WEBKIT_DISABLE_DMABUF_RENDERER=1
               export LIBGL_ALWAYS_SOFTWARE=1
               echo "Nvidia not detected, but keeping acceleration enabled for WebRTC"
          else
               # Force software rendering and disable DMABuf sink to bypass GBM issues on Nvidia
               export WEBKIT_DISABLE_COMPOSITING_MODE=1
               export WEBKIT_DISABLE_DMABUF_RENDERER=1
               export LIBGL_ALWAYS_SOFTWARE=1
               export WEBKIT_GST_DMABUF_SINK_ENABLED=0
               echo "Forcing software rendering and disabling DMABuf sink for WebRTC stability"
          fi

          export GDK_BACKEND=x11
          export GTK_PATH="${pkgs.libcanberra-gtk3}/lib/gtk-3.0:$GTK_PATH"
          export GIO_MODULE_DIR="${pkgs.glib-networking}/lib/gio/modules/"
          export XDG_DATA_DIRS="${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$GSETTINGS_SCHEMAS_PATH:$XDG_DATA_DIRS"

          export ANDROID_HOME=${androidSdk}/libexec/android-sdk
          export NDK_HOME=${androidSdk}/libexec/android-sdk/ndk/${ndkVersion}
          export GRADLE_OPTS="-Dorg.gradle.project.android.aapt2FromMavenOverride=${androidSdk}/libexec/android-sdk/build-tools/35.0.0/aapt2"

          export NDK_TOOLCHAIN="$NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin"

          export CC_aarch64_linux_android="$NDK_TOOLCHAIN/aarch64-linux-android24-clang"
          export CXX_aarch64_linux_android="$NDK_TOOLCHAIN/aarch64-linux-android24-clang++"
          export AR_aarch64_linux_android="$NDK_TOOLCHAIN/llvm-ar"
          export CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER="$NDK_TOOLCHAIN/aarch64-linux-android24-clang"

          for target in aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android; do
            if ! rustup target list --installed | grep -q "^$target$"; then
              echo "Initializing Android target: $target"
              rustup target add "$target"
            fi
          done
        '';
      };
    };
}