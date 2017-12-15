import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MzToastService } from "ng2-materialize";
import * as moment from "moment";

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
        this.socketService.getBatchResults(page).first().subscribe(
            envelope => {
                this.pagination = envelope.pagination;
                this.pageNumbers = [];

                const startEnd = this.utilities.getPaginationStartEnd(this.pagination);

                for (let i = startEnd.start, j = 0; i <= startEnd.end; i++ , j++) {
                    this.pageNumbers[j] = startEnd.start + j;
                }

                this.results = envelope.items;

                for (let i = 0; i < this.results.length; i++) {
                    const time = parseInt(this.results[i].batchID, 10);
                    const date = moment(time);
                    if (date.isValid()) {
                        this.results[i].timestamp = date.format("YYYY-MM-DD HH:mm:ss");
                    }
                    else {
                        this.results[i].timestamp = "Invalid date";
                    }
                }

                this.loaded = true;
            },
            error => {
                this.toastService.show("Unknown error!", this.utilities.TOAST_DURATION);
                console.log(error);
            }
        );
    }
}
