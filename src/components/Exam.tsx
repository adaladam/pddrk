import { inject, observer } from 'mobx-react';
import { parse } from 'qs';
import React from 'react';
import { Redirect } from 'react-router';

import ApplicationService from '../firebase';
import Store from '../mobx/store';

interface IExamState {
  readonly examIdNotFound: boolean;
  readonly message?: string;
}

@inject('store')
@observer
export default class Exam extends React.Component<{ location: Location, store?: Store }, IExamState> {
  public state: IExamState = { examIdNotFound: false };

  private readonly service: ApplicationService;

  constructor(props: any) {
    super(props);

    this.onReady = this.onReady.bind(this);

    this.service = new ApplicationService();
  }

  public componentDidMount() {
    const { search } = this.props.location;
    const store = this.props.store!;

    const parsed = parse(search, { ignoreQueryPrefix: true });
    if (parsed.examId != null) {
      this.service.getExam(parsed.examId, store.onExamSnapshot())
        .then(exam => {
          if (exam != null && exam.state !== 'created') {
            this.setState({ message: exam.state === 'started' ? 'Экзамен уже начался' : 'Экзамен закончен' });
          } else if (exam == null) {
            this.setState({ examIdNotFound: true });
          }
        });
      return;
    }

    this.service.createExam(store.onExamSnapshot());
  }

  public render() {
    if (this.state.examIdNotFound) {
      return <Redirect to="/exam" />;
    }

    if (this.state.message != null) {
      return <div>{this.state.message}</div>;
    }

    const exam = this.props.store!.currentExam;
    if (exam == null) {
      return <div>Загрузка ...</div>;
    }

    return (
      <div>
        {exam.state} <br />
        {exam.id} <br />
        {`http://localhost:3000/exam?examId=${exam.id}`} <br />
        {exam.questions.join(', ')} <br />
        <ul>
          {
            exam.participants
              .map((p, i) => (
                <li key={p.id}>
                  Участник {i + 1} {this.service.getUserId() === p.id ? `(Вы)` : null} {this.isReady(p.id) ? '+' : null}
                </li>
              ))}
        </ul>
        <button onClick={this.onReady}>Готов(а)</button>
      </div>
    );
  }

  private onReady(): void {
    const store = this.props.store!;
    if (store.currentExam == null) {
      return;
    }

    const userId = this.service.getUserId();
    const index = store.currentExam.participants.findIndex(p => p.id === userId);
    if (index === -1) {
      return;
    }

    const exam = store.currentExam;
    const participant = exam.participants[index];
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
}
