import { VDF_AddedItemsData } from "../models";
import { VDF_Error } from './vdf-error';
import { APP } from '../variables';
import * as json from './helpers/json';
import * as _ from "lodash";
import * as fs from 'fs-extra';
import * as path from 'path';

export class VDF_AddedItemsFile {
    private fileData: VDF_AddedItemsData = undefined;

    constructor(private filepath: string) { }

    get data() {
        return this.fileData;
    }

    set data(value: VDF_AddedItemsData) {
        this.fileData = value;
    }

    get valid() {
        return this.fileData !== undefined;
    }

    get invalid() {
        return !this.valid;
    }

    read() {
        return json.read<string[]>(this.filepath, []).then((data) => {
            this.fileData = {};

            for (let i = 0; i < data.length; i++) {
                this.fileData[data[i]] = true;
            }

            return this.data;
        });
    }

    write() {
        this.fileData = _.pickBy(this.fileData, item => item !== undefined);
        let data = Object.keys(this.fileData);
        return json.write(this.filepath, data);
    }

    getItem(appId: string){
        return this.fileData[appId];
    }

    removeItem(appId: string){
        if (this.fileData[appId] !== undefined){
            this.fileData[appId] = undefined;
        }
    }

    addItem(appId: string){
        this.fileData[appId] = true;
    }
}