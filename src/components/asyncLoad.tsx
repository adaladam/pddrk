import * as React from 'react';

interface IAsyncComponentState {
  readonly component: React.ComponentType | null;
}

interface IAsyncLoadedComponent {
  readonly default: React.ComponentType<any>;
}

export default function asyncLoad(importComponent: () => Promise<IAsyncLoadedComponent>) {
  class AsyncComponent extends React.Component<React.Props<any>, IAsyncComponentState> {
    constructor(props: React.Props<any>) {
      super(props);
      this.state = {
        component: null,
      };
    }

    public async componentDidMount() {
      const { default: component } = await importComponent();
      this.setState({
        component,
      });
    }

    public render() {
      const C = this.state.component;
      return C ? <C {...this.props} /> : <div>Загрузка ...</div>;
    }
  }

  return AsyncComponent;
}
