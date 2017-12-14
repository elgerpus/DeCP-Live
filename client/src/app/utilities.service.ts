import { Injectable } from "@angular/core";

import { IPagination } from "./interfaces/ipagination";

@Injectable()
export class UtilitiesService {

    SERVER_URL = "http://localhost:32000/";
    PAGINATION_OFFSET = 3;
    TOP_IMAGES = 5;
    DEFAULT_B = 1;
    DEFAULT_K = 20;
    DEFAULT_TOP = 100;
    SELECT_ALL_TEXT = "Select all on page";
    DESELECT_ALL_TEXT = "Deselect all on page";

    constructor() { }

    getImageID(imageString: String): string {
        const split = imageString.split("/");
        return split[split.length - 1];
    }

    getPaginationStartEnd(pagination: IPagination): any {
        let start = pagination.currentPage - this.PAGINATION_OFFSET;

        let diff = 0;
        if (start < 1) {
            diff = Math.abs(start) + 1;
            start = 1;
        }

        let end = (start === 1
            ? pagination.currentPage + this.PAGINATION_OFFSET + diff
            : pagination.currentPage + this.PAGINATION_OFFSET);

        if (pagination.numberOfPages < end) {
            diff = end - pagination.numberOfPages;
            start -= diff;
            end = pagination.numberOfPages;

            start = (start < 1 ? 1 : start);
        }

        return {
            start,
            end
        };
    }
}
