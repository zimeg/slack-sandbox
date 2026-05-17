{
  description = "a public publisher of emails on energies";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };
  outputs =
    {
      nixpkgs,
      ...
    }:
    let
      each =
        function:
        nixpkgs.lib.genAttrs [
          "x86_64-darwin"
          "x86_64-linux"
          "aarch64-darwin"
          "aarch64-linux"
        ] (system: function nixpkgs.legacyPackages.${system});
      pythonEnv =
        pkgs:
        let
          ps = pkgs.python313.pkgs;
          # https://github.com/slackapi/python-slack-sdk
          slack_sdk = ps.buildPythonPackage rec {
            pname = "slack_sdk";
            version = "3.41.0";
            src = pkgs.fetchFromGitHub {
              owner = "slackapi";
              repo = "python-slack-sdk";
              rev = "v${version}";
              hash = "sha256-TH4wWQ1rCmlWgDtqX04FJKL95YgOKc543yJN/FLtKeA=";
            };
            format = "pyproject";
            buildInputs = [ ps.setuptools ];
          };
          # https://github.com/slackapi/bolt-python
          slack_bolt = ps.buildPythonPackage rec {
            pname = "slack_bolt";
            version = "1.28.0";
            src = pkgs.fetchFromGitHub {
              owner = "slackapi";
              repo = "bolt-python";
              rev = "v${version}";
              hash = "sha256-1AJO7+7YG/NFh6Rmqwkm6yua2LWdYQ9Rv1oadfHAlhE=";
            };
            format = "pyproject";
            buildInputs = [ ps.setuptools ];
            dependencies = [ slack_sdk ];
            doCheck = false;
          };
          # https://github.com/slackapi/python-slack-hooks
          slack_cli_hooks = ps.buildPythonPackage rec {
            pname = "slack_cli_hooks";
            version = "0.3.0";
            src = pkgs.fetchFromGitHub {
              owner = "slackapi";
              repo = "python-slack-hooks";
              rev = "v${version}";
              hash = "sha256-o0cKuUZ7G5XpoqOes2o38A45Rx2z7sYDB4AsAuS3Z18=";
            };
            format = "pyproject";
            buildInputs = [ ps.setuptools ];
            dependencies = [ slack_bolt ];
          };
        in
        pkgs.python313.withPackages (_: [
          ps.mypy # https://github.com/python/mypy
          ps.requests # https://github.com/psf/requests
          ps.types-requests # https://github.com/python/typeshed
          slack_sdk
          slack_bolt
          slack_cli_hooks
        ]);
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
                  url = "https://downloads.slack-edge.com/slack-cli/slack_cli_4.1.0_macOS_64-bit.tar.gz";
                  hash = "sha256-5SpS2X/X2V9kweMGdRL+JB/ph/mWgkXi8TBKhnlqptM=";
                }
              else
                pkgs.fetchurl {
                  url = "https://downloads.slack-edge.com/slack-cli/slack_cli_4.1.0_linux_64-bit.tar.gz";
                  hash = "sha256-AlWYTn2vKr39KK5zbADu75s0WMgcut7eSUjy8keP3vU=";
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
            buildInputs = [
              pkgs.go-task # https://github.com/go-task/task
              pkgs.ruff # http://github.com/astral-sh/ruff
              (pythonEnv pkgs)
              slackcli
            ];
            shellHook = ''
              export SLACK_CONFIG_DIR="$HOME/.config/slack"
              mkdir -p $SLACK_CONFIG_DIR
            '';
          };
        }
      );
    };
}
