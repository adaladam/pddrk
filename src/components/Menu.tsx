import React from 'react';

import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';

import Store from '../mobx/store';
import styles from './Menu.module.scss';
import { getGroupByCurrentQuestion } from './utils';

interface IMenuProps {
  readonly testMode: boolean;
}

@inject('store')
@observer
export default class Menu extends React.Component<IMenuProps & { store?: Store }> {
  public render() {
    const hasMistaken = this.props.store!.hasMistaken;

    const elements: JSX.Element[] = [];
    elements.push(<Link key="groups" to="/groups">Главная</Link>);

    if (!this.props.testMode && hasMistaken) {
      elements.push(<Link key="test" to="/test">Ошибки</Link>);
    }

    const backToQuestionsEl = this.backToQuestionsEl();
    if (this.props.testMode && backToQuestionsEl != null) {
      elements.push(backToQuestionsEl);
    }

    elements.push(<Link key="search" to="/search">Поиск</Link>);

    return (
      <nav className={styles.main}>
        {elements}
      </nav>
    );
  }

  private backToQuestionsEl() {
    const currentQuestion = this.props.store!.currentQuestion;
    if (currentQuestion == null) {
      return null;
    }

    const group = getGroupByCurrentQuestion(currentQuestion);

    return (
      <Link
        key="question"
        to={{ pathname: '/questions', search: `?group=${group}&scrollTo=${currentQuestion}` }}>
        Назад
      </Link>
    );
  }
}
