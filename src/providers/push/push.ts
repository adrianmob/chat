import { Injectable } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal';

/*
  Generated class for the PushProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PushProvider {

  constructor(private oneSignal: OneSignal) {
    console.log('Hello PushProvider Provider');
  }

  iniciar(){
    this.oneSignal.startInit('11f9a9bc-acf6-4ba6-930c-a68c9175588c', '44089823077');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

    this.oneSignal.handleNotificationReceived().subscribe(() => {
      // do something when notification is received
    });

    this.oneSignal.handleNotificationOpened().subscribe(() => {
      // do something when a notification is opened
    });

    this.oneSignal.endInit();
  }

  async obtenerId(){
    let claves = await this.oneSignal.getIds();
    return claves;
  }

}
