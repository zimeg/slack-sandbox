{
  description = "a strange and slithery Slack app";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShell = pkgs.mkShell {
          venvDir = ".venv";
          buildInputs = [
            pkgs.ollama
            pkgs.python312Packages.python
            pkgs.python312Packages.venvShellHook
          ];
          postVenvCreation = ''
            pip install -r requirements.txt
          '';
          shellHook = ''
            source .venv/bin/activate
          '';
        };
      });
}
