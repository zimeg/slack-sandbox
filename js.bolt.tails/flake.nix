{
  description = "a twisted task for taking the tube";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-biome.url = "github:NixOS/nixpkgs/c2d7b8bfc494f234d191322a7c387a9ff67e1786"; # 2.1.2
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
}
