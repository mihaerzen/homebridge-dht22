import { promises as sensor } from 'node-dht-sensor';

type ReadSensorResponse = {
    temperature: number;
    humidity: number;
};

let sensorReadPromise: null | Promise<ReadSensorResponse> = null;

export const readSensor = async (type: number, pin: number): Promise<ReadSensorResponse> => {
  // If already in progress
  if (sensorReadPromise) {
    return sensorReadPromise;
  }

  sensorReadPromise = sensor.read(type, pin);
  const response = await sensorReadPromise;
  sensorReadPromise = null;

  return response as ReadSensorResponse;
};
