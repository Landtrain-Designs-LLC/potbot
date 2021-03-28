#include "mgos.h"
#include "mgos_i2c.h"
#include "mgos_si7021.h"

static struct mgos_si7021 *s_si7021;

extern "C" {
    float get_temperature (void) {
        if(s_si7021) {
            float temp;
            temp=mgos_si7021_getTemperature(s_si7021);
            return temp;
        } else {
            return 999
        }
    };
    float get_humidity (void) {
        if(s_si7021) {
            float humidity;
            humidity=mgos_si7021_getHumidity(s_si7021);
            return humidity
        } else {
            return 999
        }
    }
}

enum mgos_app_init_result mgos_app_init(void) {
  struct mgos_i2c *i2c;

  i2c=mgos_i2c_get_global();
  if (!i2c) {
    LOG(LL_ERROR, ("I2C bus missing, set i2c.enable=true in mos.yml"));
  } else {
    s_si7021=mgos_si7021_create(i2c, 0x40); // Default I2C address
  }
  return MGOS_APP_INIT_SUCCESS;
}