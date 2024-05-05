{
  description = "a kind creation for currencies";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-deno.url = "github:NixOS/nixpkgs/b2eca02a0ab4d255c111706f85bb4eb1f2b3b958"; # 1.42.4
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, nixpkgs-deno, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        denopkgs = import nixpkgs-deno {
          inherit system;
        };
        slackcli = pkgs.stdenv.mkDerivation {
          name = "slackcli";
          src = if pkgs.stdenv.isDarwin then
            pkgs.fetchurl {
              url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.23.0_macOS_64-bit.tar.gz";
              sha256 = "04p01cf1qhra3y50v3ld08amli3xvxz4c5kjnr1jngjf9nb2zmki";
            }
          else
            pkgs.fetchurl {
              url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.23.0_linux_64-bit.tar.gz";
              sha256 = "0andhpk39dgpg7341jr4s2qpg4l75hixh8ipcn9dm5zf8g9vj33y";
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
      });
}
