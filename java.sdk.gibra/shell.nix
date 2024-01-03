{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.jdk
    pkgs.gradle
  ];

  shellHook = ''
    echo "Coffee has brewed. Coding begins."
  '';
}
