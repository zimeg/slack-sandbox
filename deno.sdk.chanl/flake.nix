{
  description = "unstable packages with known channels";
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
        # https://api.slack.com/automation/cli
        slackcli = pkgs.stdenv.mkDerivation {
          name = "slackcli";
          src =
            if pkgs.stdenv.isDarwin then
              pkgs.fetchurl
                {
                  url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.27.1_macOS_64-bit.tar.gz";
                  sha256 = "0ixxlprfhsf1zfj4kd06hav2fxva83s8by0vjhaf1njnh07higbz";
                }
            else
              pkgs.fetchurl {
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.27.1_linux_64-bit.tar.gz";
                sha256 = "0chhwdpkbahivb56jf26spbb8xsi2bjqs6bzxi0ahgkllhbk9v9q";
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
            pkgs.deno # https://github.com/denoland/deno
            slackcli
          ];
          shellHook = ''
            export SLACK_CONFIG_DIR="$HOME/.config/slack"
            mkdir -p $SLACK_CONFIG_DIR
          '';
        };
      });
}
