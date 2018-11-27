import React from 'react';

import { parse } from 'qs';
import InfiniteScroll from 'react-infinite-scroller';
import { RouteProps } from 'react-router';

import { asyncComponent } from './asyncLoad';
import Menu from './Menu';
import Question from './Question';
import styles from './Questions.module.scss';

interface IQuestion {
  readonly id: number;
  readonly question: string;
  readonly picture: string;
  readonly answers: ReadonlyArray<string>;
  readonly correctAnswer: number;
}

interface IQuestionProps {
  readonly something: {
    readonly default: ReadonlyArray<IQuestion>;
  };
}

interface IQuestionsState {
  readonly questions: IQuestion[];
  readonly hasMore: boolean;
}

class Questions extends React.Component<IQuestionProps & RouteProps> {
  public state: IQuestionsState = { questions: [], hasMore: true };

  private readonly groupSize: number = 200;
  private readonly pageSize: number = 20;

  constructor(props: any) {
    super(props);

    this.loadQuestions = this.loadQuestions.bind(this);
  }

  public render() {
    const scrollTo = this.parseScrollToFromUrl();
    const loader = <div key="loader" className={styles.loader}>Загрузка...</div>;
    return (
      <div className={styles.main}>
        <Menu testMode={false} />
        <div className={styles.content}>
          <InfiniteScroll
            pageStart={0}
            loadMore={this.loadQuestions}
            hasMore={this.state.hasMore}
            loader={loader}
          >
            {this.state.questions.map(
              (question, i) => <Question key={question.id} {...question} scrollTo={scrollTo || undefined} />,
            )}
          </InfiniteScroll>
        </div>
      </div>
    );
  }

  private loadQuestions(page: number) {
    const initialQuestionsCount = this.getInitialQuestionsCount();

    const groupQuestions = this.getGroupQuestions();
    const stateQuestions = this.state.questions;
    stateQuestions.push(...groupQuestions.slice(
      (page - 1) * this.pageSize + (page === 1 ? 0 : initialQuestionsCount),
      page * this.pageSize + initialQuestionsCount,
    ));

    const hasMore = groupQuestions.length > page * this.pageSize + initialQuestionsCount;
    this.setState({ questions: stateQuestions, hasMore });
  }

  private getGroupQuestions() {
    const questions = this.props.something.default;

    const group = this.parseGroupFromUrl();
    return group > 4
      ? questions.slice((group - 1) * this.groupSize, questions.length)
      : questions.slice((group - 1) * this.groupSize, group * this.groupSize);
  }

  private getInitialQuestionsCount(): number {
    const group = this.parseGroupFromUrl();
    const scrollTo = this.parseScrollToFromUrl();

    const groupStartingId = (group - 1) * this.groupSize + 1;
    const diff = scrollTo - groupStartingId;

    if (diff >= this.pageSize) {
      return scrollTo - groupStartingId - 10;
    }

    return 0;
  }

  private parseGroupFromUrl() {
    let group = 1;
    if (this.props.location != null) {
      const { search } = this.props.location;
      const parsed = parse(search, { ignoreQueryPrefix: true });
      const parsedGroup = Number.parseInt(parsed.group, 10);
      group = parsedGroup || group;
    }

    return group;
  }

  private parseScrollToFromUrl() {
    if (this.props.location == null || !this.props.location.search) {
      return 0;
    }

    const parsed = parse(this.props.location.search, { ignoreQueryPrefix: true });
    if (!parsed.scrollTo) {
      return 0;
    }

    const parsedScrollTo = Number.parseInt(parsed.scrollTo, 10);
    return parsedScrollTo || 0;
  }
}

export default asyncComponent(() => import('./questions.json'), Questions);
