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
        pythonEnv = pkgs.python3.withPackages (ps: with ps; [
          pip
          virtualenv
        ]);
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = [
            pkgs.ollama
            pythonEnv
          ];
          shellHook = ''
            source .venv/bin/activate
            pip install -r requirements.txt
          '';
        };
      });
}
