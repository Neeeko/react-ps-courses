import axios from 'axios';
import _ from 'lodash';
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {
    cardsData: []
  };
  addNewGitHubCard = (cardInfo) => {
    this.setState(prevState => ({
      cardsData: prevState.cardsData.concat(cardInfo)
    }));
  };
  render() {
    return (
      <div>
        <header className="App App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="contaier">
          <h1>Easy Calculator</h1>
          <hr />
          <EasyCalculator />
          <h1 className="App-topics">GitHub Cards</h1>
          <hr />
          <GitHubForm onSubmit={this.addNewGitHubCard} />
          <GitHubCardList cards={this.state.cardsData} />
          <h1 className="App-topics">Play Nine</h1>
          <hr />
          <PlayNine />
          <p>TODO: Implement a Timer</p>
        </div>
      </div>
    );
  };
};

// {{{ PLAY NINE PROJECT

const PlayNineStars = (props) => {
  let stars = [];

  for (let i = 0; i < props.randomNumberOfStars; i++) {
    stars.push(<i key={i} className="fa fa-star"></i>);
  }
  return (
    <div className="col-5">
      {stars}
    </div>
  );
};

const PlayNineActions = (props) => {
  let button;
  switch (props.answerIsCorrect) {
    case true:
      button = <button className="btn btn-success" onClick={props.acceptAnswer}>
        <i className="fa fa-check"></i>
      </button>;
      break;
    case false:
      button = <button className="btn btn-danger">
        <i className="fa fa-times"></i>
      </button>;
      break;
    default:
      button = <button className="btn btn-info"
        onClick={props.checkAnswer}
        disabled={props.selectedNumbers.length === 0}>=</button>;
      break;
  }
  return (
    <div className="col-2 text-center">
      {button}
      <br /><br />
      <button className="btn btn-warning btn-sm" onClick={props.redraw}
        disabled={props.redraws === 0 || props.doneStatus}>
        <span className="btn-redraw"><i className="fa fa-redo"></i> {props.redraws}</span>
      </button>
    </div>
  );
};

const PlayNineAnswer = (props) => {
  return (
    <div className="col-5">
      {props.selectedNumbers.map((number, i) =>
        <span className="number" key={i}
          onClick={() => props.unselectNumber(number)}>{number}</span>
      )}
    </div>
  );
};

const PlayNineNumbers = (props) => {
  const numberClassName = (number) => {
    if (_.indexOf(props.usedNumbers, number) >= 0) {
      return 'number used';
    }
    if (_.indexOf(props.selectedNumbers, number) >= 0) {
      return 'number selected';
    }
    return 'number';
  };
  return (
    <div className="card text-center">
      <div>
        {PlayNineNumbers.list.map((number, i) =>
          <span key={i} className={numberClassName(number)}
            onClick={() => props.selectNumber(number)}>{number}</span>
        )}
      </div>
    </div>
  )
};
PlayNineNumbers.list = _.range(1, 10);

const PlayNineDoneFrame = (props) => {
  return (
    <div className="text-center">
      <h2>{props.doneStatus}</h2>
      <button className="btn btn-secondary"
        onClick={props.resetGame}>Play Again</button>
    </div>
  );
};

class PlayNine extends Component {
  // Math.random => random number between 0 and 1
  // We multiply the result by 9 to have between 0 and 9
  // We apply Math.floor to have an integer
  // We add one because we don't want to start at 0
  static getRandomNumber = () => 1 + Math.floor(Math.random() * 9);
  static setInitialState = () => ({
    selectedNumbers: [],
    usedNumbers: [],
    randomNumberOfStars: PlayNine.getRandomNumber(),
    answerIsCorrect: null,
    redraws: 5,
    doneStatus: null
  });
  state = PlayNine.setInitialState();

  // https://gist.github.com/samerbuna/aa1f011a6e42d6deba46
  possibleCombinationSum = (arr, n) => {
    if (arr.indexOf(n) >= 0) { return true; }
    if (arr[0] > n) { return false; }
    if (arr[arr.length - 1] > n) {
      arr.pop();
      return this.possibleCombinationSum(arr, n);
    }
    let listSize = arr.length, combinationsCount = (1 << listSize)
    for (let i = 1; i < combinationsCount ; i++ ) {
      let combinationSum = 0;
      for (let j = 0 ; j < listSize ; j++) {
        if (i & (1 << j)) { combinationSum += arr[j]; }
      }
      if (n === combinationSum) { return true; }
    }
    return false;
  };

  selectNumber = (clickedNumber) => {
    if (_.indexOf(this.state.selectedNumbers, clickedNumber) >= 0 ||
      _.indexOf(this.state.usedNumbers, clickedNumber) >= 0) return ;
    this.setState((prevState) => ({
      answerIsCorrect: null,
      selectedNumbers: prevState.selectedNumbers.concat(clickedNumber)
    }));
  };

  unselectNumber = (clickedNumber) => {
    this.setState((prevState) => ({
      answerIsCorrect: null,
      selectedNumbers: _.pull(prevState.selectedNumbers, clickedNumber)
    }));
  };

