{
  description = "a powerful online email application";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs =
    {
      flake-utils,
      nixpkgs,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
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
            pkgs.bash
            pkgs.heroku
            pkgs.nodejs_22
            pkgs.opentofu
            slackcli
          ];
          shellHook = ''
            export SLACK_CONFIG_DIR="$HOME/.config/slack"
            export SLACK_ENVIRONMENT_TAG="development"
            mkdir -p $SLACK_CONFIG_DIR
          '';
        };
      }
    );
}
