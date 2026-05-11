// src/types.ts
//
// Type definitions for the Telemetry Tool HTTP feed.
// Every field maps directly to the JSON from:
//   /JSON/telemetrypacket
//   /JSON/aidata

// --- Telemetry Packet ---
// Detailed data about the driver's car.
// Source: /JSON/telemetrypacket
export interface TelemetryPacket {
  // Lap info
  LapTime: number;
  Sector1Time: number;
  Sector2Time: number;
  LapDistance: number;
  TotalDistance: number;
  Lap: number;
  LastLapTime: number;
  CurrentLapInvalid: number;
  TrackLength: number;
  TotalLapsInRace: number;

  // Driving inputs
  Speed: number;
  Gear: number;
  ThrottlePercentage: number;
  BrakePercentage: number;
  Steer: number;
  Clutch: number;
  Handbrake: number;

  // Engine
  EngineRevs: number;
  MaxRevs: number;
  MinRevs: number;
  MaxGears: number;
  EngineTemperature: number;
  Torque: number;

  // G-forces
  GForceLatitudinal: number;
  GForceLongitudinal: number;
  GForceVertical: number;

  // Car position in 3D space (track map)
  X: number;
  Y: number;
  Z: number;

  // Car orientation
  Yaw: number;
  Roll: number;
  Pitch: number;

  // Fuel
  FuelRemaining: number;
  FuelAtStart: number;
  FuelMixMode: number;

  // Race info
  RacePosition: number;
  Sector: number;
  InPits: number;
  DRS: number;
  CanUseDRS: number;
  CurrentFlag: number;
  Event: number;
  Team: number;
  TrackId: number;
  Weather: number;

  // Tyre surface temperatures (per corner)
  TyreTemperatureRearLeft: number;
  TyreTemperatureRearRight: number;
  TyreTemperatureFrontLeft: number;
  TyreTemperatureFrontRight: number;

  // Tyre carcass temperatures (per corner)
  TyreCarcassTemperatureRearLeft: number;
  TyreCarcassTemperatureRearRight: number;
  TyreCarcassTemperatureFrontLeft: number;
  TyreCarcassTemperatureFrontRight: number;

  // Tyre temperatures — inner/middle/outer (per corner)
  FrontLeftInside: number;
  FrontLeftMiddle: number;
  FrontLeftOutside: number;
  FrontRightInside: number;
  FrontRightMiddle: number;
  FrontRightOutside: number;
  RearLeftInside: number;
  RearLeftMiddle: number;
  RearLeftOutside: number;
  RearRightInside: number;
  RearRightMiddle: number;
  RearRightOutside: number;

  // Tyre pressure (per corner)
  TyrePressureRearLeft: number;
  TyrePressureRearRight: number;
  TyrePressureFrontLeft: number;
  TyrePressureFrontRight: number;

  // Tyre wear (per corner)
  TyreWearRearLeft: number;
  TyreWearRearRight: number;
  TyreWearFrontLeft: number;
  TyreWearFrontRight: number;

  // Tyre damage (per corner)
  TyreDamageRearLeft: number;
  TyreDamageRearRight: number;
  TyreDamageFrontLeft: number;
  TyreDamageFrontRight: number;

  // Tyre compound and set
  TyreCompound: number;
  Tyreset: number;

  // Wheel speed (per corner)
  WheelSpeedRearLeft: number;
  WheelSpeedRearRight: number;
  WheelSpeedFrontLeft: number;
  WheelSpeedFrontRight: number;

  // Wheel slip (per corner)
  WheelSlipRearLeft: number;
  WheelSlipRearRight: number;
  WheelSlipFrontLeft: number;
  WheelSlipFrontRight: number;

  // Brake temperatures (per corner)
  BrakeTemperatureRearLeft: number;
  BrakeTemperatureRearRight: number;
  BrakeTemperatureFrontLeft: number;
  BrakeTemperatureFrontRight: number;

