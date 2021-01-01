import { promises as Dht22Sensor } from 'node-dht-sensor';

type ReadSensorResponse = {
    temperature: number;
    humidity: number;
};

let sensorReadPromise: null | Promise<ReadSensorResponse> = null;

export const readSensor = async (): Promise<ReadSensorResponse> => {
  if (sensorReadPromise) {
    return sensorReadPromise;
  }

  sensorReadPromise = Dht22Sensor.read(22, 4);
  const response = await sensorReadPromise;
  sensorReadPromise = null;

  return response as ReadSensorResponse;
};
