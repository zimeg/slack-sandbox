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
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.31.0_macOS_64-bit.tar.gz";
                sha256 = "15xv5fpm7pdb0jyjniyky4vlafp4g0isnzxf23m7fynw2jkj7s1a";
              }
            else
              pkgs.fetchurl {
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.31.0_linux_64-bit.tar.gz";
                sha256 = "1bdk8c1insqhjkrn3fzc6dzlkgq6y0nvhac6rs3fsv81if8a5fgf";
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
