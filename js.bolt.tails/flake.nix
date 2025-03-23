{
  description = "a twisted task for taking the tube";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-biome.url = "github:NixOS/nixpkgs/0d534853a55b5d02a4ababa1d71921ce8f0aee4c"; # 1.9.4
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs =
    {
      nixpkgs,
      nixpkgs-biome,
      flake-utils,
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
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_3.0.1_macOS_64-bit.tar.gz";
                sha256 = "0ywmvzixv8dfz7nhdn2sh79amwns87vg06is8xhsl0f41igcnxw5";
              }
            else
              pkgs.fetchurl {
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_3.0.1_linux_64-bit.tar.gz";
                sha256 = "1dsfpdqyyklilrzvljj51q6iafmbipvx7fjhwbsn1rcb0jxrg614";
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
            biomepkgs.biome # https://github.com/biomejs/biome
            pkgs.nodejs_22 # https://github.com/nodejs/node
            pkgs.typescript # https://github.com/microsoft/TypeScript
            pkgs.yt-dlp # https://github.com/yt-dlp/yt-dlp
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
