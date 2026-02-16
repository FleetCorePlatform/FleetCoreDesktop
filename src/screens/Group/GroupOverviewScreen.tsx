import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {apiCall, apiCallFull} from "@/utils/api.ts";

import {
    DroneSummaryModel, RegisterDroneRequest, MAINTENANCE_TYPES, PUBLIC_IP_REGEX, EditDroneField,
    PatchDroneRequestModel, RegisteredDroneResponse, GroupModel
} from "./types";

import { GroupHeader } from "./components/GroupHeader";
import { GroupStats } from "./components/GroupStats";
import { DroneList } from "./components/DroneList";
import { RegistrationDialog, RegFormState } from "./components/RegistrationDialog";
import { MaintenanceDialog } from "./components/MaintenanceDialog";
import { EditDroneDialog } from "./components/EditDroneDialog";
import { CameraDialog } from "./components/CameraDialog";
import { DecommissionDialog } from "./components/DecommissionDialog";
import { DeleteGroupDialog } from "./components/DeleteGroupDialog";

export default function GroupOverviewScreen() {
    const { groupUuid, outpostUuid } = useParams<{ groupUuid: string; outpostUuid: string; }>();
    const navigate = useNavigate();

    const [drones, setDrones] = useState<DroneSummaryModel[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDrone, setEditingDrone] = useState<DroneSummaryModel | null>(null);
    const [editField, setEditField] = useState<EditDroneField | null>(null);
    const [editValue, setEditValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [regError, setRegError] = useState<string | null>(null);
    const [createdDroneBody, setCreatedDroneBody] = useState<RegisteredDroneResponse | null>(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");

    const [isDecommissionOpen, setIsDecommissionOpen] = useState(false);
    const [decommissionDrone, setDecommissionDrone] = useState<DroneSummaryModel | null>(null);
    const [decommissionInput, setDecommissionInput] = useState("");

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraDrone, setCameraDrone] = useState<DroneSummaryModel | null>(null);

    const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
    const [maintenanceDrone, setMaintenanceDrone] = useState<DroneSummaryModel | null>(null);
    const [maintenanceForm, setMaintenanceForm] = useState({
        type: 'Routine Inspection',
        description: ''
    });
    const [maintenanceLoading, setMaintenanceLoading] = useState(false);

    const [targetGroupName, setTargetGroupName] = useState("");
    const [firmwareVersion, setFirmwareVersion] = useState("");

    const [searchQuery, setSearchQuery] = useState("");

    const [deleteError, setDeleteError] = useState<string | null>(null);

    const [regForm, setRegForm] = useState<RegFormState>({
        name: '',
        group: targetGroupName,
        address: '',
        px4: 'v1.14.0',
        agent: 'v2.5.1',
        altitude: '50',
        home: null,
        model: '',
        capabilities: []
    });

    useEffect(() => {
        setRegForm(prev => ({ ...prev, group: targetGroupName }));
    }, [targetGroupName]);


    const openMaintenanceModal = (drone: DroneSummaryModel) => {
        setMaintenanceDrone(drone);
        setMaintenanceForm({ type: MAINTENANCE_TYPES[0], description: '' });
        setIsMaintenanceOpen(true);
    };

    const handleCreateMaintenance = async () => {
        if (!maintenanceDrone || !maintenanceForm.description) return;

        setMaintenanceLoading(true);
        try {
            await apiCall('/api/v1/maintenance', undefined, "POST", {
                droneUuid: maintenanceDrone.uuid,
                type: maintenanceForm.type,
                description: maintenanceForm.description
            });

            await new Promise(resolve => setTimeout(resolve, 500));

            setIsMaintenanceOpen(false);
            navigate(`/maintenance/${outpostUuid}`);
        } catch (e) {
            console.error("Failed to create maintenance record", e);
        } finally {
            setMaintenanceLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const groupPromise = apiCall<GroupModel>(`/api/v1/groups/${groupUuid}`, undefined, "GET");
                const dronesPromise = apiCall<DroneSummaryModel[]>(
                    `/api/v1/groups?group_uuid=${groupUuid}&limit=10`, undefined, "GET"
                );

                const [groupDetails, dronesSummary] = await Promise.all([groupPromise, dronesPromise]);

                setTargetGroupName(groupDetails.name);
                setDrones(dronesSummary);
                setFirmwareVersion(dronesSummary.length > 0 ? dronesSummary[0].manager_version : "N/A");
            } catch (error) {
                console.error("Failed to fetch group details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [groupUuid, outpostUuid]);

    const pageTitle = targetGroupName;



    const handleDeleteClick = () => {
        setDeleteInput("");
        setDeleteError(null);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteInput !== targetGroupName) return;
        setDeleteError(null);

        await apiCallFull(`/api/v1/groups/${groupUuid}`, undefined, "DELETE")
            .then(res => {
                if (res.status === 304) {
                    setDeleteError("Cannot delete group: The group is not empty. Please decommission or move all drones before deleting the group.");
                } else if (res.status === 204) {
                    setIsDeleteOpen(false);
                    navigate(`/outposts/${outpostUuid}`);
                }
            })
            .catch(e => {
                console.error("Error while deleting group: ", e);
                setDeleteError("An unexpected error occurred while deleting the group.");
            })
    };

    const openDecommissionModal = (drone: DroneSummaryModel) => {
        setDecommissionDrone(drone);
        setDecommissionInput("");
        setIsDecommissionOpen(true);
    };

    const confirmDecommission = async () => {
        if (!decommissionDrone || decommissionInput !== decommissionDrone.name) return;

        try {
            await apiCall(`/api/v1/drones/${decommissionDrone.uuid}`, undefined, "DELETE");
            setDrones(prev => prev.filter(d => d.uuid !== decommissionDrone.uuid));
            setIsDecommissionOpen(false);
        } catch (e) {
            console.error("Failed to decommission drone", e);
        }
    };

    const saveFile = async (filename: string, content: string) => {
        try {
            const filePath = await save({
                defaultPath: filename,
                filters: [{
                    name: 'Credential File',
                    extensions: [filename.split('.').pop() || 'txt']
                }]
            });

            if (filePath) {
                await writeTextFile(filePath, content);
            }
        } catch (error) {
            console.error("Failed to save file:", error);
        }
    };

    const handleRegister = async () => {
        if (!regForm.name || !regForm.address || !regForm.model || regForm.capabilities.length === 0) {
            setRegError("Name and Address are required.");
            return;
        }
        if (!PUBLIC_IP_REGEX.test(regForm.address)) {
            setRegError("Invalid Public IP Address.");
            return;
        }
        if (!regForm.home) {
            setRegError("Please select a Home Position on the map.");
            return;
        }

        const payload: RegisterDroneRequest = {
            groupName: targetGroupName,
            droneName: regForm.name,
            address: regForm.address,
            px4Version: regForm.px4,
            agentVersion: regForm.agent,
            homePosition: {
                x: regForm.home!.lng,
                y: regForm.home!.lat,
                z: parseFloat(regForm.altitude) || 0
            },
            model: regForm.model,
            capabilities: regForm.capabilities
        };

        await apiCall<RegisteredDroneResponse>("/api/v1/drones", undefined, "POST", payload)
            .then(res => setCreatedDroneBody(res))
            .catch(e => {
                console.log("Error while registering drone: ", e);
                setRegError(null);
            });
    };

    const handleFinishRegistration = () => {
        setIsRegisterOpen(false);
        navigate(0);
    };

    const openEditModal = (drone: DroneSummaryModel, field: EditDroneField) => {
        setEditingDrone(drone);
        setEditField(field);
        setError(null);

        switch (field) {
            case 'address': setEditValue(drone.address); break;
            case 'name': setEditValue(drone.name); break;
            case 'version': setEditValue(drone.manager_version); break;
            case 'group': setEditValue(targetGroupName); break;
        }
        setIsDialogOpen(true);
    };

        const handleSaveEdit = async () => {
            if (!editingDrone || !editField) return;
    
            if (editField === 'address') {
                if (!PUBLIC_IP_REGEX.test(editValue)) {
                    setError("Invalid Public IP Address (Private ranges not allowed).");
                    return;
                }
            }
    
            let payload: PatchDroneRequestModel = {
                groupName: editField === 'group' ? editValue : editingDrone.group_name,
                droneName: editField === 'name' ? editValue : editingDrone.name,
                address: editField === 'address' ? editValue : editingDrone.address,
                agentVersion: editField === 'version' ? editValue : editingDrone.manager_version,
            }
    
            apiCallFull(`/api/v1/drones/${editingDrone.uuid || ""}`, undefined, "PATCH", payload)
                .then(res => {
                    if (res.status === 204) {
                        navigate(0);
                    }
                })
                .catch(e => {
                    console.log("Error while updating drone: ", e);
                    setIsDialogOpen(false);
                })
        };

    const openCamera = (drone: DroneSummaryModel) => {
        setCameraDrone(drone);
        setIsCameraOpen(true);
    }

    if (loading) {
        return <div className="p-8 text-center text-[hsl(var(--text-secondary))]">Loading fleet data...</div>;
    }

    const filteredDrones = drones.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
            <div className="flex-1 overflow-auto">
                <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">

                    <GroupHeader
                        pageTitle={pageTitle}
                        groupUuid={groupUuid}
                        outpostUuid={outpostUuid}
                        onDeleteClick={handleDeleteClick}
                        onRegisterClick={() => setIsRegisterOpen(true)}
                    />

                    <GroupStats
                        drones={drones}
                        firmwareVersion={firmwareVersion}
                    />

                    <DroneList
                        filteredDrones={filteredDrones}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onCameraClick={openCamera}
                        onViewDetailsClick={(uuid) => navigate(`/drones/${uuid}`)}
                        onEditClick={openEditModal}
                        onMaintenanceClick={openMaintenanceModal}
                        onDecommissionClick={openDecommissionModal}
                    />
                </div>
            </div>

            <MaintenanceDialog
                open={isMaintenanceOpen}
                onOpenChange={setIsMaintenanceOpen}
                drone={maintenanceDrone}
                form={maintenanceForm}
                setForm={setMaintenanceForm}
                loading={maintenanceLoading}
                onCreate={handleCreateMaintenance}
            />

            <RegistrationDialog
                open={isRegisterOpen}
                onOpenChange={(open) => {
                    setIsRegisterOpen(open);
                    if (!open) {
                        setTimeout(() => {
                            setCreatedDroneBody(null);
                            setRegForm({
                                name: '', group: targetGroupName, address: '',
                                px4: 'v1.14.0', agent: 'v2.5.1', altitude: '50', home: null,
                                model: '', capabilities: []
                            });
                        }, 200);
                    }
                }}
                regForm={regForm}
                setRegForm={setRegForm}
                targetGroupName={targetGroupName}
                onRegister={handleRegister}
                registeredDroneResponse={createdDroneBody}
                regError={regError}
                onFinish={handleFinishRegistration}
                saveFile={saveFile}
            />

            <DeleteGroupDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                targetGroupName={targetGroupName}
                input={deleteInput}
                setInput={setDeleteInput}
                onConfirm={confirmDelete}
                error={deleteError}
            />

            <DecommissionDialog
                open={isDecommissionOpen}
                onOpenChange={setIsDecommissionOpen}
                drone={decommissionDrone}
                input={decommissionInput}
                setInput={setDecommissionInput}
                onConfirm={confirmDecommission}
            />

            <CameraDialog
                open={isCameraOpen}
                onOpenChange={setIsCameraOpen}
                drone={cameraDrone}
            />

            <EditDroneDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                drone={editingDrone}
                field={editField}
                value={editValue}
                onValueChange={(val) => {
                    setEditValue(val);
                    if (error) setError(null);
                }}
                onSave={handleSaveEdit}
                error={error}
            />
        </div>
    );
}
