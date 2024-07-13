{
  description = "a strange and slithery Slack app";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    zimeg.url = "github:zimeg/nur-packages";
  };
  outputs = { nixpkgs, flake-utils, zimeg, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        pythonEnv = pkgs.python311.withPackages (ps: with ps; [
          mypy # https://github.com/python/mypy
          requests # https://github.com/psf/requests
          slack-bolt # http://github.com/slackapi/bolt-python
          slack-sdk # https://github.com/slackapi/python-slack-sdk
          types-requests # https://github.com/python/typeshed/tree/main/stubs/requests/requests
          # https://github.com/slackapi/python-slack-hooks
          (buildPythonPackage {
            pname = "slack_cli_hooks";
            version = "0.0.2";
            src = pkgs.fetchFromGitHub {
              owner = "slackapi";
              repo = "python-slack-hooks";
              rev = "0.0.2";
              sha256 = "sha256-jImmdHuEEqUmGctxZqP8Zh71/RwZi1Z7c2ZAPUdpeDM=";
            };
            format = "pyproject";
            buildInputs = [ setuptools slack-bolt ];
          })
        ]);
        # https://api.slack.com/automation/cli
        slackcli = pkgs.stdenv.mkDerivation {
          name = "slackcli";
          src =
            if pkgs.stdenv.isDarwin then
              pkgs.fetchurl
                {
                  url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.27.1_macOS_64-bit.tar.gz";
                  sha256 = "0ixxlprfhsf1zfj4kd06hav2fxva83s8by0vjhaf1njnh07higbz";
                }
            else
              pkgs.fetchurl {
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.27.1_linux_64-bit.tar.gz";
                sha256 = "0chhwdpkbahivb56jf26spbb8xsi2bjqs6bzxi0ahgkllhbk9v9q";
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
            pkgs.curl # https://github.com/curl/curl
            pkgs.gnumake # https://github.com/mirror/make
            pkgs.ruff # http://github.com/astral-sh/ruff
            pkgs.ollama # http://github.com/ollama/ollama
            pkgs.yajsv # https://github.com/neilpa/yajsv
            pythonEnv
            slackcli
            zimeg.packages.${system}.jurigged # https://github.com/breuleux/jurigged
          ];
          shellHook = ''
            export SLACK_CONFIG_DIR="$HOME/.config/slack"
            mkdir -p $SLACK_CONFIG_DIR
          '';
        };
      });
}
