export interface DroneSummaryModel {
    uuid: string,
    name: string
    group_name: string,
    address: string,
    manager_version: string,
    first_discovered: string,
    home_position: { x: number; y: number; z: number },
    maintenance: boolean,
    remaining_percent: number | null,
    inFlight: boolean
}

export interface RegisterDroneRequest {
    groupName: string;
    droneName: string;
    address: string;
    px4Version: string;
    agentVersion: string;
    homePosition: {
        x: number;
        y: number;
        z: number;
    };
    model: string;
    capabilities: Array<string>;
}

export interface IoTCertContainer {
    privateKey: string;
    certificatePEM: string;
    certificateARN: string;
}

export interface PatchDroneRequestModel {
    groupName: string | undefined;
    droneName: string | undefined;
    address: string | undefined;
    agentVersion: string | undefined;
}

export const AVAILABLE_CAPABILITIES = [
    "Thermal Imaging", "Optical Zoom (30x)", "LIDAR",
    "Night Vision", "Payload Drop", "RTK GPS",
    "Obstacle Avoidance", "Waterproof (IP54)", "5G Connectivity",
    "Autonomous Patrol", "Face Recognition", "Loudspeaker",
    "Spotlight", "Gas Detection"
];

export const MAINTENANCE_TYPES = [
    "Routine Inspection",
    "Firmware Update",
    "Motor Repair",
    "Sensor Calibration",
    "Battery Replacement",
    "Structural Repair"
];

export const PUBLIC_IP_REGEX = /^(?!10\.)(?!172\.(1[6-9]|2[0-9]|3[0-1])\.)(?!192\.168\.)(?!127\.)(?!169\.254\.)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export type EditDroneField = 'address' | 'name' | 'version' | 'group';
