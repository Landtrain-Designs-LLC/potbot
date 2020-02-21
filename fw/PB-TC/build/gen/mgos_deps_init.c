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
extern bool mgos_i2c_init(void);
extern bool mgos_atca_init(void);
extern bool mgos_ota_http_client_init(void);
extern bool mgos_shadow_init(void);
extern bool mgos_ota_shadow_init(void);
extern bool mgos_wifi_init(void);
extern bool mgos_http_server_init(void);
extern bool mgos_rpc_common_init(void);
extern bool mgos_rpc_ws_init(void);
extern bool mgos_dash_init(void);
extern bool mgos_dht_init(void);
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
extern bool mgos_sntp_init(void);

static const struct lib_descr {
  const char *title;
  bool (*init)(void);
} descrs[] = {

    // "freertos". deps: [ ]
    {.title = "freertos", .init = mgos_freertos_init},

    // "mongoose". deps: [ ]
    {.title = "mongoose", .init = mgos_mongoose_init},

    // "ota-common". deps: [ ]
    {.title = "ota-common", .init = mgos_ota_common_init},

    // "vfs-common". deps: [ ]
    {.title = "vfs-common", .init = mgos_vfs_common_init},

    // "vfs-fs-lfs". deps: [ "vfs-common" ]
    {.title = "vfs-fs-lfs", .init = mgos_vfs_fs_lfs_init},

    // "vfs-fs-spiffs". deps: [ "vfs-common" ]
    {.title = "vfs-fs-spiffs", .init = mgos_vfs_fs_spiffs_init},

    // "core". deps: [ "freertos" "mongoose" "ota-common" "vfs-common" "vfs-fs-lfs" "vfs-fs-spiffs" ]
    {.title = "core", .init = mgos_core_init},

    // "i2c". deps: [ "core" ]
    {.title = "i2c", .init = mgos_i2c_init},

    // "atca". deps: [ "i2c" ]
    {.title = "atca", .init = mgos_atca_init},

    // "ota-http-client". deps: [ "core" "ota-common" ]
    {.title = "ota-http-client", .init = mgos_ota_http_client_init},

    // "shadow". deps: [ "core" ]
    {.title = "shadow", .init = mgos_shadow_init},

    // "ota-shadow". deps: [ "core" "ota-common" "ota-http-client" "shadow" ]
    {.title = "ota-shadow", .init = mgos_ota_shadow_init},

    // "wifi". deps: [ "core" ]
    {.title = "wifi", .init = mgos_wifi_init},

    // "http-server". deps: [ "atca" "core" "wifi" ]
    {.title = "http-server", .init = mgos_http_server_init},

    // "rpc-common". deps: [ "core" "http-server" "mongoose" ]
    {.title = "rpc-common", .init = mgos_rpc_common_init},

    // "rpc-ws". deps: [ "core" "http-server" "rpc-common" ]
    {.title = "rpc-ws", .init = mgos_rpc_ws_init},

    // "dash". deps: [ "core" "ota-shadow" "rpc-ws" "shadow" ]
    {.title = "dash", .init = mgos_dash_init},

    // "dht". deps: [ "core" ]
    {.title = "dht", .init = mgos_dht_init},

    // "mbedtls". deps: [ ]
    {.title = "mbedtls", .init = mgos_mbedtls_init},

    // "mjs". deps: [ "core" ]
    {.title = "mjs", .init = mgos_mjs_init},

    // "ota-http-server". deps: [ "core" "http-server" "ota-common" "ota-http-client" ]
    {.title = "ota-http-server", .init = mgos_ota_http_server_init},

    // "provision". deps: [ "core" ]
    {.title = "provision", .init = mgos_provision_init},

    // "rpc-service-config". deps: [ "core" "rpc-common" ]
    {.title = "rpc-service-config", .init = mgos_rpc_service_config_init},

    // "rpc-service-fs". deps: [ "core" "rpc-common" ]
    {.title = "rpc-service-fs", .init = mgos_rpc_service_fs_init},

    // "rpc-service-gpio". deps: [ "core" "rpc-common" ]
    {.title = "rpc-service-gpio", .init = mgos_rpc_service_gpio_init},

    // "rpc-service-ota". deps: [ "core" "ota-http-client" "rpc-common" ]
    {.title = "rpc-service-ota", .init = mgos_rpc_service_ota_init},

    // "rpc-service-wifi". deps: [ "core" "rpc-common" "wifi" ]
    {.title = "rpc-service-wifi", .init = mgos_rpc_service_wifi_init},

    // "rpc-uart". deps: [ "core" "rpc-common" ]
    {.title = "rpc-uart", .init = mgos_rpc_uart_init},

    // "sntp". deps: [ "core" ]
    {.title = "sntp", .init = mgos_sntp_init},

};

bool mgos_deps_init(void) {
  size_t i;
  for (i = 0; i < sizeof(descrs) / sizeof(struct lib_descr); i++) {
    LOG(LL_DEBUG, ("init %s...", descrs[i].title));
    if (!descrs[i].init()) {
      LOG(LL_ERROR, ("%s init failed", descrs[i].title));
      return false;
    }
  }

  return true;
}
