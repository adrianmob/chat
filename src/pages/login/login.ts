import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { AngularFireAuth } from '@angular/fire/auth';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  email:any = '';
  pass:any = '';

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    public alertCtrl : AlertController, 
    public toastCtrl: ToastController ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  entrar(){
    this.afAuth.auth.signInWithEmailAndPassword(this.email, this.pass).catch(error=>{
      this.presentAlert(error.code, error.message);
    });
    
  }

  presentAlert(codigo, mensaje) {
    let toast = this.toastCtrl.create({
      message: 'El campo de email tiene que ser un texto valido, verifiquelo',
      position: 'bottom',
      duration: 2500,
      dismissOnPageChange: true
    });
  
     if(codigo == "auth/user-not-found"){
    let alert = this.alertCtrl.create({
      title: 'El usuario no existe',
      subTitle: 'No hay registro de usuario correspondiente a este identificador. El usuario puede haber sido eliminado.',
      buttons: ['Ok']
    });
    alert.present();
  }
  
  if(codigo == "auth/wrong-password"){
    let alert = this.alertCtrl.create({
      title: 'Contraseña incorrecta',
      subTitle: 'La contraseña es invalida o el usuario no tiene contraseña.',
      buttons: ['Ok']
    });
    alert.present();
  }
  
  if(codigo == "auth/argument-error"){
    if(mensaje == 'signInWithEmailAndPassword failed: First argument "email" must be a valid string.'){
      toast.present();
      
  }
  else{
      toast = this.toastCtrl.create({
      message: 'El campo de contraseña tiene que ser un texto valido, verifiquelo',
      position: 'bottom',
      duration: 2500,
      dismissOnPageChange: true
    });
    toast.present();
  
  }
  }
  
  if(codigo == "auth/invalid-email"){
      toast = this.toastCtrl.create({
      message: 'El campo de email tiene un formato incorrecto',
      position: 'bottom',
      duration: 2500,
      dismissOnPageChange: true
    });
    toast.present();
  
  }
  
  
  }

}
