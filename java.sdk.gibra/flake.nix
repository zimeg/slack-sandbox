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
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = [
            pkgs.jdk22 # https://github.com/openjdk/jdk/releases/tag/jdk-22-ga
            pkgs.gradle # https://github.com/gradle/gradle
          ];
        };
      });
}