  checkAnswer = () => {
    this.setState((prevState) => ({
      answerIsCorrect: prevState.randomNumberOfStars === _.sum(prevState.selectedNumbers)
    }));
  };

  acceptAnswer = () => {
    this.setState((prevState) => ({
      usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
      selectedNumbers: [],
      answerIsCorrect: null,
      randomNumberOfStars: PlayNine.getRandomNumber()
    }), this.updateDoneStatus);
  };

  redraw = () => {
    if (this.state.redraws === 0) return ;
    this.setState((prevState) => ({
      randomNumberOfStars: PlayNine.getRandomNumber(),
      answerIsCorrect: null,
      selectedNumbers: [],
      redraws: prevState.redraws - 1
    }), this.updateDoneStatus);
  };

  hasPossibleSolutions = ({randomNumberOfStars, usedNumbers}) => {
    const possibleNumbers = _.range(1, 10).filter(number =>
      usedNumbers.indexOf(number) === -1
    );
    return this.possibleCombinationSum(possibleNumbers, randomNumberOfStars);
  };

  updateDoneStatus = () => {
    this.setState(prevState => {
      if (prevState.usedNumbers.length === 9) {
        return { doneStatus: 'You Won!' };
      }
      if (prevState.redraws === 0 && !this.hasPossibleSolutions(prevState)) {
        return { doneStatus: 'Game Over!' };
      }
    });
  };

  resetGame = () => this.setState(PlayNine.setInitialState());

  render() {
    const {
      selectedNumbers,
      randomNumberOfStars,
      answerIsCorrect,
      usedNumbers,
      redraws,
      doneStatus
    } = this.state;
    return (
      <div className="container">
        <div className="row">
          <PlayNineStars randomNumberOfStars={randomNumberOfStars} />
          <PlayNineActions
            checkAnswer={this.checkAnswer}
            acceptAnswer={this.acceptAnswer}
            redraw={this.redraw}
            answerIsCorrect={answerIsCorrect}
            selectedNumbers={selectedNumbers}
            redraws={redraws}
            doneStatus={doneStatus} />
          <PlayNineAnswer unselectNumber={this.unselectNumber} selectedNumbers={selectedNumbers} />
        </div>
        <br />
        {doneStatus ?
          <PlayNineDoneFrame resetGame={this.resetGame} doneStatus={doneStatus} /> :
          <PlayNineNumbers
            selectNumber={this.selectNumber}
            selectedNumbers={selectedNumbers}
            usedNumbers={usedNumbers} />
        }
      </div>
    );
  };
};

// }}}

// {{{ GITHUB PROJECT

const GitHubCard = (props) => {
  return (
    <div style={{margin: '1em'}}>
      <img width="75" src={props.avatar_url} alt="avatar"/>
      <div style={{display: 'inline-block', marginLeft: 10, verticalAlign: 'top',
        textAlign: 'left'}}>
        <div style={{fontSize: '1.25em', fontWeight: 'bold'}}>{props.name}</div>
        <div>{props.company}</div>
      </div>
    </div>
  );
};

const GitHubCardList = (props) => {
  return (
    <div>
      {props.cards.map(card => <GitHubCard key={card.id} {...card} />)}
    </div>
  );
};

class GitHubForm extends Component {
  state = { userName: '' };
  handleSubmit = (event) => {
    event.preventDefault();
    axios.get(`https://api.github.com/users/` + this.state.userName)
      .then(resp => {
        this.props.onSubmit(resp.data);
        this.setState({ userName: '' });
      });
  };
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text"
          value={this.state.userName}
          onChange={(event) => this.setState({ userName: event.target.value })}
          placeholder="GitHub username" required />
        <button type="submit">Add card</button>
      </form>
    );
  };
};

// }}}

// {{{ CALCULATOR PROJECT

class EasyCalculatorButton extends React.Component {
	handleClick = () => {
		this.props.onClickFunction(this.props.incrementValue);
  };

  render () {
  	return (
    	<button onClick={this.handleClick}>
      	+{this.props.incrementValue}
      </button>
    );
  };
};

const EasyResult = (props) => {
	return (
  	<div className="github-card-result">{props.counter}</div>
  );
};

class EasyCalculator extends React.Component {
	state = { counter: 0 };

	incrementCounter = (incrementValue) => {
  	this.setState((prevState) => ({
      counter: prevState.counter + incrementValue
    }));
  };

	render() {
  	return (
    	<div>
      	<EasyCalculatorButton incrementValue={1} onClickFunction={this.incrementCounter} />
        <EasyCalculatorButton incrementValue={5} onClickFunction={this.incrementCounter} />
      	<EasyCalculatorButton incrementValue={10} onClickFunction={this.incrementCounter} />
      	<EasyCalculatorButton incrementValue={100} onClickFunction={this.incrementCounter} />
        <EasyResult counter={this.state.counter} />
      </div>
    );
  };
};

// }}}

export default App;
