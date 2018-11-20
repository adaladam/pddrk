import React from 'react';

import { parse } from 'qs';
import InfiniteScroll from 'react-infinite-scroller';
import { RouteProps } from 'react-router';

import Question from './Question';
import questions from './questions.json';
import styles from './Questions.module.scss';

interface IQuestionsState {
  readonly questions: Array<{
    readonly id: number;
    readonly question: string;
    readonly picture: string;
    readonly answers: ReadonlyArray<string>;
    readonly correctAnswer: number;
  }>;
  readonly hasMore: boolean;
}

export default class Questions extends React.Component<RouteProps> {
  public state: IQuestionsState = { questions: [], hasMore: true };

  private readonly pageSize: number = 20;

  constructor(props: any) {
    super(props);

    this.loadQuestions = this.loadQuestions.bind(this);
  }

  public render() {
    const loader = <div key="loader" className={styles.loader}>Загрузка...</div>;
    return (
      <InfiniteScroll
        pageStart={0}
        loadMore={this.loadQuestions}
        hasMore={this.state.hasMore}
        loader={loader}
      >
        <div className={styles.main}>
          {this.state.questions.map((question, i) => <Question key={question.id} {...question} />)}
        </div>
      </InfiniteScroll>
    );
  }

  private loadQuestions(page: number) {
    const groupQuestions = this.getGroupQuestions();
    const stateQuestions = this.state.questions;
    stateQuestions.push(...groupQuestions.slice((page - 1) * this.pageSize, page * this.pageSize));

    const hasMore = groupQuestions.length > page * this.pageSize;
    this.setState({ questions: stateQuestions, hasMore });
  }

  private getGroupQuestions() {
    let group = 1;
    if (this.props.location != null) {
      const { search } = this.props.location;
      const parsed = parse(search, { ignoreQueryPrefix: true });
      const parsedGroup = Number.parseInt(parsed.group, 10);
      group = parsedGroup || group;
    }

    const groupSize = 200;
    return group > 4
      ? questions.slice((group - 1) * groupSize, questions.length)
      : questions.slice((group - 1) * groupSize, group * groupSize);
  }
}
