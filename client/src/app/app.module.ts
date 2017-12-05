import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterializeModule } from "ng2-materialize";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterializeModule.forRoot(),
        FormsModule,
        RouterModule.forRoot([
            // {
            //     path: "",
            //     pathMatch: "full",
            //     component: AppComponent
            // }
        ])
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
