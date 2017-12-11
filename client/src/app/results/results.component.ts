import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MzToastService } from "ng2-materialize";

import { UtilitiesService } from "./../utilities.service";
import { SocketService } from "../socket.service";

import { IResult } from "./../interfaces/iresult";
import { IPagination } from "./../interfaces/ipagination";

@Component({
    selector: "app-results",
    templateUrl: "./results.component.html",
    styleUrls: ["./results.component.scss"]
})
export class ResultsComponent implements OnInit {

    results: IResult[];
    pageNumbers: number[];
    pagination: IPagination;
    loaded = false;

    constructor(
        private router: Router,
        private toastService: MzToastService,
        private utilities: UtilitiesService,
        private socketService: SocketService
    ) { }

    ngOnInit() {
        this.getResults(1);

        // this.pagination = {
        //     currentPage: 1,
        //     numberOfPages: 4
        // };

        // for (let i = 0; i < this.pagination.numberOfPages; i++) {
        //     this.pages[i] = [];
        // }

        // this.pages[0].push({ ID: "1", status: "Queued", timestamp: "-", images: 7493 });
        // this.pages[0].push({ ID: "2", status: "Running", timestamp: "Monday, 04-Dec-17 15:35:54 UTC", images: 53729 });
        // this.pages[0].push({ ID: "3", status: "Done", timestamp: "Monday, 04-Dec-17 14:26:05", images: 36485 });
    }

    onResultClick(resultID: string) {
        this.router.navigate(["results", resultID]);
    }

    onPage(pagination: IPagination) {
        this.pagination = pagination;
        this.socketService.removeListener("getResults");
        this.getResults(this.pagination.currentPage);
    }

    getResults(page: number) {
        this.loaded = false;
        this.socketService.getResults(page).first().subscribe(
            envelope => {
                this.pagination = envelope.pagination;
                this.pageNumbers = [];

                const startEnd = this.utilities.getPaginationStartEnd(this.pagination);

                for (let i = startEnd.start, j = 0; i <= startEnd.end; i++ , j++) {
                    this.pageNumbers[j] = startEnd.start + j;
                }

                this.results = envelope.items;

                this.loaded = true;
            },
            error => {
                this.toastService.show("Unknown error!", 4000);
                console.log(error);
            }
        );
    }
}
