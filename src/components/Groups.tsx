import React from 'react';
import { Link } from 'react-router-dom';

import { inject, observer } from 'mobx-react';

import Store from '../mobx/store';
import { getGroupByCurrentQuestion } from './utils';

@inject('store')
@observer
export default class Groups extends React.Component<{ store?: Store }> {
  public render() {
    return (
      <div>
        <ul>
          <li><Link to={{ pathname: '/questions', search: '?group=1' }}>Вопросы 1 - 200</Link></li>
          <li><Link to={{ pathname: '/questions', search: '?group=2' }}>Вопросы 201 - 400</Link></li>
          <li><Link to={{ pathname: '/questions', search: '?group=3' }}>Вопросы 401 - 600</Link></li>
          <li><Link to={{ pathname: '/questions', search: '?group=4' }}>Вопросы 601 - 800</Link></li>
          <li><Link to={{ pathname: '/questions', search: '?group=5' }}>Вопросы 801 - 1019</Link></li>
          {this.testLink()}
          {this.currentQuestionLink()}
        </ul>
      </div>
    );
  }

  private testLink() {
    const hasMistaken = this.props.store!.hasMistaken;
    if (hasMistaken) {
      return <li><Link to="/test">Работа на ошибками</Link></li>;
    }

    return null;
  }

  private currentQuestionLink() {
    const currentQuestion = this.props.store!.currentQuestion;
    if (currentQuestion == null) {
      return null;
    }

    const group = getGroupByCurrentQuestion(currentQuestion);
    return (
      <li>
        <Link to={{ pathname: '/questions', search: `?group=${group}&scrollTo=${currentQuestion}` }}>
          Вернуться к последнему вопросу
        </Link>
      </li>
    );
  }
}
