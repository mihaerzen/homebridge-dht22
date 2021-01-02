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
  api.registerAccessory('DhtSensorPlugin', DhtSensorPlugin);
};

class DhtSensorPlugin implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly name: string;
  private readonly temperatureService: Service;
  private readonly humidityService: Service;
  private readonly sensorType: number;
  private readonly sensorPin: number;

  constructor(log: Logging, config: AccessoryConfig) {
    this.log = log;
    this.name = config.name;
    this.sensorType = parseInt(config.sensorType as string, 10) || 22;
    this.sensorPin = parseInt(config.sensorPin as string, 10) || 4;

    const {TemperatureSensor, HumiditySensor} = hap.Service;
    this.temperatureService = new TemperatureSensor(this.name);
    this.humidityService = new HumiditySensor(this.name);

    // create handlers for required characteristics
    const {CurrentTemperature, CurrentRelativeHumidity} = hap.Characteristic;
    this.temperatureService.getCharacteristic(CurrentTemperature)
      .on('get', this.handleCurrentTemperatureGet.bind(this));

    this.humidityService.getCharacteristic(CurrentRelativeHumidity)
      .on('get', this.handleCurrentRelativeHumidityGet.bind(this));

    setInterval(async () => {
      const { temperature, humidity } = await this.readSensor();
      this.humidityService.setCharacteristic(CurrentRelativeHumidity, humidity);
      this.temperatureService.setCharacteristic(CurrentTemperature, temperature);
    }, 60 * 1000);
  }

  async readSensor() {
    return readSensor(this.sensorType, this.sensorPin);
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  async handleCurrentTemperatureGet(callback) {
    const { temperature } = await this.readSensor();

    callback(null, temperature);
  }

  async handleCurrentRelativeHumidityGet(callback) {
    const { humidity } = await this.readSensor();

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
