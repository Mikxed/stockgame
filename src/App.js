import './App.css';
import React from 'react';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';

const StyledTableCell = withStyles((theme) => ({
  head: {
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
    color: priceChange ? 'red' : 'green',
  },
}))(TableCell);

class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: parseInt(props.startTimeInSeconds, 10) || 0,
      prices: [{x: 0, y: 0}],
      equitys: [{x: 0, y: 0}],
      purchasePrices: [{x: 0, y: 0}],
      xvalue: 0,
      priceClass: '',
      stockPrice: 0,
      stocks: 0,
      balance: 100,
      equity: 0,
      buyAmount: 1,
      sellAmount: 1,
      startingSaldo: this.balance
    };
    this.handleChange = this.handleChange.bind(this);
  }

  buy() {
    const haveSaldo = this.state.balance - this.state.stockPrice * this.state.buyAmount
    if (this.state.balance > 0 && haveSaldo > 0 && this.state.stockPrice > 0) {
      this.setState(state => ({
        balance: state.balance - state.stockPrice * state.buyAmount,
        stocks: state.stocks + Number(state.buyAmount),
        equity: state.stocks * state.stockPrice
      }))
      this.state.purchasePrices.push({
        x: this.state.xvalue,
        y: this.state.stockPrice
      })
    }
  }

  sell(all) {
    let amount = this.state.sellAmount
    if (all) {
      amount = this.state.stocks
    }
    if (this.state.stocks > 0 && this.state.stocks - amount >= 0 && this.state.stockPrice > 0) {
      this.setState(state => ({
        balance: state.balance + amount * this.state.stockPrice,
        stocks: state.stocks - amount,
      }))
    }
  }

  tick() {
    const chance = Math.floor(Math.random() * Math.floor(100))
    let randomMultiplier = Math.random() * Math.floor(2)
    if (chance > 50) {
      randomMultiplier = -randomMultiplier
    }
    const newStockPrice = this.state.stockPrice + randomMultiplier
    if (this.state.stockPrice >= 0 && newStockPrice > 0) {
      this.setState(state => ({
        stockPrice: state.stockPrice + randomMultiplier,
      }));
    } else {
      this.setState(state => ({
        stockPrice: 0,
      }));
    }
    this.setState(state => ({
      seconds: state.seconds + 1,
      xvalue: state.xvalue + 1,
      equity: state.stocks * state.stockPrice
    }));
    this.state.prices.push({
      x: this.state.xvalue,
      y: this.state.stockPrice
    })
    if (this.state.prices.length > 20) {
      this.state.prices.shift()
    }
    this.state.equitys.push({
      x: this.state.xvalue,
      y: this.state.equity
    })
    if (this.state.equitys.length > 50) {
      this.state.equitys.shift()
    }
    this.priceChange();
  }

  priceChange() {
    if (this.state.stockPrice > this.state.prices[this.state.prices.length-2].y) {
      this.setState(state => ({
        priceClass: 'rising',
      }));
    } else {
      this.setState(state => ({
        priceClass: 'downward',
      }));
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 2000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleChange(event, type) {
    if (type === 'buy') {
      this.setState({buyAmount: event.target.value});
    } else if (type === 'sell') {
      this.setState({sellAmount: event.target.value});
    }
  }

  render() {
    return (
      <div className="display-flex">
        <PricesTable prices={this.state.prices} currentPrice={this.state.stockPrice}/>
        <div>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Hinta</TableCell>
                  <TableCell>Saldo</TableCell>
                  <TableCell>Osakkeet</TableCell>
                  <TableCell>Osakepääoma</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className={this.state.priceClass}>{this.state.stockPrice.toFixed(2)}</TableCell>
                  <TableCell>{this.state.balance.toFixed(2)}</TableCell>
                  <TableCell>{this.state.stocks}</TableCell>
                  <TableCell>{this.state.equity.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <div className="display-flex">
            <div>
              <h5>
                Osakkeen hinta
              </h5>
              <XYPlot
                width={500}
                height={300}>
                <HorizontalGridLines />
                <LineSeries
                  data={this.state.prices}/>
                <XAxis />
                <YAxis />
              </XYPlot>
            </div>
            <div>
              <h5>
                Osakepääoma
              </h5>
              <XYPlot
                width={500}
                height={300}>
                <HorizontalGridLines />
                <LineSeries
                  data={this.state.equitys}/>
                <XAxis />
                <YAxis />
              </XYPlot>
            </div>
            <div>
              <h5>
                Ostohinnat
              </h5>
              <XYPlot
                width={500}
                height={300}>
                <HorizontalGridLines />
                <LineSeries
                  data={this.state.purchasePrices}/>
                <XAxis />
                <YAxis />
              </XYPlot>
            </div>
          </div>
          <div>
            <input type="input" value={this.state.buyAmount} onChange={event => this.handleChange(event, 'buy')}></input>
            <button className="buyButton" onClick={() => this.buy()}>Osta</button>
            <button className="sellButton" onClick={() => this.sell()}>Myy</button>
            <input type="input" value={this.state.sellAmount} onChange={event => this.handleChange(event, 'sell')}></input>
          </div>
          <div>
            <button className="sellButton" onClick={() => this.sell('all')}>Myy kaikki</button>
          </div>
        </div>
      </div>
    );
  }
}
function priceChange(currentPrice, prices) {
  let previousPrice = prices.find(p => p.x === currentPrice.x - 1)
  if (previousPrice) {
    currentPrice.difference = currentPrice.y - previousPrice.y
    return currentPrice.y > previousPrice.y
  }
}
class PricesTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      priceClass: '',
    };
  }



  render() {
    return (
        <TableContainer className="prices">
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Hinta</StyledTableCell>
              <StyledTableCell>Hintamuutos</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.prices.map((price, i) => (
              <TableRow key={i}>
                <TableCell class={priceChange(price, this.props.prices) ? 'rising' : 'downward'}>
                  {price.y.toFixed(2)}
                </TableCell>
                <TableCell class={priceChange(price, this.props.prices) ? 'rising' : 'downward'}>
                  {price.difference ? price.difference.toFixed(2) : 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}




function App() {
  return (
    <div className="App">
      <header className="App-header">
        Ostosofta
      </header>
      <div className="App-body">
        <Timer/>
      </div>
    </div>
  );
}

export default App;
