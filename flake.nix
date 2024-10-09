{
  description = "Template for a direnv shell, with NodeJS";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/23.11";
  };

  outputs = { self, nixpkgs }:
  let
    system = "x86_64-linux";
    pkgs = import nixpkgs { inherit system; config.allowUnfree = true; };
  in
  {
    devShells.${system}.default = pkgs.mkShell {
      packages = with pkgs; [
        nodejs_20
        yarn

        # The following is only needed by js-slang, to remove in the future
        # Additional libs needed by yarn when installing
        pkg-config
        xorg.libX11
        xorg.libXi
        libGL

        python310
        xorg.libXext

        gcc11
      ];
    };
  };
}
