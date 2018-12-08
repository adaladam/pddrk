import copy from 'clipboard-copy';
import every from 'lodash/every';
import padStart from 'lodash/padStart';
import { inject, observer } from 'mobx-react';
import { parse } from 'qs';
import React from 'react';
import { Redirect } from 'react-router';

import ApplicationService from '../firebase';
import Store from '../mobx/store';
import { IExamParticipant } from '../models';
import styles from './Exam.module.scss';
import Menu from './Menu';
import Question from './Question';
import questions from './questions.json';

interface IExamState {
  readonly loading: boolean;
  readonly examIdNotFound: boolean;
  readonly showParticipantStats: boolean;
  readonly message?: string;
  readonly timeLeftSecs?: number;
}

@inject('store')
@observer
export default class Exam extends React.Component<{ location: Location, store?: Store }, IExamState> {
  public state: IExamState = { examIdNotFound: false, loading: true, showParticipantStats: false };

  private readonly service: ApplicationService;
  private timer: any = null;
  private stats: { answered: number, correct: number } = { answered: 0, correct: 0 };

  constructor(props: any) {
    super(props);

    this.onReady = this.onReady.bind(this);
    this.onLinkCopyClick = this.onLinkCopyClick.bind(this);
    this.setInterval = this.setInterval.bind(this);
    this.questionHandler = this.questionHandler.bind(this);

    this.service = new ApplicationService();
  }

  public componentDidMount() {
    const { search } = this.props.location;
    const store = this.props.store!;

    if (store.currentExam != null) {
      store.unsetCurrentExam();
    }

    const parsed = parse(search, { ignoreQueryPrefix: true });
    if (parsed.examId != null) {
      this.service.getExam(parsed.examId, store.onExamSnapshot())
        .then(exam => {
          this.setState({ loading: false });

          if (exam != null && exam.state !== 'created') {
            this.setState({ message: exam.state === 'started' ? 'Экзамен уже начался' : 'Экзамен закончен' });
          } else if (exam == null) {
            this.setState({ examIdNotFound: true });
          }
        });
      return;
    }

    this.service.createExam(store.onExamSnapshot()).then(() => this.setState({ loading: false }));
  }

  public componentDidUpdate(prevProps: { store?: Store }) {
    const store = this.props.store!;

    if (store.currentExam == null) {
      return;
    }

    if (store.currentExam.state === 'started' && this.timer == null) {
      this.setState({ timeLeftSecs: 40 * 60 }, this.setInterval);
    }

    const finished = every(store.currentExam.participants, p => p.stats && p.stats.answered === 40);
    if ((this.state.timeLeftSecs === 0 || finished) && store.currentExam.state !== 'ended') {
      clearInterval(this.timer);
      this.service.endExam(store.currentExam.id);
    }
  }

  public render() {
    if (this.state.examIdNotFound) {
      return <Redirect to="/exam" />;
    }

    if (this.state.message != null) {
      return <div>{this.state.message}</div>;
    }

    const exam = this.props.store!.currentExam;
    if (exam == null || this.state.loading) {
      return <div>Загрузка ...</div>;
    }

    if (exam.state === 'created') {
      return (
        <div className={styles.main}>
          <Menu testMode={true} />
          <div className={`${styles.prepare} ${styles.content}`}>
            <h3>Режим экзамена</h3>
            <a href="" onClick={this.onLinkCopyClick}>Скопировать ссылку на экзамен</a>
            <ul>
              {
                exam.participants.map((p, i) => (
                  <li key={p.id}>
                    Участник {i + 1} &nbsp;
                    {this.service.getUserId() === p.id ? `(Вы) ` : null}
                    {this.isReady(p.id) ? '✔️' : null}
                  </li>
                ))}
            </ul>
            <button onClick={this.onReady}>Готов(а)</button>
          </div>
        </div>
      );
    }

    const examQuestions = questions.filter(q => exam.questions.indexOf(q.id) !== -1);
    return (
      <div className={styles.main}>
        <Menu testMode={true} />
        <div className={styles.content}>
          {examQuestions.map(question => <Question
            key={question.id} {...question}
            testMode={true}
            hideAnswer
            examHandler={this.questionHandler}
          />)}
        </div>
        {this.timeLeft()}
        {this.summary()}
      </div>
    );
  }

  private onReady(): void {
    const store = this.props.store!;
    if (store.currentExam == null) {
      return;
    }

    const participant = this.getCurrentParticipant();
    if (participant == null) {
      return;
    }

    this.service.updateExamParticipant(store.currentExam.id, { ...participant, isReady: true });
  }

  private isReady(userId: string): boolean {
    const store = this.props.store!;
    if (store.currentExam == null) {
      return false;
    }

    const participant = store.currentExam.participants.find(p => p.id === userId);
    if (participant == null) {
      return false;
    }

    return participant.isReady || false;
  }

