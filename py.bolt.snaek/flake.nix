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
        slackcli = pkgs.stdenv.mkDerivation {
          name = "slackcli";
          src = if pkgs.stdenv.isDarwin then
            pkgs.fetchurl {
              url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.18.0_macOS_64-bit.tar.gz";
              sha256 = "185vg56k6x614sl7ar8c7gr176mp5ylyh0hp0qav9x8kfsc8ifhj";
            }
          else
            pkgs.fetchurl {
              url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.18.0_linux_64-bit.tar.gz";
              sha256 = "1gnmncflxgqxim14g454f63lh9iqz6djv07vy8ms020wjgh3x713";
            };
          unpackPhase = "tar -xzf $src";
          installPhase = ''
            mkdir -p $out/bin
            cp -r bin/slack $out/bin/slack
          '';
        };
      in
      {
        devShell = pkgs.mkShell {
          venvDir = ".venv";
          buildInputs = [
            pkgs.gnumake
            pkgs.ollama
            pkgs.python312Packages.python
            pkgs.python312Packages.venvShellHook
            slackcli
          ];
          postVenvCreation = ''
            pip install -r requirements.txt
          '';
          shellHook = ''
            source .venv/bin/activate
            export SLACK_CONFIG_DIR="$HOME/.config/slack"
            mkdir -p $SLACK_CONFIG_DIR
          '';
        };
      });
}
