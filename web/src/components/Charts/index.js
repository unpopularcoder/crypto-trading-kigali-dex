import React from 'react';
import { connect } from 'react-redux';
import { DeepChart, TradeChart } from '@wangleiddex/hydro-sdk-charts';
// import { testData } from './constants'; # we can use testData to show what TradeChart looks like
import api from '../../lib/api';

class Charts extends React.Component {
  constructor(props) {
    super(props);
    this.tradeChartWrapper = React.createRef();

    this.state = {
      granularityStr: window.localStorage.getItem('granularityStr') || '1d',
      loading: false,
      noData: false,
      data: [],
      // from and to are timestamp range for fetching API
      from: null,
      to: null,
      // start and end are indexes range of data to show in the screen
      start: null,
      end: null,
      lastUpdatedAt: new Date().getTime() // for loadRight
    };
  }

  componentDidMount() {
    this.loadData();
    this.interval = window.setInterval(() => this.loadRight(), 60000);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentMarket.id !== this.props.currentMarket.id) {
      this.setState({
        from: null,
        to: null,
        data: [],
        noData: false
      });
      this.loadData();
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      window.clearInterval(this.interval);
    }
  }

  async loadRight(granularityStr = null) {
    if (new Date().getTime() - this.state.lastUpdatedAt > 59000) {
      this.loadData(this.state.granularityStr, this.state.to);
    }
  }

  async loadLeft(start, end) {
    this.loadData(this.state.granularityStr, null, this.state.from, start, end);
  }

  async loadData(granularityStr = null, from = null, to = null, start = null, end = null) {
    const granularityIsSame = this.state.granularityStr === granularityStr;
    if (this.state.loading || (granularityIsSame && this.state.noData)) {
      return;
    }
    if (!granularityIsSame && this.state.noData) {
      this.setState({ noData: false });
    }
    this.setState({ loading: true });

    const params = this.generateParams(granularityStr || this.state.granularityStr, from, to);
    if (granularityStr) {
      this.setState({ granularityStr });
    }

    let res;
    try {
      res = await api.get(
        `/markets/${this.props