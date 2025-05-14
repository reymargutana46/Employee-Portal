import { Workload } from "./workload";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Res<T = any> {
    message: string;
    data: T;
}
export interface WorkloadResponse {
    facultyWorkload: Workload[]
    staffWorkload: Workload[]
    unassignedWorkload: Workload[]
}

