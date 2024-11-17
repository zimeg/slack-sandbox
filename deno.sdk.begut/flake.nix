{
  description = "a kind creation for currencies";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-deno.url = "github:NixOS/nixpkgs/dfb72de3dbe62ff47e59894d50934e03f0602072"; # 1.46.3
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { nixpkgs, nixpkgs-deno, flake-utils, ... }:
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
