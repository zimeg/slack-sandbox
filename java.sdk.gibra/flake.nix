{
  description = "a caffeinated iced mocha for gibra";
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
            pkgs.jdk21 # https://github.com/openjdk/jdk/releases/tag/jdk-21-ga
            pkgs.gradle # https://github.com/gradle/gradle
            slackcli
          ];
          shellHook = ''
            export SLACK_CONFIG_DIR="$HOME/.config/slack"
            mkdir -p $SLACK_CONFIG_DIR
          '';
        };
      });
}
