import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';

import { ChatPage } from '../chat/chat';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  chats:any[]=[];
  userUid: any;

  constructor(public navCtrl: NavController,
    private afAuth: AngularFireAuth,
    private afDb: AngularFireDatabase) {
      this.iniciar();

  }

  iniciar(){
    this.userUid =  this.afAuth.auth.currentUser.uid;
      this.afDb.list('users').snapshotChanges().subscribe(data=>{
        if(data.length != 0){
          this.chats = [];
          data.map(data=>{
            if(this.userUid != data.key){
              let chatArray = [];
              chatArray.push(data['key']);
              chatArray.push(this.userUid);
              chatArray.sort();
              let chatId = chatArray.join('||');
              this.chats.push({...data.payload.val(),key : data.key, chatId: chatId, badge: 0});
            }
          });
          console.log(this.chats);
          this.mensajesNuevos();
          
        }
        else{
          console.log("nada");
        }
      }); 

    
  }

  mensajesNuevos(){
    this.chats.map(chat=>{

      this.afDb.list('chats/'+chat['chatId']).snapshotChanges().subscribe(data=>{
        let contador = 0;
        data.map(data=>{
          let chats = data.payload.val();
          if(chats['destinatario'] == this.userUid && chats['leido']==false){
            console.log(chats);
            console.log(chat['chatId']);
            contador++;
          }
        });
        this.chats.map(cha=>{
          if(chat['chatId'] == cha['chatId']){
            cha['badge'] = contador;
          }
        });
        console.log(this.chats);
      });
    });
  

  }

  goChat(friend){
    this.navCtrl.push(ChatPage,friend)
  }

}
