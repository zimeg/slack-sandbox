{
  description = "a kind creation for currencies";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-deno.url = "github:NixOS/nixpkgs/b2eca02a0ab4d255c111706f85bb4eb1f2b3b958"; # 1.42.4
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
                  url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.25.0_macOS_64-bit.tar.gz";
                  sha256 = "0ghis7vw8qbnr07scxnivfimvznbimlv07j062996cipsyq1akbs";
                }
            else
              pkgs.fetchurl {
                url = "https://downloads.slack-edge.com/slack-cli/slack_cli_2.25.0_linux_64-bit.tar.gz";
                sha256 = "135a6ccqr14fyfa72dgk1s0l06b8598ns2ln1rzdbgc3ahnigyy4";
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
