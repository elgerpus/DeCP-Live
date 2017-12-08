import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { IResult } from "./../interfaces/iresult";
import { IPagination } from "./../interfaces/ipagination";

@Component({
    selector: "app-results",
    templateUrl: "./results.component.html",
    styleUrls: ["./results.component.scss"]
})
export class ResultsComponent implements OnInit {

    pages: IResult[][] = [];
    pagination: IPagination;

    constructor(private router: Router) { }

    ngOnInit() {
        this.pagination = {
            currentPage: 1,
            numberOfPages: 4
        };

        for (let i = 0; i < this.pagination.numberOfPages; i++) {
            this.pages[i] = [];
        }

        this.pages[0].push({ ID: "1", status: "Queued", timestamp: "-", images: 7493 });
        this.pages[0].push({ ID: "2", status: "Running", timestamp: "Monday, 04-Dec-17 15:35:54 UTC", images: 53729 });
        this.pages[0].push({ ID: "3", status: "Done", timestamp: "Monday, 04-Dec-17 14:26:05", images: 36485 });
    }

    onResultClick(resultID: string) {
        this.router.navigate(["results", resultID]);
    }

    onPage(pagination: IPagination) {
        this.pagination = pagination;
    }
}
