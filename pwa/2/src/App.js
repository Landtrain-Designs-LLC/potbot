import React from 'react';
import './App.css';
import axios from 'axios';
import {
  HashRouter as Router,
  Link,
  Route,
} from "react-dom";
import { createBrowserHistory } from "history";
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import Nav from 'react-bootstrap/Nav'
import BackArrow from './images/icons/back.svg'
import ForwardArrow from './images/icons/forward.svg'
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
import { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

Amplify.configure(awsconfig);

const history = createBrowserHistory();

const settings = {
  // Go to WebApp page, copy the App ID and page below
  // https://mdash.net/a/YOUR_APP_ID/
  appID: 'M91ELwAFfFvq1j83qRiOAxA',  // <-- Set this to YOUR_APP_ID
  provisionURL: '192.168.4.1',
  mdashURL: 'https://mdash.net',
  callTimeoutMilli: 10000,  // 10 seconds
  wifiPass: '',
  wifiSSID: '',
  devicePublicKey: ''
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

async function getUserEmail() {
  let user = await Auth.currentAuthenticatedUser();
  for (const key in user) {
    if (key === 'email') {
      return user[key];
    };
  };
}

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

      <Container fluid size="md" className="fixed-top bg-transparent d-inline-flex justify-content-center" style={{ width: 480 }}>
        <img src={BackArrow} style={{ cursor: 'pointer', marginRight: 120, marginTop: 10, height: 32, width: 32, visibility: backVis }} className="float-left" onClick={() => this.backHandler} alt="Go back" />;
          <h1 className="text-primary">PotBot</h1>
        <img src={ForwardArrow} style={{ cursor: 'pointer', marginLeft: 120, marginTop: 10, height: 32, width: 32, visibility: forwardVis }} className="float-right" onClick={() => this.forwardHandler} alt="Go Forward" />;
        </Container>
    )
  }
}


function BottomNav(props) {
  return (
    <div className="fixed-bottom mx-auto" style={{ width: 480 }}>
      <Nav fill className="bg-dark" varient="pills" defaultActiveKey="/userPage">
        <Nav.Item onClick={props.onPageChange('userPage')}>
          <Nav.Link href="/userPage" eventKey="/userPage" className="text-light">Home</Nav.Link>
        </Nav.Item>
        <Nav.Item onClick={sprops.onPageChange('addDevicePage')}>
          <Nav.Link href="/addDevicePage" eventKey="/addDevicePage" className="text-light">Add Device</Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  )
};

class UserPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
   static listDevices() {
     return (
    `query ListDevices {
    listDevices(filter:{customerEmail: {eq: "${this.props.customerEmail}"}) {
      items {
        publicKey
      }
    }
  }`
     )
}
  step0() {
    return (
      <Container>User Page</Container>
    )
  }
  step1() {
    return (
      <Container>Device Settings</Container>
    )
  }
  render() {
    if(this.props.step === 0) {
      return this.step0();
    }
    if(this.props.step === 1) {
      return this.step1();
    }
  }
}

