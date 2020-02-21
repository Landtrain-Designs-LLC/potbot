import React from 'react';
import axios from 'axios';
import {
  HashRouter as Router,
  Link,
  Route,
} from "react-dom";
import { createBrowserHistory } from "history";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import Nav from 'react-bootstrap/Nav'
import BackArrow from './images/icons/back.svg'
import ForwardArrow from './images/icons/forward.svg'
import './App.css';

const history = createBrowserHistory();

const settings = {
  // Go to WebApp page, copy the App ID and page below
  // https://mdash.net/a/YOUR_APP_ID/
  appID: 'M91ELwAFfFvq1j83qRiOAxA',  // <-- Set this to YOUR_APP_ID
  provisionURL: '192.168.4.1',
  mdashURL: 'https://mdash.net',
  callTimeoutMilli: 10000,  // 10 seconds
};

async function rpc(func, data, addr) {
  let response = await axios({
    //transformRequest: data => JSON.stringify(data),
    method: data ? 'post' : 'get',
    url: `http://${addr}/rpc/${func}`,
    timeout: 10000,
    data,
  })
  return response;
};

async function remoteRPC(func, data, addr, token) {
  let response = await axios({
    //transformRequest: data => JSON.stringify(data),
    method: data ? 'post' : 'get',
    url: `${addr}/api/v2/m/device/rpc/${func}?access_token=${token}`,
    timeout: 10000,
    data,
  })
  return response
};

class TopHeader extends React.Component {
  constructor(props) {
    super(props);
    this.stepChangeHandler = this.stepChangeHandler.bind(this);
    this.navChangeHandler = this.navChangeHandler.bind(this);
  }
   stepChangeHandler(e) {
    this.props.onStepChange(e);
  }
  navChangeHandler(e) {
    this.props.onNavChange(e);
  } 
  backHandler() {
    if (this.props.internalNav) {
      let newStep = this.props.step - 1;
      this.handleChange(newStep);
    } else {
      history.goBack();
    };
  }
  forwardHandler() {
    if (this.props.internalNav) {
      let newStep = this.props.step + 1;
      this.handleChange(newStep);
    } else {
      history.goForward();
    };
  }
  render() {
    const backVis = this.props.backVis || 'hidden'
    const forwardVis = this.props.forwardVis || 'hidden'
    return (

        <Container fluid size="md" className="fixed-top bg-transparent d-inline-flex justify-content-center" style={{width:480}}>
          <img src={BackArrow} style={{cursor: 'pointer', marginRight: 110, marginTop:10, height: 32, width: 32, color: "white", visibility: backVis }} className="float-left" onClick={() => this.backHandler} alt="Go back" />;
          <h1 className="text-primary">PotBot</h1>
          <img src={ForwardArrow} style={{cursor: 'pointer', marginLeft: 110, marginTop:10, height: 32, width: 32, color: '#ffffff', visibility: forwardVis }} className="float-right" onClick={() => this.forwardHandler} alt="Go Forward" />;
        </Container>
    )
  }
}

function BottomNav(props) {
  return (
      <div className="fixed-bottom mx-auto" style={{ width: 480 }}>
        <Nav fill className="bg-dark" varient="pills" defaultActiveKey="/userPage">
          <Nav.Item>
            <Nav.Link href="/userPage" eventKey="/userPage" className="text-light">Home</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/addDevicePage" eventKey="/addDevicePage" className="text-light">Add Device</Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
  )
};

class AddDevice extends React.Component {
  constructor(props) {
    super(props);
    this.stepChangeHandler = this.stepChangeHandler.bind(this);
    this.navChangeHandler = this.navChangeHandler.bind(this);
    this.state = { ssid: '', pass: '', public_key: '' };
  }
  stepChangeHandler(e) {
    this.props.onStepChange(e)
  }
  navChangeHandler(e) {
    this.props.onNavChange(e)
  }
  componentDidMount() {
    this.unmounted = false;
  }
  step0() {
    return (
      <Container className="d-flex flex-column align-items-center text-white-50">
        <Container className="mt-0">
          <p>Please go to your WiFi settings and connect to "PotBot-XXXX"</p>
          <br></br>
          <p className="text-info mb-2">Press the button below once connected</p>
        </Container>
        <Button varient="dark" size="lg" class="mb-0 mt-5" style={{ width: 480 }} onClick={() => {
          let attempts = 0;
          var f = function () {
            rpc('Sys.GetInfo', null, settings.provisionURL).then((res) => {
              for (const key in res) {
                if (key === 'public_key') {
                  this.setState({ public_key: res[key] });
                  this.stepChangeHandler(1);
                  return;
                }
              }

            }, () => {
              attempts++;
              if (attempts < 5) {
                setTimeout(f, 500);
              } else {
                //this.NotFoundToast;
                console.log('timeout');
              }
            })
              .catch((e) => {
                console.log(e);
              })
          }

        }}>Scan for PotBot</Button>
      </Container>
    )
  }

  step1() {
    return (

      <Container className="d-flex flex-column align-items-center text-white-50">

      </Container>
    )
  }

  step2() {
    return (

      <Container className="d-flex flex-column align-items-center text-white-50">

      </Container>
    )
  }

  render() {
    if (this.props.step === 0) {
      return this.step0();
    }
    if (this.props.step === 1) {
      return this.step1();
    }
    if (this.props.step === 2) {
      return this.step2();
    }
  }
}

class AddDevicePage extends React.Component {
  constructor(props) {
    super(props);
    this.stepChangeHandler = this.stepChangeHandler.bind(this);
    this.navChangeHandler = this.navChangeHandler.bind(this);
    this.state = { step: 0, internalNav: false }
  }
  componentDidMount() {
    this.unmounted = false;
    this.backVisHandler('visible')
  }

  componentWillUnmount() {
    this.unmounted = true;
  }
  stepChangeHandler(e) {
    this.setState({ step: e })
  }
  navChangeHandler(e) {
    this.setState({ internalNav: e })
  }
  backVisHandler(e) {
    this.setState({backVis : e})
  }
  render() {
    const step = this.state.step;
    const internalNav = this.state.internalNav;
    return (
      <Container className="App d-flex align-items-center align-content-center bg-dark" style={{ width: 480, height: window.innerHeight }}>
        <TopHeader
          backVis={this.backVisHandler}
          forwardVis='hidden'
          step={step}
          onStepChange={this.stepChangeHandler}
          internalNav={internalNav}
          onNavChange={this.navChangeHandler}
        ></TopHeader>
        <AddDevice
          onBackVisChange={this.backVisHandler}
          step={step}
          onStepChange={this.stepChangeHandler}
          internalNav={internalNav}
          onNavChange={this.navChangeHandler}
        ></AddDevice>
        <BottomNav></BottomNav>
      </Container>
    )
  }
}


function App() {
  return (
    <router history={history}>
      <AddDevicePage></AddDevicePage>
    </router>
  );
}


export default App;
