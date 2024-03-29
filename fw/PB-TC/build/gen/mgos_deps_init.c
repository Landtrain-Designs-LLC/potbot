/* This file is auto-generated by mos build, do not edit! */

#include <stdbool.h>
#include <stdio.h>

#include "common/cs_dbg.h"

#include "mgos_app.h"


extern bool mgos_freertos_init(void);
extern bool mgos_mongoose_init(void);
extern bool mgos_ota_common_init(void);
extern bool mgos_vfs_common_init(void);
extern bool mgos_vfs_fs_lfs_init(void);
extern bool mgos_vfs_fs_spiffs_init(void);
extern bool mgos_core_init(void);
extern bool mgos_ota_http_client_init(void);
extern bool mgos_shadow_init(void);
extern bool mgos_ota_shadow_init(void);
extern bool mgos_wifi_init(void);
extern bool mgos_http_server_init(void);
extern bool mgos_rpc_common_init(void);
extern bool mgos_rpc_ws_init(void);
extern bool mgos_dash_init(void);
extern bool mgos_dht_init(void);
extern bool mgos_i2c_init(void);
extern bool mgos_mbedtls_init(void);
extern bool mgos_mjs_init(void);
extern bool mgos_ota_http_server_init(void);
extern bool mgos_provision_init(void);
extern bool mgos_rpc_service_config_init(void);
extern bool mgos_rpc_service_fs_init(void);
extern bool mgos_rpc_service_gpio_init(void);
extern bool mgos_rpc_service_ota_init(void);
extern bool mgos_rpc_service_wifi_init(void);
extern bool mgos_rpc_uart_init(void);
extern bool mgos_si7021_i2c_init(void);
extern bool mgos_sntp_init(void);

#ifndef MGOS_LIB_INFO_VERSION
struct mgos_lib_info {
  const char *name;
  const char *version;
  bool (*init)(void);
};
#endif

const struct mgos_lib_info mgos_libs_info[] = {

    // "freertos". deps: [ ]
    {.name = "freertos", .version = "10.2.0", .init = mgos_freertos_init},

    // "mongoose". deps: [ ]
    {.name = "mongoose", .version = "6.18", .init = mgos_mongoose_init},

    // "ota-common". deps: [ ]
    {.name = "ota-common", .version = "1.2.1", .init = mgos_ota_common_init},

    // "vfs-common". deps: [ ]
    {.name = "vfs-common", .version = "1.0", .init = mgos_vfs_common_init},

    // "vfs-fs-lfs". deps: [ "vfs-common" ]
    {.name = "vfs-fs-lfs", .version = "2.2.0", .init = mgos_vfs_fs_lfs_init},

    // "vfs-fs-spiffs". deps: [ "vfs-common" ]
    {.name = "vfs-fs-spiffs", .version = "1.0", .init = mgos_vfs_fs_spiffs_init},

    // "core". deps: [ "freertos" "mongoose" "ota-common" "vfs-common" "vfs-fs-lfs" "vfs-fs-spiffs" ]
    {.name = "core", .version = "1.0", .init = mgos_core_init},

    // "ota-http-client". deps: [ "core" "ota-common" ]
    {.name = "ota-http-client", .version = "1.0", .init = mgos_ota_http_client_init},

    // "shadow". deps: [ "core" ]
    {.name = "shadow", .version = "1.0", .init = mgos_shadow_init},

    // "ota-shadow". deps: [ "core" "ota-common" "ota-http-client" "shadow" ]
    {.name = "ota-shadow", .version = "1.0", .init = mgos_ota_shadow_init},

    // "wifi". deps: [ "core" ]
    {.name = "wifi", .version = "1.0", .init = mgos_wifi_init},

    // "http-server". deps: [ "core" "wifi" ]
    {.name = "http-server", .version = "1.0", .init = mgos_http_server_init},

    // "rpc-common". deps: [ "core" "http-server" "mongoose" ]
    {.name = "rpc-common", .version = "1.0", .init = mgos_rpc_common_init},

    // "rpc-ws". deps: [ "core" "http-server" "rpc-common" ]
    {.name = "rpc-ws", .version = "1.0", .init = mgos_rpc_ws_init},

    // "dash". deps: [ "core" "ota-shadow" "rpc-ws" "shadow" ]
    {.name = "dash", .version = "1.0", .init = mgos_dash_init},

    // "dht". deps: [ "core" ]
    {.name = "dht", .version = "1.0", .init = mgos_dht_init},

    // "i2c". deps: [ "core" ]
    {.name = "i2c", .version = "1.0", .init = mgos_i2c_init},

    // "mbedtls". deps: [ ]
    {.name = "mbedtls", .version = "2.16.6-cesanta1", .init = mgos_mbedtls_init},

    // "mjs". deps: [ "core" ]
    {.name = "mjs", .version = "1.0", .init = mgos_mjs_init},

    // "ota-http-server". deps: [ "core" "http-server" "ota-common" "ota-http-client" ]
    {.name = "ota-http-server", .version = "1.0", .init = mgos_ota_http_server_init},

    // "provision". deps: [ "core" ]
    {.name = "provision", .version = "1.0", .init = mgos_provision_init},

    // "rpc-service-config". deps: [ "core" "rpc-common" ]
    {.name = "rpc-service-config", .version = "1.0", .init = mgos_rpc_service_config_init},

    // "rpc-service-fs". deps: [ "core" "rpc-common" "vfs-common" ]
    {.name = "rpc-service-fs", .version = "1.0", .init = mgos_rpc_service_fs_init},

    // "rpc-service-gpio". deps: [ "core" "rpc-common" ]
    {.name = "rpc-service-gpio", .version = "1.0", .init = mgos_rpc_service_gpio_init},

    // "rpc-service-ota". deps: [ "core" "ota-http-client" "rpc-common" ]
    {.name = "rpc-service-ota", .version = "1.0", .init = mgos_rpc_service_ota_init},

    // "rpc-service-wifi". deps: [ "core" "rpc-common" "wifi" ]
    {.name = "rpc-service-wifi", .version = "1.0", .init = mgos_rpc_service_wifi_init},

    // "rpc-uart". deps: [ "core" "rpc-common" ]
    {.name = "rpc-uart", .version = "1.0", .init = mgos_rpc_uart_init},

    // "si7021-i2c". deps: [ "core" "i2c" ]
    {.name = "si7021-i2c", .version = "1.0", .init = mgos_si7021_i2c_init},

    // "sntp". deps: [ "core" ]
    {.name = "sntp", .version = "1.0", .init = mgos_sntp_init},

    // Last entry.
    {.name = NULL},
};

bool mgos_deps_init(void) {
  for (const struct mgos_lib_info *l = mgos_libs_info; l->name != NULL; l++) {
    LOG(LL_DEBUG, ("Init %s %s...", l->name, l->version));
    if (!l->init()) {
      LOG(LL_ERROR, ("%s init failed", l->name));
      return false;
    }
  }
  return true;
}
