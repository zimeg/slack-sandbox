{
  description = "a caffeinated iced mocha for gibra";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs =
    { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        # https://github.com/slackapi/slack-cli
        slackcli = pkgs.stdenv.mkDerivation {
          name = "slackcli";
          src =
            if pkgs.stdenv.isDarwin then
              pkgs.fetchurl {
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_3.5.1_macOS_64-bit.tar.gz";
                sha256 = "0abavvsjp1mi6s9wvbishswwr5jh7s48b71nnafvfhhhv261x56i";
              }
            else
              pkgs.fetchurl {
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_3.5.1_linux_64-bit.tar.gz";
                sha256 = "15h5zsn1h6lz5q0qsy9qhjphrf516npqhpixy9w7f1ill0gk1xn2";
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
      }
    );
}
