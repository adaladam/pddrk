import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import styles from './App.module.scss';
import Authenticate from './authenticate';
import asyncLoad from './components/asyncLoad';

export default class App extends React.Component {
  public render() {
    return (
      <Authenticate>
        <div className={styles.main}>
          <Switch>
            <Route path="/" exact render={() => <Redirect to="/groups" />}></Route>
            <Route path="/groups" exact component={asyncLoad(() => import('./components/Groups'))} />
            <Route path="/questions" exact component={asyncLoad(() => import('./components/Questions'))} />
            <Route path="/test" exact component={asyncLoad(() => import('./components/Test'))} />
            <Route render={() => <div>NOT FOUND</div>} />
          </Switch>
        </div>
      </Authenticate>
    );
  }
}
