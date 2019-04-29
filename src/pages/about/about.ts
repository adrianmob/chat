import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  fotos = [];
  name:any;

  constructor(public navCtrl: NavController,
    private afAuth: AngularFireAuth,
    private afDb: AngularFireDatabase,
    public toastCtrl: ToastController) {

      this.mostrarFotos();
      this.nombre();
  }

  async nombre(){
    let id = this.afAuth.auth.currentUser.uid;
    let query = await this.afDb.database.ref('users/'+id).once('value');
    let user = query.val();
    this.name = user['nombre']
  }

  async mostrarFotos(){
    this.fotos = [];
    let query = await this.afDb.database.ref('fotos').once('value');
    query.forEach(data=>{
      this.fotos.push({key: data.key, ...data.val()});
    });

    console.log(this.fotos);

  }

  salir(){
    this.afAuth.auth.signOut();
  }

  seleccionar(id, foto){
    let UserId = this.afAuth.auth.currentUser.uid;
    this.deseleccionar();
    this.afDb.database.ref('fotos/'+id).update({
      ocupado: true
    });
    this.afDb.database.ref('users/'+UserId).update({
      fotoId: id,
      foto: foto
    });

    this.mostrarFotos();
    this.toast('Foto cambiada')

  }

  async deseleccionar(){
    let id = this.afAuth.auth.currentUser.uid;
    let query = await this.afDb.database.ref('users/'+id).once('value');
    let user = query.val();
    if ( user.fotoId ){
      this.afDb.database.ref('fotos/'+user.fotoId).update({
        ocupado: false
      });
    }
  }

  cambiarName(){
    let UserId = this.afAuth.auth.currentUser.uid;
    this.afDb.database.ref('users/'+UserId).update({
      nombre: this.name
    });
    this.toast('Nombre cambiado')
  }

  toast(data){
    let toast = this.toastCtrl.create({
      duration: 3000,
      message: data,
      position: 'bottom'
    });
    toast.present();
  }
  


}
