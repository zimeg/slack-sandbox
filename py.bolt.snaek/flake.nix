{
  description = "a strange and slithery Slack app";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/26bf57a02d5d108631983a154b909a67cee65718";
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
        pythonEnv = pkgs.python313.withPackages (
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
              version = "0.1.0";
              src = pkgs.fetchFromGitHub {
                owner = "slackapi";
                repo = "python-slack-hooks";
                rev = "0.1.0";
                hash = "sha256-yaw45RJSo7AwBBYT3RHTeL5a8/kXhrRxKxorPuEQEBE=";
              };
              format = "pyproject";
              buildInputs = [
                setuptools
                slack-bolt
              ];
            })
          ]
        );
        # https://github.com/slackapi/slack-cli
        slackcli = pkgs.stdenv.mkDerivation {
          name = "slackcli";
          src =
            if pkgs.stdenv.isDarwin then
              pkgs.fetchurl {
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_3.5.1_macOS_64-bit.tar.gz";
                sha256 = "0abavvsjp1mi6s9wvbishswwr5jh7s48b71nnafvfhhhv261x56i";
              }
            else
              pkgs.fetchurl {
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_3.5.1_linux_64-bit.tar.gz";
                sha256 = "15h5zsn1h6lz5q0qsy9qhjphrf516npqhpixy9w7f1ill0gk1xn2";
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