class AddDevicePage extends React.Component {
  constructor(props) {
    super(props);
    this.step0 = this.step0.bind(this);
    this.step1 = this.step1.bind(this);
    this.step2 = this.step2.bind(this);
    this.stepChangeHandler = this.stepChangeHandler.bind(this);
    this.setSSID = this.setSSID.bind(this);
    this.setPass = this.setPass.bind(this);
    this.formHandler = this.formHandler.bind(this);
    this.state = { ssid: '', pass: '', public_key: '' };
  }
  stepChangeHandler(e) {
    this.props.onStepChange(e)
  }
  navChangeHandler(e) {
    this.props.onNavChange(e)
  }
  keyChangeHandler(e) {
    this.props.onKeyChange(e)
  }
  componentDidMount() {
    this.unmounted = false;
  }
  setSSID(e) {
    settings.wifiSSID = e.target.value;
  }
  setPass(e) {
    settings.wifiPass = e.target.value;
  }
  formHandler() {
    console.log("SSID:")
    console.log(settings.wifiSSID);
    console.log("Pass:")
    console.log(settings.wifiPass)

    var data = {
      config: {
        wifi: {
          sta: {
            enable: true,
            ssid: settings.wifiSSID,
            pass: settings.wifiPass
          },
          ap: {
            enable: false
          }
        }
      }
    };
    var save = { reboot: true };
    rpc('Config.Set', data, settings.provisionURL)
      .then(
        () => {
          rpc('Config.Save', save, settings.provisionURL);
          this.stepChangeHandler(2)
        }
      );
  }
  static createDevice() {
    return (
      `mutation CreateDevice {
        createDevice(input:{customerEmail:"${this.props.customerEmail}", publicKey:"${this.state.publicKey}"}) {
          id
          customerEmail
          publicKey
        }
      }`
    )
  }
  registerPotBot() {
    return null;
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
          let f = () => {
            rpc('Sys.GetInfo', null, settings.provisionURL).then((response) => {
              console.log("RPC successfully sent");
              let obj = response.data;
              for (const key in obj) {
                if (key === 'public_key') {
                  console.log(obj[key]);
                  this.state.devicePublicKey = obj[key];
                  this.stepChangeHandler(1);
                  return;
                };
              };

            }, () => {
              attempts++;
              if (attempts < 5) {
                console.log("attempt: ", attempts)
                setTimeout(f(), 500);
              } else {
                //this.NotFoundToast;
                console.log('timeout');
              }
            })
              .catch((e) => {
                console.log(e);
              })
          }
          f();
        }
        }>Scan for PotBot</Button>
      </Container>
    )
  }

  step1() {
    return (
      <Container className="d-flex flex-column align-items-center text-white-50">
        <p>We found your PotBot, just enter your WiFi information below to complete the setup</p>
        <Form className="bg-dark">
          <Form.Group controlId="ssid">
            <Form.Label>SSID</Form.Label>
            <Form.Control type="text" placeholder="Enter your WiFi name" onChange={this.setSSID}></Form.Control>
          </Form.Group>
          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Enter your WiFi password" onChange={this.setPass}></Form.Control>
            <Button varient="primary" className="mt-2" onClick={this.formHandler}>Submit</Button>
          </Form.Group>
        </Form>
      </Container>
    )
  }

  step2() {
    return (

      <Container className="d-flex flex-column align-items-center text-white-50">
        <button className="btn btn-lg btn-primary" onClick={this.registerPotBot}>Register your PotBot!</button>

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

class Page extends React.Component {
  constructor(props) {
    super(props);
    this.stepChangeHandler = this.stepChangeHandler.bind(this);
    this.navChangeHandler = this.navChangeHandler.bind(this);
    this.backVisHandler = this.backVisHandler.bind(this);
  }
  stepChangeHandler(e) {
    this.props.onStepChange(e);
  }
  navChangeHandler(e) {
    this.props.onNavChange(e);
  }
  backVisHandler(e) {
    this.props.onBackVisChange(e);
  }
  render () {
    if (this.props.page === 'addDevicePage') {
      return(
      <AddDevicePage
          onBackVisChange={this.backVisHandler}
          step={this.props.step}
          onStepChange={this.stepChangeHandler}
          internalNav={this.props.internalNav}
          onNavChange={this.navChangeHandler}
        ></AddDevicePage>
      )
    }
    if (this.props.page === 'userPage') {
      return null;
    }
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.pageChangeHandler = this.pageChangeHandler.bind(this);
    this.stepChangeHandler = this.stepChangeHandler.bind(this);
    this.navChangeHandler = this.navChangeHandler.bind(this);
    this.backVisHandler = this.backVisHandler.bind(this);
    this.keyChangeHandler = this.keyChangeHandler.bind(this);
    this.state = { page: "userPage", step: 0, internalNav: false, customerEmail: null, publicKey: null }
  }
  componentDidMount() {
    this.unmounted = false;
    let email = getUserEmail();
    this.setState({customerEmail: email});
  }
  componentWillUnmount() {
    this.unmounted = true;
  }
  pageChangeHandler(e) {
    this.setState({page: e})
  }
  stepChangeHandler(e) {
    this.setState({ step: e })
  }
  navChangeHandler(e) {
    this.setState({ internalNav: e })
  }
  backVisHandler(e) {
    this.setState({ backVis: e })
  }
  keyChangeHandler(e) {
    this.setState({public_key: e});
  }
  render() {
    //const step = this.state.step;
    //const internalNav = this.state.internalNav;
    return (
      <Container className="App d-flex align-items-center align-content-center bg-dark" style={{ width: 480, height: window.innerHeight }}>
        <TopHeader
          backVis={this.backVisHandler}
          forwardVis='hidden'
          step={this.state.step}
          onStepChange={this.stepChangeHandler}
          internalNav={this.state.internalNav}
          onNavChange={this.navChangeHandler}
        ></TopHeader>
        <Page
          page={this.state.page}
          backVis={this.backVisHandler}
          step={this.state.step}
          onStepChange={this.stepChangeHandler}
          internalNav={this.state.internalNav}
          onNavChange={this.navChangeHandler}
        >
        </Page>
        <BottomNav
          onPageChange={this.pageChangeHandler}
        >
        </BottomNav>
      </Container>
    )
  }
}



export default withAuthenticator(App, true);
