import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  HAP,
  Logging,
  Service,
} from 'homebridge';
import {readSensor} from './readSensor';

let hap: HAP;

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory('Dht22Plugin', Dht22Plugin);
};

class Dht22Plugin implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly name: string;

  private readonly temperatureService: Service;
  private humidityService: Service;

  constructor(log: Logging, config: AccessoryConfig) {
    this.log = log;
    this.name = config.name;

    this.temperatureService = new hap.Service.TemperatureSensor(this.name);
    this.humidityService = new hap.Service.HumiditySensor(this.name);

    // create handlers for required characteristics
    this.temperatureService.getCharacteristic(hap.Characteristic.CurrentTemperature)
      .on('get', this.handleCurrentTemperatureGet.bind(this));

    this.humidityService.getCharacteristic(hap.Characteristic.CurrentRelativeHumidity)
      .on('get', this.handleCurrentRelativeHumidityGet.bind(this));

    this.log.info('config', config);
    this.log.info('Finished initializing!');
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  async handleCurrentTemperatureGet(callback) {
    this.log.debug('Triggered GET CurrentTemperature');
    const { temperature } = await readSensor();

    callback(null, temperature);
  }

  async handleCurrentRelativeHumidityGet(callback) {
    this.log.debug('Triggered GET CurrentRelativeHumidity');
    const { humidity } = await readSensor();

    callback(null, humidity);
  }


  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.temperatureService,
      this.humidityService,
    ];
  }
}
