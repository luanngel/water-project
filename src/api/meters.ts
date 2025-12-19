const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const METERS_API_URL = `${API_BASE_URL}/api/v3/data/ppfu31vhv5gf6i0/mp1izvcpok5rk6s/records`;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json",
});

export interface MeterRecord {
  id: string;
  fields: {
    device_id: string;
    meter_address: string;
    manufacturer_code: string;
    forward_cumulative_flow: number;
    reverse_cumulative_flow: number;
    forward_instantaneous_flow: number;
    water_temperature: number;
    voltage: number;
    echo_amplitude: number;
    ultrasonic_flight_time: number;
    timestamp: string;
    alarm_bytes: string;
    checksum_ok: boolean;
    received_at: string;
  };
}

export interface MetersResponse {
  records: MeterRecord[];
  next?: string;
  prev?: string;
  nestedNext?: string;
  nestedPrev?: string;
}

export interface Meter {
  id: string;
  deviceId: string;
  meterAddress: string;
  manufacturerCode: string;
  forwardCumulativeFlow: number;
  reverseCumulativeFlow: number;
  forwardInstantaneousFlow: number;
  waterTemperature: number;
  voltage: number;
  echoAmplitude: number;
  ultrasonicFlightTime: number;
  timestamp: string;
  alarmBytes: string;
  checksumOk: boolean;
  receivedAt: string;
}

export const fetchMeters = async (): Promise<Meter[]> => {
  try {
    const response = await fetch(METERS_API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch meters");
    }

    const data: MetersResponse = await response.json();

    return data.records.map((r: MeterRecord) => ({
      id: r.id,
      deviceId: r.fields.device_id || "",
      meterAddress: r.fields.meter_address || "",
      manufacturerCode: r.fields.manufacturer_code || "",
      forwardCumulativeFlow: r.fields.forward_cumulative_flow || 0,
      reverseCumulativeFlow: r.fields.reverse_cumulative_flow || 0,
      forwardInstantaneousFlow: r.fields.forward_instantaneous_flow || 0,
      waterTemperature: r.fields.water_temperature || 0,
      voltage: r.fields.voltage || 0,
      echoAmplitude: r.fields.echo_amplitude || 0,
      ultrasonicFlightTime: r.fields.ultrasonic_flight_time || 0,
      timestamp: r.fields.timestamp || "",
      alarmBytes: r.fields.alarm_bytes || "",
      checksumOk: r.fields.checksum_ok || false,
      receivedAt: r.fields.received_at || "",
    }));
  } catch (error) {
    console.error("Error fetching meters:", error);
    throw error;
  }
};

