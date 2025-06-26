{
  description = "nix-direnv shell for developing Source Academy's VS Code extension";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            # For dev ease of use, follow NodeJS version in source-academy/frontend
            nodejs_20
            (yarn-berry.override {nodejs = nodejs_20;})
          ];
        };
      }
    );
}
