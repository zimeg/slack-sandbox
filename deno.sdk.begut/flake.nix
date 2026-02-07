{
  description = "a kind creation for currencies";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };
  outputs =
    { nixpkgs, ... }:
    let
      each =
        function:
        nixpkgs.lib.genAttrs [
          "x86_64-darwin"
          "x86_64-linux"
          "aarch64-darwin"
          "aarch64-linux"
        ] (system: function nixpkgs.legacyPackages.${system});
    in
    {
      devShells = each (
        pkgs:
        let
          # https://github.com/slackapi/slack-cli
          slackcli = pkgs.stdenv.mkDerivation {
            name = "slackcli";
            src =
              if pkgs.stdenv.isDarwin then
                pkgs.fetchurl {
                  url = "https://downloads.slack-edge.com/slack-cli/slack_cli_3.12.0_macOS_64-bit.tar.gz";
                  hash = "sha256-reQ2cB/BeFqXxbF3JYBzI3nwO+Jk1KgjuMjCm3qgNX0=";
                }
              else
                pkgs.fetchurl {
                  url = "https://downloads.slack-edge.com/slack-cli/slack_cli_3.12.0_linux_64-bit.tar.gz";
                  hash = "sha256-A0QELxVKAZgPgjopWCleQFVzv2mBM3L57zZLMga0yHg=";
                };
            unpackPhase = "tar -xzf $src";
            installPhase = ''
              mkdir -p $out/bin
              cp -r bin/slack $out/bin/slack
            '';
          };
        in
        {
          default = pkgs.mkShell {
            buildInputs = [
              pkgs.deno # https://github.com/denoland/deno
              slackcli
            ];
            shellHook = ''
              export SLACK_CONFIG_DIR="$HOME/.config/slack"
              mkdir -p $SLACK_CONFIG_DIR
            '';
          };
        }
      );
    };
}
