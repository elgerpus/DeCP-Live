import { OnInit, OnDestroy, Component } from "@angular/core";
import { MzToastService } from "ng2-materialize";

import { SocketService } from "./socket.service";
import { UtilitiesService } from "./utilities.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit, OnDestroy {

    constructor(
        public utilities: UtilitiesService,
        private socketService: SocketService,
        private toastService: MzToastService
    ) { }

    ngOnInit() {
        this.socketService.newResult().subscribe(
            success => {
                this.toastService.show("New result available!", this.utilities.TOAST_DURATION);
            }, error => {
                console.log(error);
                this.toastService.show("Unknown error!", this.utilities.TOAST_DURATION);
            });
    }

    ngOnDestroy() {
        this.socketService.removeListener("newResult");
    }
}
