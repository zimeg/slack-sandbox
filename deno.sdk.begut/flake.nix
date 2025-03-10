{
  description = "a kind creation for currencies";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-deno.url = "github:NixOS/nixpkgs/5ed627539ac84809c78b2dd6d26a5cebeb5ae269"; # 1.46.2
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs =
    {
      nixpkgs,
      nixpkgs-deno,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        denopkgs = import nixpkgs-deno {
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
            denopkgs.deno
            slackcli
          ];
          shellHook = ''
            export SLACK_CONFIG_DIR="$HOME/.config/slack"
            mkdir -p $SLACK_CONFIG_DIR
          '';
        };
      }
    );
}
