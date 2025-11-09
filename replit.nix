{ pkgs }:

{
  deps = [
    pkgs.openssh
    pkgs.nano
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.nodePackages.yarn
    pkgs.nodePackages.typescript
  ];
}