  private onLinkCopyClick(ev: React.MouseEvent) {
    ev.preventDefault();

    const store = this.props.store!;
    if (store.currentExam == null) {
      return;
    }

    const { protocol, host, pathname } = document.location!;
    copy(`${protocol}//${host}${pathname}?examId=${store.currentExam.id}`);
  }

  private timeLeft() {
    const store = this.props.store!;
    if (store.currentExam == null) {
      return null;
    }

    if (store.currentExam.state === 'ended') {
      return null;
    }

    if (this.state.timeLeftSecs == null) {
      return null;
    }

    let text = '00:00';
    if (this.state.timeLeftSecs > 0) {
      const secs = this.state.timeLeftSecs % 60;
      const mins = (this.state.timeLeftSecs - secs) / 60;
      text = `${padStart(mins.toString(), 2, '0')}:${padStart(secs.toString(), 2, '0')}`;
    }

    let stats: JSX.Element | null = null;
    let participantStats: JSX.Element | null = null;
    let button: JSX.Element | null = null;

    const participant = this.getCurrentParticipant();
    if (participant != null && participant.stats != null) {
      stats = (
        <p>
          <span className={styles.total}>{participant.stats.answered}</span>
          /
          <span className={styles.correct}>{participant.stats.correct}</span>
        </p>
      );
    }

    if (this.state.showParticipantStats && participant != null) {
      participantStats = (
        <React.Fragment>
          <h3>Другие участники</h3>
          <ul>
            {store.currentExam.participants.map((p, i) => {
              if (p.id === participant.id) {
                return null;
              }

              return (
                <li key={i}>
                  Участник {i + 1} &nbsp;&nbsp;
                <span className={styles.total}>{p.stats ? p.stats.answered : 0}</span>
                  /
                <span className={styles.correct}>{p.stats ? p.stats.correct : 0}</span>
                </li>);
            })}
          </ul>
        </React.Fragment>
      );
    }

    if (store.currentExam.participants.length > 1) {
      button = (
        <button onClick={() => this.setState({ showParticipantStats: !this.state.showParticipantStats })}>
          <span>{this.state.showParticipantStats ? '<<' : '>>'}</span>
        </button>
      );
    }

    return (
      <div className={`${styles['time-left']} ${this.state.showParticipantStats ? styles['participant-stats'] : ''}`}>
        {text}
        {stats}
        {participantStats}
        {button}
      </div>
    );
  }

  private summary() {
    const store = this.props.store!;
    if (store.currentExam == null) {
      return null;
    }

    if (store.currentExam.state !== 'ended') {
      return null;
    }
    const participant = this.getCurrentParticipant();
    if (participant == null) {
      return null;
    }

    if (participant.stats == null) {
      return (
        <div className={styles.summary}>
          <p><strong>Экзамен завершен!</strong></p>
          <p style={{ color: 'red' }}>ВЫ НЕ ОТВЕТИЛИ НИ НА ОДИН ВОПРОС</p>
        </div>
      );
    }

    let participantStats: JSX.Element | null = null;
    if (store.currentExam.participants.length > 1) {
      participantStats = (
        <React.Fragment>
          <h3>Другие участники</h3>
          <ul>
            {store.currentExam.participants.map((p, i) => {
              if (p.id === participant.id) {
                return null;
              }

              return (
                <li key={i}>
                  Участник {i + 1} &nbsp;&nbsp;
                <span className={styles.total}>{p.stats ? p.stats.answered : 0}</span>
                  /
                <span className={styles.correct}>{p.stats ? p.stats.correct : 0}</span>
                </li>);
            })}
          </ul>
        </React.Fragment>
      );
    }

    return (
      <div className={styles.summary}>
        <p><strong>Экзамен завершен!</strong></p>
        <p>Всего ответили на вопросов: {participant.stats.answered}</p>
        <p>Из них правильно: {participant.stats.correct}</p>
        {participantStats}
      </div>
    );
  }

  private setInterval() {
    if (this.timer != null) {
      return;
    }

    this.timer = setInterval(() => this.setState({ timeLeftSecs: (this.state.timeLeftSecs || 1) - 1 }), 1000);
  }

  private questionHandler(correct: boolean) {
    const store = this.props.store!;
    if (store.currentExam == null) {
      return;
    }

    const participant = this.getCurrentParticipant();
    if (participant == null) {
      return;
    }

    if (store.currentExam == null || store.currentExam.state === 'ended') {
      return;
    }

    this.stats.answered++;
    if (correct) {
      this.stats.correct++;
    }

    this.service.updateExamParticipant(store.currentExam.id, { ...participant, stats: this.stats });
  }

  private getCurrentParticipant(): IExamParticipant | null {
    const store = this.props.store!;
    if (store.currentExam == null) {
      return null;
    }

    const userId = this.service.getUserId();
    const index = store.currentExam.participants.findIndex(p => p.id === userId);
    if (index === -1) {
      return null;
    }

    const exam = store.currentExam;
    const participant = exam.participants[index];

    return participant;
  }
}
