import React from 'react';

import { inject, observer } from 'mobx-react';

import ApplicationService from './firebase';
import Store from './mobx/store';
import { IUser, Loadable } from './models';

interface IChildren {
  readonly children?: React.ReactChild | React.ReactChild[];
}

interface IAuthenticateState {
  readonly signedIn: Loadable<IUser>;
}

@inject('store')
@observer
export default class Authenticate extends React.Component<IChildren & { store?: Store }, IAuthenticateState> {
  public state: IAuthenticateState = { signedIn: { state: 'init' } };

  private readonly service: ApplicationService;

  constructor(props: any) {
    super(props);
    this.service = new ApplicationService();
  }

  public async componentDidMount() {
    try {
      this.setState({ signedIn: { state: 'loading' } });
      const user = await this.service.signIn();
      this.props.store!.loadData(user);
      this.setState({ signedIn: { state: 'success', data: user } });
    } catch (err) {
      this.setState({ signedIn: { state: 'failure', error: err } });
    }
  }

  public render() {
    if (this.state.signedIn.state === 'init' || this.state.signedIn.state === 'loading') {
      return <div>Загрузка ...</div>;
    }

    if (this.state.signedIn.state === 'failure') {
      return <div>Ошибка: <span style={{ color: 'red' }}>{this.state.signedIn.error.message}</span></div>;
    }

    return this.props.children;
  }
}
