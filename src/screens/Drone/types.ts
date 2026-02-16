export interface Drone {
    uuid: string;
    name: string;
    group_uuid: string;
    address: string;
    manager_version: string;
    first_discovered: string;
    home_position: { x: number; y: number; z: number };
    model: string;
    capabilities: Array<string>;
    status: {
        uptime: number | null;
        connected: boolean;
    };
}

export interface TerminalEntry {
    type: "command" | "output" | "error";
    content: string;
}
