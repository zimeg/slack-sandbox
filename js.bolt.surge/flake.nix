{
  description = "a powerful online email application";
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
      devShells = each (
        pkgs: biomepkgs:
        let
          # https://github.com/slackapi/slack-cli
          slackcli = pkgs.stdenv.mkDerivation {
            name = "slackcli";
            src =
              if pkgs.stdenv.isDarwin then
                pkgs.fetchurl {
                  url = "https://downloads.slack-edge.com/slack-cli/slack_cli_4.0.1_macOS_64-bit.tar.gz";
                  hash = "sha256-oY7tZ/daAz58FsX5ZtV35eogr4oWxsqexrGPFTLXeB4=";
                }
              else
                pkgs.fetchurl {
                  url = "https://downloads.slack-edge.com/slack-cli/slack_cli_4.0.1_linux_64-bit.tar.gz";
                  hash = "sha256-0CmqEF3sO+IOl4cLulU3vF5nxPv5z9EjAdf7kGOnqf4=";
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
              pkgs.bash # https://git.savannah.gnu.org/cgit/bash.git
              biomepkgs.biome # https://github.com/biomejs/biome
              pkgs.jq # https://github.com/jqlang/jq
              pkgs.nodejs_24 # https://github.com/nodejs/node
              pkgs.sops # https://github.com/getsops/sops
              slackcli
              pkgs.typescript # https://github.com/microsoft/typescript
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
