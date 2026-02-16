export interface MaintenanceRecord {
    uuid: string;
    drone_uuid: string;
    drone_name: string;
    drone_group_name: string;
    performed_by: string;
    maintenance_type: string;
    description: string;
    created_at: string;
    performed_at?: string;
}
