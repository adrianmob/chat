import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { OneSignal } from '@ionic-native/onesignal';


/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  friend: any = {};
  meId:any;
  chatId:any;
  contenido: any='';
  chats:any[] = [];
  chatsNoLeidos: any[]= [];
  chatToEliminar: any[] = [];
  suscribir;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private afDb: AngularFireDatabase,
    private oneSignal: OneSignal) {

    this.friend = this.navParams.data;
    let tabs = document.getElementsByClassName('tabbar');
    tabs[0].classList.add('desaparecer');
    this.meId = this.afAuth.auth.currentUser.uid;
    let friendId = this.friend['key'];
    let chatArray = [];
    chatArray.push(this.meId);
    chatArray.push(friendId);
    chatArray.sort();
    this.chatId = chatArray.join('||');
    this.mensajes();
  }

  ionViewWillLeave(){
    let tabs = document.getElementsByClassName('tabbar');
    tabs[0].classList.remove('desaparecer');
  }

  ionViewDidEnter() {
    this.scroll();
  }

  scroll(){
    let cajaMensajes = document.getElementById('cajaMensajes');
    cajaMensajes.scrollTop = cajaMensajes.scrollHeight;
  }

  mensajes(){
    this.suscribir = this.afDb.list('chats/'+this.chatId).snapshotChanges().subscribe(data=>{
      this.chats = [];
      data.map(data=>{
        let mensaje = {...data.payload.val()};
        if(mensaje['remitente'] != this.meId && !mensaje['leido']) {
          this.chatsNoLeidos.push(data.key);
        }
        else{
          let horaActual = Date.now();
          let horaLeido = mensaje['leidoAt'];
          let horaTrans = horaActual - horaLeido;
          horaTrans = horaTrans / 1000;
          horaTrans = horaTrans / 900;
          if(horaTrans >= 1){
            this.chatToEliminar.push(data.key);
          }
        }
        if(mensaje['remitente'] == this.meId){
          mensaje['class'] = 'me';
        }
        else{
          mensaje['class'] = 'friend';
        }
        mensaje['contenido'] = atob(mensaje['contenido']);
        this.chats.push(mensaje);
      });
      
      if( this.chatsNoLeidos.length != 0 ){
        this.mensajesLeidos();
      }
      else{
        if( this.chatToEliminar.length != 0 ){
          this.mensajesToElim();
        }else{

          this.scroll();
        }
      }
      console.log(this.chats);
    });
  }

  mensajesLeidos(){
    this.suscribir.unsubscribe();
    this.chatsNoLeidos.map(key=>{
      this.afDb.database.ref('chats/'+this.chatId+'/'+key).update({
        leido : true,
        leidoAt : Date.now() 
      });
    });
    this.chatsNoLeidos = [];
    this.mensajes();
  }

  mensajesToElim(){
    this.suscribir.unsubscribe();
    this.chatToEliminar.map(key=>{
      this.afDb.database.ref('chats/'+this.chatId+'/'+key).remove();
    });
    this.chatToEliminar = [];
    this.mensajes();
  }

  enviar(){
    if (this.contenido != ''){
      this.contenido = btoa(this.contenido);
      let mensaje = {
        type : 'text',
        contenido: this.contenido,
        remitente: this.meId,
        destinatario: this.friend['key'],
        creado: Date.now(),
        leido: false
      }
  
      this.afDb.database.ref('chats/'+this.chatId).push(mensaje);
  
      this.contenido = '';
      let cajaMensajes = document.getElementById('cajaMensajes');
      cajaMensajes.focus();

      this.notificacion();

    }

  }

  foco(){
    let cajaMensajes = document.getElementById('cajaMensajes');
    cajaMensajes.classList.add('foco');
  }

  blur(){
    let cajaMensajes = document.getElementById('cajaMensajes');
    cajaMensajes.classList.remove('foco');
  }

  notificacion(){
    this.afDb.database.ref('users/'+this.friend['key']).once('value',data=>{
      let friend = data.val();

      var notificationObj = { 
        app_id: "11f9a9bc-acf6-4ba6-930c-a68c9175588c",
        include_player_ids: [friend['userId']],
        data: {"foo": "bar"},
        headings: {"en": "Sako"},
        contents: {"en": "Tienes un nuevo mensaje"}
      };
    
      this.oneSignal.postNotification(notificationObj).then(data=>{
        console.log('funciono');
        console.log(JSON.stringify(data));
      }).catch(error=>{
        console.log('error');
        console.log(JSON.stringify(error));
      });
  
    });
    
  }


}
