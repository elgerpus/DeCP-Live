import { IPagination } from "./ipagination";

export interface IEnvelope<T> {
    items: T[];
    pagination: IPagination;
}
