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

    selected: Set<string>;
    b: number;
    k: number;
    top: number;
    images: IImage[][];
    pageNumbers: number[];
    pagination: IPagination;
    selectAllText: string;
    selectAll: boolean;
    loaded = false;

    constructor(
        public utilities: UtilitiesService,
        private socketService: SocketService,
        private toastService: MzToastService,
        public domSanitizer: DomSanitizer
    ) { }

    ngOnInit() {
        this.images = [];
        this.selected = new Set<string>();
        this.resetValues();

        this.getImages(1);
    }

    onImage(imageID: string) {
        if (this.selected.has(imageID)) {
            this.selected.delete(imageID);
        }
        else {
            this.selected.add(imageID);
        }

        this.assignSelectAll();
    }

    onSelectAll() {
        for (let i = 0; i < this.images.length; i++) {
            for (let j = 0; j < this.images[i].length; j++) {
                if (this.selectAll) {
                    this.selected.add(this.images[i][j].imageID);
                }
                else {
                    this.selected.delete(this.images[i][j].imageID);
                }
            }
        }

        this.assignSelectAll();
    }

    onClear() {
        this.selected.clear();
        this.assignSelectAll();
    }

    assignSelectAll() {
        for (let i = 0; i < this.images.length; i++) {
            for (let j = 0; j < this.images[i].length; j++) {
                if (!this.selected.has(this.images[i][j].imageID)) {
                    this.selectAllText = this.utilities.SELECT_ALL_TEXT;
                    this.selectAll = true;
                    return;
                }
            }
        }

        this.selectAllText = this.utilities.DESELECT_ALL_TEXT;
        this.selectAll = false;
    }

    onSubmit() {
        this.socketService.sendQueryImages(Array.from(this.selected), this.b, this.k, this.top).first().subscribe(
            success => {
                if (success) {
                    this.toastService.show("Query succeeded!", 4000);
                    this.selected.clear();
                    this.resetValues();
                    this.assignSelectAll();
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
        return this.selected.has(imageID);
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

                this.assignSelectAll();
            },
            error => {
                this.toastService.show("Unknown error!", 4000);
                console.log(error);
            }
        );
    }

    resetValues() {
        this.b = this.utilities.DEFAULT_B;
        this.k = this.utilities.DEFAULT_K;
        this.top = this.utilities.DEFAULT_TOP;
    }
}
