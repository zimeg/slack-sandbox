{
  description = "a powerful online email application";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        slackcli = pkgs.stdenv.mkDerivation {
          name = "slackcli";
          src =
            if pkgs.stdenv.isDarwin then
              pkgs.fetchurl
                {
                  url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.29.1_macOS_64-bit.tar.gz";
                  sha256 = "1krzqkv9rsfxyhv4z7c2pa1hgjs73sb7ip2bnc7njl08yapnhavp";
                }
            else
              pkgs.fetchurl {
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.29.1_linux_64-bit.tar.gz";
                sha256 = "054i8msn6y6k02dm9930l6nrm3i83axcz6wp4s8izri4kw9gklh3";
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
      });
}
