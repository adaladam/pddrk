import * as React from 'react';

interface IHasDefault {
  readonly default: any;
}

interface IAsyncComponentState {
  readonly something: IHasDefault | null;
}

interface IAsyncLoadedComponent {
  readonly default: React.ComponentType<any>;
}

export function asyncComponent(importSomething: () => Promise<IHasDefault>, component?: React.ComponentClass<any>) {
  return class AsyncComponent extends React.Component<React.Props<any>, IAsyncComponentState> {
    constructor(props: React.Props<any>) {
      super(props);
      this.state = {
        something: null,
      };
    }

    public async componentDidMount() {
      const something = await importSomething();
      this.setState({
        something,
      });
    }

    public render() {
      if (this.state.something == null) {
        return <div>Загрузка ...</div>;
      }

      if (component != null) {
        const Component = component;
        return <Component {...this.props} something={this.state.something} />;
      }

      const C = this.state.something.default;
      return <C {...this.props} />;
    }
  };
}

export default function asyncLoad(importComponent: () => Promise<IAsyncLoadedComponent>) {
  return asyncComponent(importComponent);
}
