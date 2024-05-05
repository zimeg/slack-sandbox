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
          mypy
          requests
          slack-bolt
          slack-sdk
          types-requests
          (buildPythonPackage rec {
            pname = "slack_cli_hooks";
            version = "0.0.1";
            src = pkgs.fetchFromGitHub {
              owner = "slackapi";
              repo = "python-slack-hooks";
              rev = "0.0.1";
              sha256 = "sha256-jImmdHuEEqUmGctxZqP8Zh71/RwZi1Z7c2ZAPUdpeDM=";
            };
            format = "pyproject";
            buildInputs = [ setuptools slack-bolt ];
          })
        ]);
        slackcli = pkgs.stdenv.mkDerivation {
          name = "slackcli";
          src = if pkgs.stdenv.isDarwin then
            pkgs.fetchurl {
              url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.23.0_macOS_64-bit.tar.gz";
              sha256 = "04p01cf1qhra3y50v3ld08amli3xvxz4c5kjnr1jngjf9nb2zmki";
            }
          else
            pkgs.fetchurl {
              url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.23.0_linux_64-bit.tar.gz";
              sha256 = "0andhpk39dgpg7341jr4s2qpg4l75hixh8ipcn9dm5zf8g9vj33y";
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
          buildInputs = [
            pkgs.gnumake
            pkgs.ollama
            pythonEnv
            slackcli
          ];
          shellHook = ''
            export SLACK_CONFIG_DIR="$HOME/.config/slack"
            mkdir -p $SLACK_CONFIG_DIR
          '';
        };
      });
}
