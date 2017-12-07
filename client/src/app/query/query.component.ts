import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { MzToastService } from "ng2-materialize";

import { SocketService } from "../socket.service";
import { UtilitiesService } from "../utilities.service";

import { IPagination } from "./../interfaces/ipagination";
import { IImage } from "../interfaces/iimage";

@Component({
    selector: "app-query",
    templateUrl: "./query.component.html",
    styleUrls: ["./query.component.scss"]
})
export class QueryComponent implements OnInit {

    selected: string[] = [];
    images: IImage[];
    pageNumbers: number[];
    pagination: IPagination;
    loaded = false;

    constructor(
        public utilities: UtilitiesService,
        private socketService: SocketService,
        private toastService: MzToastService,
        public domSanitizer: DomSanitizer
    ) { }

    ngOnInit() {

        this.getImages(1);

        // this.pages[0].push("/assets/images/long.jpeg");
        // this.pages[0].push("/assets/images/parallax1.jpg");
        // this.pages[0].push("/assets/images/parallax2.jpg");
        // this.pages[0].push("/assets/images/parallax3.jpg");
        // this.pages[0].push("/assets/images/parallax3.jpg");
        // this.pages[0].push("/assets/images/parallax3.jpg");
        // this.pages[0].push("/assets/images/parallax3.jpg");
        // this.pages[0].push("/assets/images/parallax3.jpg");
        // this.pages[0].push("/assets/images/parallax3.jpg");
        // this.pages[0].push("/assets/images/parallax3.jpg");
        // this.pages[0].push("/assets/images/parallax3.jpg");
        // this.pages[0].push("/assets/images/parallax3.jpg");
        // this.pages[0].push("/assets/images/parallax3.jpg");
        // this.pages[0].push("/assets/images/parallax3.jpg");
        // this.pages[0].push("/assets/images/parallax3.jpg");
        // this.pages[0].push("/assets/images/parallax3.jpg");

        // this.pages[1].push("/assets/images/parallax1.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
        // this.pages[1].push("/assets/images/parallax2.jpg");
    }

    onImage(imageID: string) {
        const index = this.selected.indexOf(imageID);

        if (-1 < index) {
            this.selected.splice(index, 1);
        }
        else {
            this.selected.push(imageID);
        }
    }

    onSubmit() {
        this.socketService.sendQueryImages(this.selected).first().subscribe(
            success => {
                if (success) {
                    this.toastService.show("Query succeeded!", 4000);
                }
                else {
                    this.toastService.show("Query failed!", 4000);
                }
            },
            error => {
                this.toastService.show("Unknown error!", 4000);
                console.log(error);
            }
        );
    }

    onPage(pagination: IPagination) {
        this.pagination = pagination;

        this.getImages(this.pagination.currentPage);
    }

    isSelected(imageID: string): boolean {
        return this.selected.includes(imageID);
    }

    getImages(page: number) {
        this.loaded = false;
        this.socketService.getQueryImages(page).first().subscribe(
            envelope => {
                this.pagination = envelope.pagination;
                this.pageNumbers = [];

                let start = this.pagination.currentPage - this.utilities.PAGINATION_OFFSET;

                let diff = 0;
                if (start < 1) {
                    diff = Math.abs(start) + 1;
                    start = 1;
                }

                let end = (start === 1
                    ? this.pagination.currentPage + this.utilities.PAGINATION_OFFSET + diff
                    : this.pagination.currentPage + this.utilities.PAGINATION_OFFSET);

                if (this.pagination.numberOfPages < end) {
                    diff = end - this.pagination.numberOfPages;
                    start -= diff;
                    end = this.pagination.numberOfPages;
                }

                let j = 0;
                for (let i = start; i <= end; i++) {
                    this.pageNumbers[j] = start + j;
                    j++;
                }

                this.images = envelope.items;

                this.loaded = true;
            },
            error => {
                this.toastService.show("Unknown error!", 4000);
                console.log(error);
            }
        );
    }
}
