{ pkgs }:
{
  deps = [
    pkgs.nodejs-20_x
    pkgs.postgresql_16
    pkgs.curl
    pkgs.procps
    pkgs.nettools
  ];
  env = {
    REPLIT_KEEP_PACKAGE_DEV_DEPENDENCIES = "1";
  };
}
