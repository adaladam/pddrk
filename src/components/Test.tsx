import React from 'react';

import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router';

import Store from '../mobx/store';
import Menu from './Menu';
import Question from './Question';
import questions from './questions.json';
import styles from './Questions.module.scss';

@inject('store')
@observer
export default class Test extends React.Component<{ store: Store }> {
  public componentDidMount() {
    if (document.scrollingElement != null) {
      document.scrollingElement.scrollTo(0, 0);
    }
  }

  public render() {
    const { mistakenQuestions } = this.props.store;
    const filteredQuestions = questions.filter(question => mistakenQuestions.indexOf(question.id) !== -1);

    if (filteredQuestions.length === 0) {
      return <Redirect to="/" />;
    }

    return (
      <div className={styles.main}>
        <Menu testMode={true} />
        <div className={styles.content}>
          {filteredQuestions.map(question => <Question key={question.id} {...question} testMode={true} />)}
        </div>
      </div>
    );
  }
}
