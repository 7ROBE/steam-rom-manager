import { Injectable } from '@angular/core';
import { UserExceptions } from "../../models";
import { LoggerService } from './logger.service';
import { BehaviorSubject } from "rxjs";
import { APP } from '../../variables';
import * as json from "../../lib/helpers/json";
import * as paths from "../../paths";
import * as schemas from '../schemas';
import * as _ from "lodash";

@Injectable()
export class UserExceptionsService {
  private variableData: BehaviorSubject<{current: UserExceptions, saved: UserExceptions}>;
  private isUnsavedData: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private validator: json.Validator = new json.Validator(schemas.userExceptions);
  private savingIsDisabled: boolean = false;

  constructor(private loggerService: LoggerService) {
    this.variableData = new BehaviorSubject({current: null, saved: {}});

    this.load();
  }

  private get lang() {
    return APP.lang.userExceptions.service;
  }

  get data() {
    return this.variableData.getValue();
  }

  get dataObservable() {
    return this.variableData.asObservable();
  }

  get isUnsaved() {
    return this.isUnsavedData.getValue()
  }

  get isUnsavedObservable() {
    return this.isUnsavedData.asObservable();
  }

  load() {
    json.read<UserExceptions>(paths.userExceptions)
      .then((data) => {
        if(data !== null) {
          const error = this.setSaved(data);
          if (error) {
            this.savingIsDisabled = true;
            this.loggerService.error(this.lang.error.loadingError, { invokeAlert: true, alertTimeout: 5000, doNotAppendToLog: true });
            this.loggerService.error(this.lang.error.corruptedExceptions__i.interpolate({
              file: paths.userExceptions,
              error
            }));
          }
        }
      })
      .catch((error) => {
        this.savingIsDisabled = true;
        this.loggerService.error(this.lang.error.loadingError, { invokeAlert: true, alertTimeout: 5000, doNotAppendToLog: true });
        this.loggerService.error(error);
      });
  }

  setSaved(data: UserExceptions) {
    if (this.validator.validate(data).isValid()) {
      this.variableData.next({current: null, saved: data||{}});
    } else {
      this.loggerService.error(this.lang.error.writingError, { invokeAlert: true, alertTimeout: 3000 });
      this.loggerService.error(this.validator.errorString);
      return `\r\n${this.validator.errorString}`;
    }
  }

  setCurrent(data: UserExceptions) {
    let saved = this.variableData.getValue().saved;
    if (!data || this.validator.validate(data).isValid()) {
      this.variableData.next({current: data, saved: this.variableData.getValue().saved});
      return null;
    }
    else {
      this.loggerService.error(this.lang.error.writingError, { invokeAlert: true, alertTimeout: 3000 });
      this.loggerService.error(this.validator.errorString);
      return `\r\n${this.validator.errorString}`;
    }
  }

  setIsUnsaved(isUnsaved: boolean) {
    this.isUnsavedData.next(isUnsaved);
  }

  saveUserExceptions() {
    let current = this.variableData.getValue().current;
    if (!this.savingIsDisabled && current) {
      json.write(paths.userExceptions, current)
        .then(()=>{

        }).catch((error) => {
          this.loggerService.error(this.lang.error.writingError, { invokeAlert: true, alertTimeout: 3000 });
          this.loggerService.error(error);
        });
      this.setIsUnsaved(false);
      this.variableData.next({current: null, saved: current});
    }
  }
}
