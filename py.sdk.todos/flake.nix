{
  description = "Intelligent task management using Slack Lists";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };
  outputs =
    { nixpkgs, ... }:
    let
      each =
        function:
        nixpkgs.lib.genAttrs [
          "x86_64-darwin"
          "x86_64-linux"
          "aarch64-darwin"
          "aarch64-linux"
        ] (system: function nixpkgs.legacyPackages.${system});
    in
    {
      devShells = each (
        pkgs:
        let
          # https://github.com/slackapi/slack-cli
          slackcli = pkgs.stdenv.mkDerivation {
            name = "slackcli";
            src =
              if pkgs.stdenv.isDarwin then
                pkgs.fetchurl {
                  url = "https://downloads.slack-edge.com/slack-cli/slack_cli_3.12.0_macOS_64-bit.tar.gz";
                  sha256 = "sha256-reQ2cB/BeFqXxbF3JYBzI3nwO+Jk1KgjuMjCm3qgNX0=";
                }
              else
                pkgs.fetchurl {
                  url = "https://downloads.slack-edge.com/slack-cli/slack_cli_3.12.0_linux_64-bit.tar.gz";
                  sha256 = "sha256-A0QELxVKAZgPgjopWCleQFVzv2mBM3L57zZLMga0yHg=";
                };
            unpackPhase = "tar -xzf $src";
            installPhase = ''
              mkdir -p $out/bin
              cp -r bin/slack $out/bin/slack
            '';
          };
        in
        {
          default = pkgs.mkShell {
            packages = [
              (pkgs.python3.withPackages (
                python-pkgs: with python-pkgs; [
                  mypy # https://github.com/python/mypy
                  requests # https://github.com/psf/requests
                  slack-sdk # https://github.com/slackapi/python-slack-sdk
                ]
              ))
              pkgs.ollama # https://github.com/ollama/ollama
              pkgs.ruff # https://github.com/astral-sh/ruff
              slackcli
            ];
            shellHook = ''
              export SLACK_CONFIG_DIR="$HOME/.config/slack"
              mkdir -p "$SLACK_CONFIG_DIR"
            '';
          };
        }
      );
      packages = each (
        pkgs:
        let
          todos = pkgs.python3Packages.buildPythonApplication {
            pname = "todos";
            version = "0.1.0";
            pyproject = true;
            src = ./.;
            build-system = [ pkgs.python3Packages.setuptools ];
            dependencies = with pkgs.python3Packages; [
              slack-sdk # https://github.com/slackapi/python-slack-sdk
              requests # https://github.com/psf/requests
            ];
          };
        in
        {
          server = pkgs.writeShellApplication {
            name = "server";
            runtimeInputs = [
              todos
            ];
            text = "server \"$@\"";
          };
          default = todos;
        }
      );
    };
}
