{
  description = "a powerful online email application";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-biome.url = "github:NixOS/nixpkgs/0d534853a55b5d02a4ababa1d71921ce8f0aee4c"; # 1.9.4
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs =
    {
      flake-utils,
      nixpkgs,
      nixpkgs-biome,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        biomepkgs = import nixpkgs-biome {
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
            pkgs.bash # https://git.savannah.gnu.org/cgit/bash.git
            biomepkgs.biome # https://github.com/biomejs/biome
            pkgs.heroku # https://github.com/heroku/cli
            pkgs.nodejs_22 # https://github.com/nodejs/node
            pkgs.opentofu # https://github.com/opentofu/opentofu
            slackcli # https://tools.slack.dev/slack-cli
          ];
          shellHook = ''
            export SLACK_CONFIG_DIR="$HOME/.config/slack"
            mkdir -p $SLACK_CONFIG_DIR
          '';
        };
      }
    );
}
