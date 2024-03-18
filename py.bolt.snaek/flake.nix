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
            version = "0.0.0.dev2";
            src = pkgs.fetchFromGitHub {
              owner = "slackapi";
              repo = "python-slack-hooks";
              rev = "v0.0.0.dev2";
              sha256 = "sha256-wpsJXgEOD0nIfxRhly36Ea2IaIFQ15cDCfR1/gjkV1U=";
            };
            format = "pyproject";
            buildInputs = [ setuptools slack-bolt ];
          })
        ]);
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
