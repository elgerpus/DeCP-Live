import { Component, OnInit } from "@angular/core";
import { MzToastService } from "ng2-materialize";

import { SocketService } from "../socket.service";
import { UtilitiesService } from "../utilities.service";

@Component({
    selector: "app-admin",
    templateUrl: "./admin.component.html",
    styleUrls: ["./admin.component.scss"]
})
export class AdminComponent implements OnInit {

    authenticated: boolean;
    authenticating: boolean;
    saving: boolean;
    halting: boolean;
    password: string;

    constructor(
        private utilities: UtilitiesService,
        private socketService: SocketService,
        private toastService: MzToastService
    ) { }

    ngOnInit() {
        this.authenticating = false;
        this.authenticated = false;
        this.saving = false;
        this.halting = false;
        this.password = "";
    }

    onAuthenticate() {
        this.authenticating = true;
        this.socketService.adminAuthenticate(this.password).first().subscribe(
            success => {
                if (success) {
                    this.toastService.show("Authenticated!", this.utilities.TOAST_DURATION);
                }
                else {
                    this.toastService.show("Incorrect password!", this.utilities.TOAST_DURATION);
                }

                this.authenticated = success;
                this.authenticating = false;
            },
            error => {
                this.toastService.show("Unknown error!", this.utilities.TOAST_DURATION);
                console.log(error);
            });
    }

    onSave() {
        this.saving = true;
        this.socketService.adminSave(this.password).first().subscribe(
            success => {
                if (success) {
                    this.toastService.show("Saved!", this.utilities.TOAST_DURATION);
                }
                else {
                    this.toastService.show("Incorrect password!", this.utilities.TOAST_DURATION);
                }

                this.saving = false;
            },
            error => {
                this.toastService.show("Unknown error!", this.utilities.TOAST_DURATION);
                console.log(error);
            });
    }

    onHalt() {
        this.halting = true;
        this.socketService.adminHalt(this.password).first().subscribe(
            success => {
                if (success) {
                    this.toastService.show("Halted!", this.utilities.TOAST_DURATION);
                }
                else {
                    this.toastService.show("Incorrect password!", this.utilities.TOAST_DURATION);
                }

                this.halting = false;
            },
            error => {
                this.toastService.show("Unknown error!", this.utilities.TOAST_DURATION);
                console.log(error);
            });
    }
}
