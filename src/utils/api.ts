import { fetchAuthSession } from 'aws-amplify/auth';
import { invoke } from '@tauri-apps/api/core';

interface ApiResponse {
    status: number;
    data: any;
}

class ApiError extends Error {
    status: number;
    data: any;
    constructor(message: string, status: number, data: any) {
        super(message);
        this.status = status;
        this.data = data;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export async function apiCall(
    path: string,
    queryParam?: Record<string, string>,
    method: string = 'GET',
    body?: any
) {
    try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (!token) {
            throw new Error("No active session");
        }

        const args: any = {
            path,
            queryParam: queryParam,
            method,
            token,
        };

        if (body) {
            args.body = body;
        }

        const response = await invoke<ApiResponse>('proxy_request', args);

        if (response.status >= 400) {
            console.error("API Error:", response.status, response.data);
            throw new ApiError(
                `Request failed with status ${response.status}`,
                response.status,
                response.data
            );
        }

        return response.data;

    } catch (error) {
        console.error("Bridge Error:", error);
        throw error;
    }
}