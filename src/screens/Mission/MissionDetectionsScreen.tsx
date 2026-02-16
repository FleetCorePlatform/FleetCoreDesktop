import {useEffect, useMemo, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import 'leaflet/dist/leaflet.css';

import { useTheme } from "@/ThemeProvider.tsx";
import {apiCall, apiCallFull} from "@/utils/api.ts";
import { Detection, DetectionValidationRequest, FilterStatus } from "@/screens/Mission/types";
import { DetectionHeader } from "./components/DetectionHeader";
import { DetectionSidebar } from "./components/DetectionSidebar";
import { DetectionReviewDialog } from "./components/DetectionReviewDialog";
import { DetectionEmptyState } from "./components/DetectionEmptyState";

export default function DetectionReviewScreen() {
    const { groupUuid, missionUuid } = useParams<{ groupUuid: string, missionUuid: string }>();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [detections, setDetections] = useState<Detection[]>([]);
    const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');

    const filteredDetections = useMemo(() => {
        return detections.filter(det => {
            if (activeFilter === 'ALL') return true;
            if (activeFilter === 'PENDING') return det.false_positive === null;
            if (activeFilter === 'CONFIRMED') return !det.false_positive;
            if (activeFilter === 'FALSE_POSITIVE') return det.false_positive;
            return true;
        });
    }, [detections, activeFilter]);

    useEffect(() => {
        fetchDetections();
    }, [missionUuid]);

    const fetchDetections = () => {
        apiCall<Detection[]>("/api/v1/detections", {"group_uuid": groupUuid || "", "mission_uuid": missionUuid || ""}, "GET")
            .then(res => {
                setDetections(res);
            })
            .catch(e => {
                console.log("Error while fetching detections: ", e);
                setDetections([])
            })
    }

    const sendDetectionConfirmation = async (detectionUuid: string, isFalsePositive: boolean) => {
        const payload: DetectionValidationRequest = {
            false_positive: isFalsePositive
        }

        console.log(`Sending confirmation for detection: ${detectionUuid}, in mission: ${missionUuid}`)

        apiCallFull("/api/v1/detections", {"mission_uuid": missionUuid!, "detection_uuid": detectionUuid}, "PATCH", payload)
            .then(res => {
                if (res.status == 204) {
                    setSelectedDetection(null)
                    fetchDetections()
                }
            })
            .catch(e => console.log("Error while sending confirmation request ", e))
    }

    const handleOpenDetection = (detection: Detection) => {
        setSelectedDetection(detection);
        setIsModalOpen(true);
    };

    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const formatCoords = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    return (
        <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] overflow-hidden font-mono">

            <DetectionHeader 
                navigate={navigate} 
                missionUuid={missionUuid} 
                detections={detections} 
            />

            {/* --- Main Layout --- */}
            <div className="flex-1 overflow-hidden relative flex">

                <DetectionSidebar 
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    filteredDetections={filteredDetections}
                    selectedDetection={selectedDetection}
                    handleOpenDetection={handleOpenDetection}
                    formatTime={formatTime}
                    formatCoords={formatCoords}
                />

                <DetectionEmptyState />

            </div>

            {/* --- Detection Analysis Modal --- */}
            <DetectionReviewDialog 
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                selectedDetection={selectedDetection}
                sendDetectionConfirmation={sendDetectionConfirmation}
                theme={theme}
            />
        </div>
    );
}
