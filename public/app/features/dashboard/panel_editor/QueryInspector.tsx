import React, { PureComponent } from 'react';
import appEvents from 'app/core/app_events';
import { CopyToClipboard } from 'app/core/components/CopyToClipboard/CopyToClipboard';
import { LoadingPlaceholder, JSONFormatter } from '@grafana/ui';

interface DsQuery {
  isLoading: boolean;
  response: {};
}

interface Props {
  panel: any;
}

interface State {
  allNodesExpanded: boolean;
  isMocking: boolean;
  mockedResponse: string;
  dsQuery: DsQuery;
}

export class QueryInspector extends PureComponent<Props, State> {
  formattedJson: any;
  clipboard: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      allNodesExpanded: null,
      isMocking: false,
      mockedResponse: '',
      dsQuery: {
        isLoading: false,
        response: {},
      },
    };
  }

  componentDidMount() {
    const { panel } = this.props;

    appEvents.on('ds-request-response', this.onDataSourceResponse);
    appEvents.on('ds-request-error', this.onRequestError);

    panel.events.on('refresh', this.onPanelRefresh);
    panel.refresh();
  }

  componentWillUnmount() {
    const { panel } = this.props;

    appEvents.off('ds-request-response', this.onDataSourceResponse);
    appEvents.on('ds-request-error', this.onRequestError);

    panel.events.off('refresh', this.onPanelRefresh);
  }

  handleMocking(response: any) {
    const { mockedResponse } = this.state;
    let mockedData;
    try {
      mockedData = JSON.parse(mockedResponse);
    } catch (err) {
      appEvents.emit('alert-error', ['R: Failed to parse mocked response']);
      return;
    }

    response.data = mockedData;
  }

  onPanelRefresh = () => {
    this.setState(prevState => ({
      ...prevState,
      dsQuery: {
        isLoading: true,
        response: {},
      },
    }));
  };

  onRequestError = (err: any) => {
    this.onDataSourceResponse(err);
  };

  onDataSourceResponse = (response: any = {}) => {
    if (this.state.isMocking) {
      this.handleMocking(response);
      return;
    }

    response = { ...response }; // clone - dont modify the response

    if (response.headers) {
      delete response.headers;
    }

    if (response.config) {
      response.request = response.config;
      delete response.config;
      delete response.request.transformRequest;
      delete response.request.transformResponse;
      delete response.request.paramSerializer;
      delete response.request.jsonpCallbackParam;
      delete response.request.headers;
      delete response.request.requestId;
      delete response.request.inspect;
      delete response.request.retry;
      delete response.request.timeout;
    }

    if (response.data) {
      response.response = response.data;

      delete response.data;
      delete response.status;
      delete response.statusText;
      delete response.$$config;
    }
    this.setState(prevState => ({
      ...prevState,
      dsQuery: {
        isLoading: false,
        response: response,
      },
    }));
  };

  setFormattedJson = (formattedJson: any) => {
    this.formattedJson = formattedJson;
  };

  getTextForClipboard = () => {
    return JSON.stringify(this.formattedJson, null, 2);
  };

  onClipboardSuccess = () => {
    appEvents.emit('alert-success', ['内容复制到剪贴板']);
  };

  onToggleExpand = () => {
    this.setState(prevState => ({
      ...prevState,
      allNodesExpanded: !this.state.allNodesExpanded,
    }));
  };

  onToggleMocking = () => {
    this.setState(prevState => ({
      ...prevState,
      isMocking: !this.state.isMocking,
    }));
  };

  getNrOfOpenNodes = () => {
    if (this.state.allNodesExpanded === null) {
      return 3; // 3 is default, ie when state is null
    } else if (this.state.allNodesExpanded) {
      return 20;
    }
    return 1;
  };

  setMockedResponse = (evt: any) => {
    const mockedResponse = evt.target.value;
    this.setState(prevState => ({
      ...prevState,
      mockedResponse,
    }));
  };

  renderExpandCollapse = () => {
    const { allNodesExpanded } = this.state;

    const collapse = (
      <>
        <i className="fa fa-minus-square-o" /> 全部收缩
      </>
    );
    const expand = (
      <>
        <i className="fa fa-plus-square-o" /> 展开全部
      </>
    );
    return allNodesExpanded ? collapse : expand;
  };

  render() {
    const { response, isLoading } = this.state.dsQuery;
    const openNodes = this.getNrOfOpenNodes();

    if (isLoading) {
      return <LoadingPlaceholder text="加载查询检查器..." />;
    }

    return (
      <>
        <div className="pull-right">
          <button className="btn btn-transparent btn-p-x-0 m-r-1" onClick={this.onToggleExpand}>
            {this.renderExpandCollapse()}
          </button>
          <CopyToClipboard
            className="btn btn-transparent btn-p-x-0"
            text={this.getTextForClipboard}
            onSuccess={this.onClipboardSuccess}
          >
            <i className="fa fa-clipboard" /> 复制到剪贴板
          </CopyToClipboard>
        </div>

        <JSONFormatter json={response} open={openNodes} onDidRender={this.setFormattedJson} />
      </>
    );
  }
}
