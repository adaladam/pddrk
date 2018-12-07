import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import every from 'lodash/every';
import random from 'lodash/random';
import { v4 } from 'uuid';

import { IExam, IExamParticipant, IUser } from '../models';

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
            examId: null,
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
          examId: data.examId || null,
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

  public async createExam(onSnapshot?: (ex: IExam) => void): Promise<IExam> {
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
      throw new Error('Could not create exam without authenticated user');
    }

    const ids: number[] = [];
    for (let i = 0; i < 40; i++) {
      const min = i * 25 + 1;
      let max = (i + 1) * 25;
      if (i === 39) {
        max = 1019;
      }

      ids.push(random(min, max));
    }

    const exam: IExam = {
      create_date: new Date(),
      id: v4(),
      participants: [{ id: currentUser.uid, isMaster: true }],
      questions: ids,
      state: 'created',
    };

    const db = this.db();
    await db.collection('exams').doc(exam.id).set(exam);

    if (onSnapshot != null) {
      db.collection('exams').doc(exam.id).onSnapshot(ex => {
        if (!ex.exists || ex.data() == null) {
          return;
        }

        const rExam = ex.data() as IExam;
        onSnapshot(rExam);

        if (rExam.state === 'created' && every(rExam.participants, p => p.isReady)) {
          this.startExam(rExam.id);
        }
      });
    }

    return exam;
  }

  public async getExam(id: string, onSnapshot?: (ex: IExam) => void): Promise<IExam | null> {
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
      throw new Error('Could not get exam without authenticated user');
    }

    const db = this.db();
    const data = await db.collection('exams')
      .doc(id)
      .get()
      .then(snapshot => snapshot.exists ? snapshot.data() : null);

    if (data == null) {
      return null;
    }

    const exam = data as IExam;
    if (onSnapshot != null) {
      db.collection('exams').doc(exam.id).onSnapshot(ex => {
        if (ex.exists && ex.data() != null) {
          onSnapshot(ex.data() as IExam);
        }
      });
    }

    if (exam.participants.map(p => p.id).indexOf(currentUser.uid) === -1) {
      const newParticipant = { id: currentUser.uid, isMaster: false };
      await db.collection('exams').doc(exam.id)
        .update({ participants: firebase.firestore.FieldValue.arrayUnion(newParticipant) });

      return { ...exam, participants: [...exam.participants, newParticipant] };
    }

    return exam;
  }

  public async startExam(examId: string): Promise<void> {
    const db = this.db();
    const docRef = db.collection('exams').doc(examId);
    await docRef.update({ state: 'started', start_date: new Date() });
  }

  public async endExam(examId: string): Promise<void> {
    const db = this.db();
    const docRef = db.collection('exams').doc(examId);
    await docRef.update({ state: 'ended', end_date: new Date() });
  }

  public async updateExamParticipant(
    examId: string,
    participant: IExamParticipant): Promise<ReadonlyArray<IExamParticipant>> {

    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
      throw new Error('Could not get exam without authenticated user');
    }

    const db = this.db();
    const docRef = db.collection('exams').doc(examId);
    const examSnapshot = await docRef.get();
    if (!examSnapshot.exists || examSnapshot.data() == null) {
      throw new Error(`Could not find exam by id: ${examId}`);
    }

    const exam = examSnapshot.data() as IExam;
    const index = exam.participants.findIndex(p => p.id === participant.id);
    if (index === -1) {
      throw new Error(`Could not find user in exam id: ${examId}`);
    }

    const participants = [...exam.participants];
    participants.splice(index, 1, participant);

    await docRef.update({ participants });
    return participants;
  }

  public getUserId(): string | null {
    const user = firebase.auth().currentUser;
    if (user == null) {
      return null;
    }

    return user.uid;
  }

  private db() {
    const db = firebase.firestore();
    db.settings({ timestampsInSnapshots: true });
    return db;
  }
}
