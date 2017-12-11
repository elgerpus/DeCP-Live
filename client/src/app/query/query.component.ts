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
    b: number;
    k: number;
    images: IImage[][];
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
        this.socketService.sendQueryImages(this.selected, this.b, this.k).first().subscribe(
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
        this.socketService.removeListener("getImages");
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
                this.images = [];
                this.pageNumbers = [];

                const startEnd = this.utilities.getPaginationStartEnd(this.pagination);

                for (let i = startEnd.start, j = 0; i <= startEnd.end; i++ , j++) {
                    this.pageNumbers[j] = startEnd.start + j;
                }

                for (let i = 0; i < 4; i++) {
                    this.images[i] = [];

                    for (let j = 0; j < 4; j++) {
                        const item = envelope.items[(i * 4) + j];

                        if (item === undefined) {
                            break;
                        }

                        this.images[i][j] = item;
                    }
                }

                this.loaded = true;
            },
            error => {
                this.toastService.show("Unknown error!", 4000);
                console.log(error);
            }
        );
    }
}
