{
  description = "a twisted task for taking the tube";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-biome.url = "github:NixOS/nixpkgs/c2d7b8bfc494f234d191322a7c387a9ff67e1786"; # 2.1.2
  };
  outputs =
    {
      nixpkgs,
      nixpkgs-biome,
      ...
    }:
    let
      each =
        function:
        nixpkgs.lib.genAttrs [
          "x86_64-darwin"
          "x86_64-linux"
          "aarch64-darwin"
          "aarch64-linux"
        ] (system: function nixpkgs.legacyPackages.${system} nixpkgs-biome.legacyPackages.${system});
    in
    {
      apps = each (
        pkgs: _:
        {
          default = {
            type = "app";
            program = "${pkgs.writeShellScript "tails" ''
              tmp=$(mktemp -d)
              cp -r ${./.}/* $tmp
              cd $tmp
              ${pkgs.nodejs_24}/bin/npm ci --omit=dev --omit=optional
              ${pkgs.typescript}/bin/tsc
              ${pkgs.nodejs_24}/bin/node dist/app.js
            ''}";
          };
        }
      );
      devShells = each (
        pkgs: biomepkgs:
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
              biomepkgs.biome # https://github.com/biomejs/biome
              pkgs.nodejs_24 # https://github.com/nodejs/node
              pkgs.typescript # https://github.com/microsoft/TypeScript
              pkgs.yt-dlp # https://github.com/yt-dlp/yt-dlp
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
