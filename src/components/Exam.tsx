import { inject, observer } from 'mobx-react';
import { parse } from 'qs';
import React from 'react';
import { Redirect } from 'react-router';

import ApplicationService from '../firebase';
import Store from '../mobx/store';

interface IExamState {
  readonly examIdNotFound: boolean;
}

@inject('store')
@observer
export default class Exam extends React.Component<{ location: Location, store?: Store }, IExamState> {
  public state: IExamState = { examIdNotFound: false };

  private readonly service: ApplicationService;

  constructor(props: any) {
    super(props);
    this.service = new ApplicationService();
  }

  public componentDidMount() {
    const { search } = this.props.location;
    const store = this.props.store!;

    const parsed = parse(search, { ignoreQueryPrefix: true });
    if (parsed.examId != null) {
      this.service.getExam(parsed.examId)
        .then(exam => {
          if (exam != null) {
            store.setCurrentExam(exam);
          } else {
            this.setState({ examIdNotFound: true });
          }
        });
      return;
    }

    this.service.createExam().then(exam => this.props.store!.setCurrentExam(exam));
  }

  public render() {
    if (this.state.examIdNotFound) {
      return <Redirect to="/exam" />;
    }

    const exam = this.props.store!.currentExam;
    if (exam == null) {
      return <div>Загрузка ...</div>;
    }

    return (
      <div>
        {this.props.location.pathname} <br />
        {exam.id} <br />
        {exam.questions.join(', ')}
      </div>
    );
  }
}
