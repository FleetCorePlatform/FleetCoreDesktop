{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs, ...}:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};

      libraries = with pkgs; [
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
      ];
    in {
      devShells.${system}.default = pkgs.mkShell {
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
        ] ++ libraries;

        shellHook = ''
          export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath libraries}:$LD_LIBRARY_PATH
          export WEBKIT_DISABLE_COMPOSITING_MODE=1
          export WEBKIT_DISABLE_DMABUF_RENDERER=1
          export GDK_BACKEND=x11
          export GTK_PATH=${pkgs.libcanberra-gtk3}/lib/gtk-3.0:$GTK_PATH
          export GIO_MODULE_DIR="${pkgs.glib-networking}/lib/gio/modules/"
          export XDG_DATA_DIRS=${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS
          export LIBGL_ALWAYS_SOFTWARE=1
        '';
      };
    };
}