  // Suspension position (per corner)
  SuspensionPositionRearLeft: number;
  SuspensionPositionRearRight: number;
  SuspensionPositionFrontLeft: number;
  SuspensionPositionFrontRight: number;

  // Suspension velocity (per corner)
  SuspensionVelocityRearLeft: number;
  SuspensionVelocityRearRight: number;
  SuspensionVelocityFrontLeft: number;
  SuspensionVelocityFrontRight: number;

  // Suspension acceleration (per corner)
  SuspensionAccelerationRearLeft: number;
  SuspensionAccelerationRearRight: number;
  SuspensionAccelerationFrontLeft: number;
  SuspensionAccelerationFrontRight: number;

  // Ride height
  FrontRideHeight: number;
  RearRideHeight: number;

  // Corner loads
  LoadFrontLeft: number;
  LoadFrontRight: number;
  LoadRearLeft: number;
  LoadRearRight: number;

  // ERS / Virtual Energy
  KERSLevel: number;
  MGUKHarvested: number;
  MGUHHarvested: number;
  ERSSpent: number;
  ERSMode: number;
  IcePower: number;
  MgukPower: number;

  // World velocity
  WoldSpeedX: number;
  WoldSpeedY: number;
  WoldSpeedZ: number;

  // Angular velocity
  LocalAngularVelocityX: number;
  LocalAngularVelocityY: number;
  LocalAngularVelocityZ: number;

  // --- EXTRA FIELDS ---
  // Unnamed LMU-specific fields. Need testing to determine purpose.
  //
  // Initial observations (stationary in garage):
  //   Extra1: 0.0
  //   Extra2: 100.0  ← Likely VE (Virtual Energy) percentage.
  //                    Starts at 100, should deplete during driving
  //                    and recover under braking. Test with a Hypercar
  //                    (Toyota GR010, Porsche 963, Ferrari 499P) and
  //                    monitor if it changes with energy usage.
  //   Extra3: 0.0
  //   Extra4: 50.5   ← Unknown. Could be energy-related or a
  //                    percentage value. Monitor during a session
  //                    to see how it changes.
  //
  // TODO: Drive a Hypercar stint and log these values to confirm.
  //       Compare with in-game VE gauge to verify Extra2.
  Extra1: number;
  Extra2: number;
  Extra3: number;
  Extra4: number;
}

// --- AI Driver ---
// Data about a single car on the grid.
// Source: /JSON/aidata (returns AiDriver[])
export interface AiDriver {
  // Driver identity
  driverId: number;
  driverTLA: string;
  driver: string;

  // Position
  position: number;
  gridPosition: number;

  // Car info
  teamId: number;
  carName: string;
  carClass: string;
  carRaceNumber: number;
  color: string;

  // Current lap
  lap: number;
  valid: boolean;
  laptime: number;
  sector: number;
  currentS1: number;
  currentS2: number;

  // Best lap
  bestLap: number;
  best: string;
  bestLapTimeInSeconds: string;
  bestLapS1: string;
  bestLapS2: string;
  bestLapS3: string;
  bestS1: number;
  bestS1Lap: number;
  bestS2: number;
  bestS2Lap: number;
  bestS3: number;
  bestS3Lap: number;

  // Last lap
  last: string;
  lastLapTimeInSeconds: number;
  lastS1: string;
  lastS2: string;
  lastS3: string;
  lastThreeAvg: string;

  // Gap
  diffToLeader: string;

  // Pit strategy
  lapsAfterPit: number;
  pitstops: number;
  pitTimesTotal: number;
  inGarage: boolean;
  inPitLane: boolean;
  inPitBox: boolean;

  // Race status
  finished: boolean;
  dnf: boolean;
  dq: boolean;
  penalties: number;

  // Live driving data
  speedInKmh: number;
  throttle: number;
  brake: number;
  steer: number;
  gear: number;

  // Track position (for map)
  x: number;
  y: number;

  // Tyre
  tyre: string;
}

export interface WsMessage {
  telemetry: TelemetryPacket | null;
  aidata: AiDriver[] | null;
}