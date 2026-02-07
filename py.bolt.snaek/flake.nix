{
  description = "a strange and slithery Slack app";
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
      pythonEnv =
        pkgs:
        pkgs.python313.withPackages (
          ps: with ps; [
            mypy # https://github.com/python/mypy
            packaging # https://github.com/pypa/packaging
            requests # https://github.com/psf/requests
            slack-bolt # http://github.com/slackapi/bolt-python
            slack-sdk # https://github.com/slackapi/python-slack-sdk
            types-requests # https://github.com/python/typeshed/tree/main/stubs/requests/requests
            # https://github.com/slackapi/python-slack-hooks
            (buildPythonPackage rec {
              pname = "slack_cli_hooks";
              version = "0.3.0";
              src = pkgs.fetchFromGitHub {
                owner = "slackapi";
                repo = "python-slack-hooks";
                rev = "v${version}";
                hash = "sha256-o0cKuUZ7G5XpoqOes2o38A45Rx2z7sYDB4AsAuS3Z18=";
              };
              format = "pyproject";
              buildInputs = [
                setuptools
                slack-bolt
              ];
            })
          ]
        );
    in
    {
      apps = each (
        pkgs:
        {
          default = {
            type = "app";
            program = "${pkgs.writeShellScript "snaek" ''
              cd ${./.}
              ${pkgs.ollama}/bin/ollama create snaek --file models/Modelfile
              ${(pythonEnv pkgs)}/bin/python3 app.py
            ''}";
          };
        }
      );
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
                  hash = "sha256-reQ2cB/BeFqXxbF3JYBzI3nwO+Jk1KgjuMjCm3qgNX0=";
                }
              else
                pkgs.fetchurl {
                  url = "https://downloads.slack-edge.com/slack-cli/slack_cli_3.12.0_linux_64-bit.tar.gz";
                  hash = "sha256-A0QELxVKAZgPgjopWCleQFVzv2mBM3L57zZLMga0yHg=";
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
              pkgs.curl # https://github.com/curl/curl
              pkgs.gnumake # https://github.com/mirror/make
              pkgs.ruff # http://github.com/astral-sh/ruff
              pkgs.yajsv # https://github.com/neilpa/yajsv
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
