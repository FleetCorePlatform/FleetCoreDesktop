{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs, ...}:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.${system}.default = pkgs.mkShell {
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
        ] ++ (with pkgs.gst_all_1; [
          gstreamer
          gst-plugins-base
          gst-plugins-good
          gst-plugins-bad
          gst-plugins-ugly
          gst-libav
        ]);

        packages = with pkgs; [
          pkg-config
          rustup
          gcc
          gnumake
          binutils
          curl
          wget
          file
          xdotool
          nodejs_24
          just
          cargo-tauri
        ];

        shellHook = ''
          export LD_LIBRARY_PATH=/run/opengl-driver/lib:${pkgs.lib.makeLibraryPath (with pkgs; [
            webkitgtk_4_1 gtk3 cairo gdk-pixbuf glib dbus openssl librsvg
            libayatana-appindicator libsoup_3 libcanberra-gtk3 mesa glib-networking
            libpulseaudio alsa-lib
          ] ++ (with pkgs.gst_all_1; [
            gstreamer gst-plugins-base gst-plugins-good gst-plugins-bad gst-plugins-ugly gst-libav
          ]))}:$LD_LIBRARY_PATH

          export GST_PLUGIN_SYSTEM_PATH_1_0=${pkgs.gst_all_1.gstreamer}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-plugins-base}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-plugins-good}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-plugins-bad}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-plugins-ugly}/lib/gstreamer-1.0:${pkgs.gst_all_1.gst-libav}/lib/gstreamer-1.0

          if ! command -v nvidia-smi >/dev/null 2>&1
          then
              export WEBKIT_DISABLE_COMPOSITING_MODE=1
              export WEBKIT_DISABLE_DMABUF_RENDERER=1
              export LIBGL_ALWAYS_SOFTWARE=1
          fi

          export GDK_BACKEND=x11
          export GTK_PATH=${pkgs.libcanberra-gtk3}/lib/gtk-3.0:$GTK_PATH
          export GIO_MODULE_DIR="${pkgs.glib-networking}/lib/gio/modules/"
          export XDG_DATA_DIRS=${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS
        '';
      };
    };
}
