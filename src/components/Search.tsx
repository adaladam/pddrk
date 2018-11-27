import React from 'react';

import Menu from './Menu';
import Question from './Question';
import { IIndexValue, search } from './search';
import styles from './Search.module.scss';

interface ISearchState {
  readonly value: string;
  readonly results: IIndexValue[];
  readonly selectedValue: IIndexValue | null;
}

export default class Search extends React.Component<any, ISearchState> {
  public state: ISearchState = { value: '', results: [], selectedValue: null };

  constructor(props: any) {
    super(props);

    this.onSearchChange = this.onSearchChange.bind(this);
  }

  public render() {
    return (
      <div className={styles.main}>
        <Menu testMode={false} />
        <div className={styles.content}>
          <form>
            <label>Поиск: </label>
            <input type="text" value={this.state.value} onChange={this.onSearchChange}></input>
          </form>
          {
            this.state.selectedValue != null
              ? <Question {...this.state.selectedValue} />
              : (
                <ul>
                  {
                    this.state.results
                      .slice(0, 30)
                      .map(r => <li key={r.id} onClick={() => this.onSelectQuestion(r)}>{r.id}. {r.question}</li>)
                  }
                </ul>
              )
          }
        </div>
      </div>
    );
  }

  private onSearchChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const value = ev.target.value;
    if (value === '') {
      this.setState({ value, results: [], selectedValue: null });
      return;
    }

    const results = search(value);
    this.setState({ value, results, selectedValue: null });
  }

  private onSelectQuestion(id: IIndexValue) {
    this.setState({ selectedValue: id });
  }
}
