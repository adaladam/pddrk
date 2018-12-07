import React from 'react';

import { inject, observer } from 'mobx-react';

import Store from '../mobx/store';
import { Loadable } from '../models';
import styles from './Question.module.scss';

interface IQuestionProps {
  readonly id: number;
  readonly question: string;
  readonly picture: string;
  readonly answers: ReadonlyArray<string>;
  readonly correctAnswer: number;
  readonly testMode?: boolean;
  readonly scrollTo?: number;
  readonly hideAnswer?: boolean;
  examHandler?(correct: boolean): void;
}

interface IQuestionState {
  readonly answerHidden: boolean;
  readonly imageLoaded: Loadable<boolean>;
  readonly chosenAnswer?: number;
}

const variants = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'H', 'J', 'K'];

@inject('store')
@observer
export default class Question extends React.Component<IQuestionProps & { store?: Store }, IQuestionState> {
  public state: IQuestionState = { answerHidden: true, imageLoaded: { state: 'init' } };
  private scrolled: boolean = false;

  public componentDidUpdate() {
    if (this.state.imageLoaded.state === 'init' || this.props.scrollTo !== this.props.id || this.scrolled) {
      return;
    }

    const el = document.querySelector(`#q${this.props.id}`);
    if (el != null) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 200);
      this.scrolled = true;
    }
  }

  public render() {
    return (
      <div id={`q${this.props.id}`} className={styles.main}>
        <img
          src={`/pictures/${this.props.picture}`}
          style={{ display: this.state.imageLoaded.state === 'success' ? 'block' : 'none' }}
          onLoad={() => this.setState({ imageLoaded: { state: 'success', data: true } })}
          onError={() => this.setState({ imageLoaded: { state: 'failure', error: new Error('Failed loading image') } })}
        />
        <p>{this.props.id}. {this.props.question}</p>
        <ul>
          {this.answersEl()}
        </ul>
        <div className={styles.buttons}>
          <div className={styles.answer}>
            {this.answerEl()}
          </div>
        </div>
      </div>
    );
  }

  private answersEl() {
    if (this.state.chosenAnswer != null) {
      return this.props.answers.map((answer, i) => {
        let className = '';
        const status = this.answerStatus(i);
        if (status === 'correct') {
          className = styles.correct;
        } else if (status === 'incorrect') {
          className = styles.incorrect;
        } else if (i === this.props.correctAnswer - 1) {
          className = styles.correct;
        }

        return <li key={i} className={className}><span>{variants[i]}.</span> {answer}</li>;
      });
    }

    return this.props.answers.map(
      (answer, i) => (
        <li key={i} onClick={() => this.onAnswerChosen(i)}><span>{variants[i]}.</span> {answer}</li>
      ),
    );
  }

  private answerEl() {
    if (this.props.hideAnswer) {
      return null;
    }

    return this.state.answerHidden
      ? <button onClick={() => this.setState({ answerHidden: false })}>Показать Ответ</button>
      : <span>Правильный ответ: {variants[this.props.correctAnswer - 1]}</span>;
  }

  private onAnswerChosen(index: number) {
    this.setState({ chosenAnswer: index });
    if (!this.props.testMode) {
      this.props.store!.questionAnswered(this.props.id);
    }

    if (this.props.examHandler) {
      this.props.examHandler(this.props.correctAnswer - 1 === index);
    }

    if (this.props.correctAnswer - 1 !== index) {
      this.props.store!.mistaken(this.props.id);
    } else if (this.props.testMode) {
      setTimeout(() => this.props.store!.unmistake(this.props.id), 3000);
    }
  }

  private answerStatus(index: number): 'correct' | 'incorrect' | null {
    if (this.state.chosenAnswer !== index) {
      return null;
    }

    if (this.props.correctAnswer - 1 === this.state.chosenAnswer) {
      return 'correct';
    }

    return 'incorrect';
  }
}
