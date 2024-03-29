import { Component, OnInit, Input } from '@angular/core';
import { IKey } from 'selenium-webdriver';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { User } from './model/user';
import { Report } from './model/report';

import { LedgerHelper } from '../helper/ledgerhelper';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material';
import { Injectable } from '@angular/core';



@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})

    @Injectable({
        providedIn: 'root'
    })

export class LayoutComponent implements OnInit {
    constructor(private ledgerHelper: LedgerHelper, private http: HttpClient, public snackBar: MatSnackBar) {
    }
    key: IKey;
    getDoctorURL = 'http://testnet-uk.activeledger.io:5555/transaction/users/doctors';
    getPatientURL = 'http://testnet-uk.activeledger.io:5555/transaction/patients';
    getReportURL = 'http://testnet-uk.activeledger.io:5555/transaction/reports';

    users: Array<User> = [];
    reports: Array<Report> = [];

    // message = 'Snack Bar opened.';
    actionButtonLabel = 'Close';
    action = true;
    setAutoHide = true;
    autoHide = 2000;
    horizontalPosition: MatSnackBarHorizontalPosition = 'center';
    verticalPosition: MatSnackBarVerticalPosition = 'bottom';
    addExtraClass = false;

    ngOnInit() {

        const header = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: this.ledgerHelper.token
        });

        if (this.ledgerHelper.profile_type == 'Doctor') {
            this.getAssignedPatientList(header);
        } else {
            this.getDoctorList(header);
        }

        this.getReportList(header);

    }



    getDoctorList(headers) {

        this.getDoctor(headers)
            .subscribe(data => {
                console.log(data);

                if (data.status === 200) {
                    // this.message = data.body.resp.desc;
                    // this.open();

                    for (let i = 0; i < data.body.streams.length; i++) {

                        let display: string;

                        if (data.body.streams[i].dp == null || data.body.streams[i].dp.length < 10) {

                            display = this.placeholder_img;
                        } else {
                            display = data.body.streams[i].dp;
                        }


                        const user: User = {

                            first_name: data.body.streams[i].first_name,
                            last_name: data.body.streams[i].last_name,
                            profile_type: data.body.streams[i].profile_type,
                            address: data.body.streams[i].address,
                            date_of_birth: data.body.streams[i].date_of_birth,
                            dp: display,
                            email: data.body.streams[i].email,
                            gender: data.body.streams[i].gender,
                            phone_number: data.body.streams[i].phone_number,
                            security: data.body.streams[i].security,
                            reports: data.body.streams[i].reports,
                            _id: data.body.streams[i]._id

                        };

                        this.users.push(user);

                    }

                    // this.persistenceService.set('doctorlist', JSON.stringify(this.users), { type: StorageType.SESSION });
                    // this.persistenceService.set('doctorlist', JSON.stringify(this.users));
                    this.ledgerHelper.userList = JSON.stringify(this.users);

                } else {
                    const message = ' Something went wrong! ';
                    this.showSnackBar(message);
                }

            });
    }

    getAssignedPatientList(headers) {
        this.getPatient(headers)
            .subscribe(data => {
                console.log(data);

                if (data.status === 200) {
                    // this.message = 'Patient List Fetched'//data.body.resp.desc;
                    // this.open();

                    if (data.body.streams.length <= 0) {
                        const message = 'No patients assigned';
                        this.showSnackBar(message);
                        return;
                    }

                    let index = 1;

                    for (let i = 0; i < data.body.streams.length; i++) {

                        let display: string;

                        if (data.body.streams[i].dp == null || data.body.streams[i].dp.length < 10) {

                            display = this.placeholder_img;
                        } else {
                            display = data.body.streams[i].dp;
                        }


                        for (let j = 0; j < data.body.streams[i].reports.length; j++) {

                            const report: Report = {

                                id: '' + (index++),
                                title: data.body.streams[i].reports[j].title,
                                patientName: data.body.streams[i].reports[j].patientName,
                                fileName: data.body.streams[i].reports[j].fileName,
                                description: data.body.streams[i].reports[j].description,
                                content: data.body.streams[i].reports[j].content,
                                doctors: data.body.streams[i].reports[j].doctors,

                            };

                            this.reports.push(report);
                        }

                        const user: User = {

                            first_name: data.body.streams[i].first_name,
                            last_name: data.body.streams[i].last_name,
                            profile_type: data.body.streams[i].profile_type,
                            address: data.body.streams[i].address,
                            date_of_birth: data.body.streams[i].date_of_birth,
                            dp: display,
                            email: data.body.streams[i].email,
                            gender: data.body.streams[i].gender,
                            phone_number: data.body.streams[i].phone_number,
                            security: data.body.streams[i].security,
                            _id: data.body.streams[i]._id,
                            reports: data.body.streams[i].reports,
                        };

                        this.users.push(user);

                    }

                    this.ledgerHelper.reports = JSON.stringify(this.reports);

                    // this.persistenceService.set('doctorlist', JSON.stringify(this.users), { type: StorageType.SESSION });
                    // this.persistenceService.set('doctorlist', JSON.stringify(this.users));
                    this.ledgerHelper.userList = JSON.stringify(this.users);

                } else {
                    const message = ' Something went wrong! ';
                    this.showSnackBar(message);
                }

            });
    }


    getReportList(headers) {
        this.getReport(headers).subscribe(data => {
            console.log(data);

            if (data.status === 200) {
                // this.message = 'Reports List Fetched'//data.body.resp.desc;
                // this.open();

                if (data.body.streams.length <= 0) {
                    const message = 'No reports found in ledger';
                    this.showSnackBar(message);
                    return;
                }

                for (let i = 0; i < data.body.streams[0].reports.length; i++) {

                    const report: Report = {

                        id: '' + (i + 1),
                        title: data.body.streams[0].reports[i].title,
                        patientName: data.body.streams[0].reports[i].patientName,
                        fileName: data.body.streams[0].reports[i].fileName,
                        description: data.body.streams[0].reports[i].description,
                        content: data.body.streams[0].reports[i].content,
                        doctors: data.body.streams[0].reports[i].doctors,

                    };

                    this.reports.push(report);
                }

                this.ledgerHelper.reports = JSON.stringify(this.reports);

            } else {
                const message = ' Something went wrong! ';
                this.showSnackBar(message);
            }
        });
    }

    showSnackBar(message) {
        const config = new MatSnackBarConfig();
        config.verticalPosition = this.verticalPosition;
        config.horizontalPosition = this.horizontalPosition;
        config.duration = this.setAutoHide ? this.autoHide : 0;
        this.snackBar.open(message, this.action ? this.actionButtonLabel : undefined, config);
    }

    getDoctor(header) {
        return this.http.get<any>(this.getDoctorURL, { headers: header, observe: 'response' });
    }

    getPatient(header) {
        return this.http.get<any>(this.getPatientURL, { headers: header, observe: 'response' });
    }

    getReport(header) {
        return this.http.get<any>(this.getReportURL, { headers: header, observe: 'response' });
    }

    placeholder_img = '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';

}
