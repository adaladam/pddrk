import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { IUser } from '../models';

// tslint:disable:object-literal-sort-keys

export default class ApplicationService {
  private static initialized: boolean = false;

  private static initialize() {
    if (ApplicationService.initialized) {
      return;
    }

    firebase.initializeApp({
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    });

    ApplicationService.initialized = true;
  }

  constructor() {
    ApplicationService.initialize();
  }

  public async signIn(): Promise<IUser> {
    const db = this.db();

    return firebase
      .auth()
      .signInAnonymously()
      .then(auth => {
        if (auth.user == null) {
          throw new Error(`Firebase returned auth user null. Could not log in user`);
        }

        return db.collection('users').doc(auth.user.uid).get();
      })
      .then(snapshot => {
        if (!snapshot.exists) {
          const user: IUser = {
            current_question_id: null,
            mistakens: [],
          };
          return db.collection('users')
            .doc(snapshot.id)
            .set(user)
            .then(() => user);
        }

        const data = snapshot.data();
        if (data == null) {
          throw new Error(`Firebase user snapshot was unexpectedly to return undefined`);
        }

        return {
          current_question_id: data.current_question_id,
          mistakens: data.mistakens,
        };
      });
  }

  public async updateUser(user: IUser): Promise<void> {
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
      return;
    }

    const db = this.db();
    return db.collection('users').doc(currentUser.uid).update(user);
  }

  private db() {
    const db = firebase.firestore();
    db.settings({ timestampsInSnapshots: true });
    return db;
  }
}
