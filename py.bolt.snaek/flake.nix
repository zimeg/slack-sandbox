{
  description = "a strange and slithery Slack app";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    zimeg.url = "github:zimeg/nur-packages";
  };
  outputs =
    {
      nixpkgs,
      flake-utils,
      zimeg,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        pythonEnv = pkgs.python312.withPackages (
          ps: with ps; [
            mypy # https://github.com/python/mypy
            packaging # https://github.com/pypa/packaging
            requests # https://github.com/psf/requests
            slack-bolt # http://github.com/slackapi/bolt-python
            slack-sdk # https://github.com/slackapi/python-slack-sdk
            types-requests # https://github.com/python/typeshed/tree/main/stubs/requests/requests
            # https://github.com/slackapi/python-slack-hooks
            (buildPythonPackage {
              pname = "slack_cli_hooks";
              version = "0.0.3";
              src = pkgs.fetchFromGitHub {
                owner = "slackapi";
                repo = "python-slack-hooks";
                rev = "0.0.3";
                hash = "sha256-3x4HcPPxXKW2yMVYgtg6BloJShMp75eXI+QINek+riQ=";
              };
              format = "pyproject";
              buildInputs = [
                setuptools
                slack-bolt
              ];
            })
          ]
        );
        # https://api.slack.com/automation/cli
        slackcli = pkgs.stdenv.mkDerivation {
          name = "slackcli";
          src =
            if pkgs.stdenv.isDarwin then
              pkgs.fetchurl {
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_3.0.0_macOS_64-bit.tar.gz";
                sha256 = "0xbld1a01354zvh5j8l8cgh4b8lgwrk5ngq04i1vdrfjp981a697";
              }
            else
              pkgs.fetchurl {
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_3.0.0_linux_64-bit.tar.gz";
                sha256 = "1lrapyy3lw9gg919nfim6vnnwswmc7kyfr8ywmy3lq5py8gdmgb3";
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
      }
    );
}