export const createMeter = async (
  meterData: Omit<Meter, "id">
): Promise<Meter> => {
  try {
    const response = await fetch(METERS_API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fields: {
          device_id: meterData.deviceId,
          meter_address: meterData.meterAddress,
          manufacturer_code: meterData.manufacturerCode,
          forward_cumulative_flow: meterData.forwardCumulativeFlow,
          reverse_cumulative_flow: meterData.reverseCumulativeFlow,
          forward_instantaneous_flow: meterData.forwardInstantaneousFlow,
          water_temperature: meterData.waterTemperature,
          voltage: meterData.voltage,
          echo_amplitude: meterData.echoAmplitude,
          ultrasonic_flight_time: meterData.ultrasonicFlightTime,
          timestamp: meterData.timestamp,
          alarm_bytes: meterData.alarmBytes,
          checksum_ok: meterData.checksumOk,
          received_at: meterData.receivedAt,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create meter: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const createdRecord = data.records?.[0];

    if (!createdRecord) {
      throw new Error("Invalid response format: no record returned");
    }

    return {
      id: createdRecord.id,
      deviceId: createdRecord.fields.device_id || meterData.deviceId,
      meterAddress: createdRecord.fields.meter_address || meterData.meterAddress,
      manufacturerCode: createdRecord.fields.manufacturer_code || meterData.manufacturerCode,
      forwardCumulativeFlow: createdRecord.fields.forward_cumulative_flow || meterData.forwardCumulativeFlow,
      reverseCumulativeFlow: createdRecord.fields.reverse_cumulative_flow || meterData.reverseCumulativeFlow,
      forwardInstantaneousFlow: createdRecord.fields.forward_instantaneous_flow || meterData.forwardInstantaneousFlow,
      waterTemperature: createdRecord.fields.water_temperature || meterData.waterTemperature,
      voltage: createdRecord.fields.voltage || meterData.voltage,
      echoAmplitude: createdRecord.fields.echo_amplitude || meterData.echoAmplitude,
      ultrasonicFlightTime: createdRecord.fields.ultrasonic_flight_time || meterData.ultrasonicFlightTime,
      timestamp: createdRecord.fields.timestamp || meterData.timestamp,
      alarmBytes: createdRecord.fields.alarm_bytes || meterData.alarmBytes,
      checksumOk: createdRecord.fields.checksum_ok || meterData.checksumOk,
      receivedAt: createdRecord.fields.received_at || meterData.receivedAt,
    };
  } catch (error) {
    console.error("Error creating meter:", error);
    throw error;
  }
};

export const updateMeter = async (
  id: string,
  meterData: Omit<Meter, "id">
): Promise<Meter> => {
  try {
    const response = await fetch(METERS_API_URL, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id: id,
        fields: {
          device_id: meterData.deviceId,
          meter_address: meterData.meterAddress,
          manufacturer_code: meterData.manufacturerCode,
          forward_cumulative_flow: meterData.forwardCumulativeFlow,
          reverse_cumulative_flow: meterData.reverseCumulativeFlow,
          forward_instantaneous_flow: meterData.forwardInstantaneousFlow,
          water_temperature: meterData.waterTemperature,
          voltage: meterData.voltage,
          echo_amplitude: meterData.echoAmplitude,
          ultrasonic_flight_time: meterData.ultrasonicFlightTime,
          timestamp: meterData.timestamp,
          alarm_bytes: meterData.alarmBytes,
          checksum_ok: meterData.checksumOk,
          received_at: meterData.receivedAt,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(`Bad Request: ${errorData.msg || "Invalid data provided"}`);
      }
      throw new Error(`Failed to update meter: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const updatedRecord = data.records?.[0];

    if (!updatedRecord) {
      throw new Error("Invalid response format: no record returned");
    }

    return {
      id: updatedRecord.id,
      deviceId: updatedRecord.fields.device_id || meterData.deviceId,
      meterAddress: updatedRecord.fields.meter_address || meterData.meterAddress,
      manufacturerCode: updatedRecord.fields.manufacturer_code || meterData.manufacturerCode,
      forwardCumulativeFlow: updatedRecord.fields.forward_cumulative_flow || meterData.forwardCumulativeFlow,
      reverseCumulativeFlow: updatedRecord.fields.reverse_cumulative_flow || meterData.reverseCumulativeFlow,
      forwardInstantaneousFlow: updatedRecord.fields.forward_instantaneous_flow || meterData.forwardInstantaneousFlow,
      waterTemperature: updatedRecord.fields.water_temperature || meterData.waterTemperature,
      voltage: updatedRecord.fields.voltage || meterData.voltage,
      echoAmplitude: updatedRecord.fields.echo_amplitude || meterData.echoAmplitude,
      ultrasonicFlightTime: updatedRecord.fields.ultrasonic_flight_time || meterData.ultrasonicFlightTime,
      timestamp: updatedRecord.fields.timestamp || meterData.timestamp,
      alarmBytes: updatedRecord.fields.alarm_bytes || meterData.alarmBytes,
      checksumOk: updatedRecord.fields.checksum_ok || meterData.checksumOk,
      receivedAt: updatedRecord.fields.received_at || meterData.receivedAt,
    };
  } catch (error) {
    console.error("Error updating meter:", error);
    throw error;
  }
};

export const deleteMeter = async (id: string): Promise<void> => {
  try {
    const response = await fetch(METERS_API_URL, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id: id,
      }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(`Bad Request: ${errorData.msg || "Invalid data provided"}`);
      }
      throw new Error(`Failed to delete meter: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting meter:", error);
    throw error;
  }
};
