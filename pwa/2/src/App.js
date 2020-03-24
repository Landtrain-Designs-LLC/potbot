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
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { Dropdown } from 'react-bootstrap';

Amplify.configure(awsconfig);

const history = createBrowserHistory();

const settings = {
  // Go to WebApp page, copy the App ID and page below
  // https://mdash.net/a/YOUR_APP_ID/
  appID: 'M91ELwAFfFvq1j83qRiOAxA',  // <-- Set this to YOUR_APP_ID
  provisionURL: '192.168.4.1',
  mdashURL: 'http://mdash.net',
  callTimeoutMilli: 10000,  // 10 seconds
  wifiPass: '',
  wifiSSID: '',
  userEmail: ''
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
  console.log(user);
  const email = user.signInUserSession.idToken.payload.email
  console.log(email);
  return (email);
};


class TopHeader extends React.Component {
  constructor(props) {
    super(props);
    this.stepChangeHandler = this.stepChangeHandler.bind(this);
    this.navChangeHandler = this.navChangeHandler.bind(this);
    this.backHandler = this.backHandler.bind(this);
    this.forwardHandler = this.forwardHandler.bind(this);
  }
  stepChangeHandler(e) {
    this.props.onStepChange(e);
  }
  navChangeHandler(e) {
    this.props.onNavChange(e);
  }
  backHandler() {
    if (this.props.step > 0) {
      let newStep = this.props.step - 1;
      if (newStep === 0) { this.props.onBackVisChange('hidden') };
      this.props.onStepChange(newStep);
    }
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
        <img src={BackArrow} style={{ cursor: 'pointer', marginRight: 120, marginTop: 10, height: 32, width: 32, visibility: backVis }} className="float-left" onClick={() => this.backHandler()} alt="Go back" />;
          <h1 className="text-primary">PotBot</h1>
        <img src={ForwardArrow} style={{ cursor: 'pointer', marginLeft: 120, marginTop: 10, height: 32, width: 32, visibility: forwardVis }} className="float-right" onClick={() => this.forwardHandler()} alt="Go Forward" />;
        </Container>
    )
  }
}


class BottomNav extends React.Component {
  constructor(props) {
    super(props);
    this.pageChangeHandler = this.pageChangeHandler.bind(this);
  }
  pageChangeHandler(e) {
    this.props.onPageChange(e);
  }
  render() {
    return (
      <div className="fixed-bottom mx-auto" style={{ width: 480 }}>
        <Button variant="dark" className="mr-5" onClick={() => { this.pageChangeHandler('userPage') }}>Home</Button>
        <Button variant="dark" className="ml-5" onClick={() => { this.pageChangeHandler('addDevicePage') }}>Add Device</Button>
      </div>
    )
  }
};

class DeviceWidget extends React.Component {
  constructor(props) {
    super(props)
    this.desiredHandler = this.desiredHandler.bind(this);
  }
  desiredHandler(e) {
    this.props.onDesiredChange(e);
  }
  render() {
    if (this.props.deviceSelected) {
      if (this.props.shadow.online) {
        return (
          <Container>
            <h1>{this.props.deviceSelected.name}</h1>
            <h2 className="text-primary">{Math.floor(this.props.shadow.temperature)}</h2>
            <p>Temperature</p>
            <br></br>
            <h2 className="text-primary">{Math.floor(this.props.shadow.humidity)}</h2>
            <p>Humidity</p>
          </Container>
        )
      } else {
        return (
          <h3 className="text-light">Your PotBot isn't connected</h3>
        )
      }
    } else {
      return (
        <h3>Select a Device</h3>
      )
    }
  }
}

class UserPage extends React.Component {
  constructor(props) {
    super(props);
    this.backVisHandler = this.backVisHandler.bind(this);
    this.stepChangeHandler = this.stepChangeHandler.bind(this);
    this.navChangeHandler = this.navChangeHandler.bind(this);
    this.emailChangeHandler = this.emailChangeHandler.bind(this);
    this.state = {
      url: '', devices: {}, shadow: {}, deviceSelected: false, selectedDevice: {}, gotShadow: false
    };
  }
  listDevices() {
    return (
      `query ListDevices {
    listDevices(filter:{customerEmail: {eq: "${this.props.userEmail}"}}) {
      items {
        id
        name
        publicKey
      }
    }
  }`
    )
  }
  async deviceQuery() {
    const listDevices = this.listDevices();
    const devices = await API.graphql(graphqlOperation(listDevices));
    //console.log(JSON.stringify(devices));
    return devices;

  }
  async getShadow() {
    this.setState({ url: settings.mdashURL + '/api/v2/m/device?access_token=' + this.state.selectedDevice.publicKey });
    await axios.get(this.url)
      .then((res) => {
        this.setState({ shadow: res.data.device.shadow, gotShadow: true, deviceSelected: true })
        console.log(res);
      })
      .catch((e) => {
        this.gotShadow = false;
        console.log(e);
      })
  }
  deviceList = []
  componentDidMount() {
    this.backVisHandler('hidden');
    getUserEmail().then((e) => {
      this.emailChangeHandler(e);
      this.deviceQuery()
      .then((f) => {
        let devices = f.data.listDevices.items;
        //this.setState({ devices: devices });
        this.deviceList = devices;
        this.stepChangeHandler(0);
        console.log('Devices loaded: ', JSON.stringify(f.data.listDevices.items));
        console.log(devices);
      })
      .catch((f) => { console.log(f); });
    })


  }

  backVisHandler(e) {
    this.props.onBackVisChange(e);
  }
  stepChangeHandler(e) {
    this.props.onStepChange(e);
  }
  navChangeHandler(e) {
    this.props.onNavChange(e);
  }
  emailChangeHandler(e) {
    this.props.onEmailChange(e);
  }

  step0() {
    //var devices = this.state.devices
    //var deviceArray = Object.keys(devices);
    //console.log(deviceArray);
    return (
      <Container className="d-flex flex-xl-column justify-content-between">
      <Container className="fixed-top mt-5">
        <Dropdown>
          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
          Select your PotBot
          </Dropdown.Toggle>

          <Dropdown.Menu>
          {this.deviceList.map(
            device => (
              <Dropdown.Item
                onSelect={() => {
                  this.setState({ selectedDevice: device })
                  this.getShadow();
                  

                }}
                key={device.id}
                >
                {device.name}</Dropdown.Item>
            )
          )}
          </Dropdown.Menu>
        </Dropdown>
        </Container>
        <Container>
        <DeviceWidget
          onDesiredChange={this.desiredHandler}
          shadow={this.state.shadow.reported}
          deviceSelected={this.state.deviceSelected}
        >
        </DeviceWidget>
      </Container>
      </Container>
    )
  }
  step1() {
    return (
      <Container>
        Device Settings
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
  }
}

class AddDevicePage extends React.Component {
  constructor(props) {
    super(props);
    this.step0 = this.step0.bind(this);
    this.step1 = this.step1.bind(this);
    this.step2 = this.step2.bind(this);
    this.stepChangeHandler = this.stepChangeHandler.bind(this);
    this.backVisHandler = this.backVisHandler.bind(this);
    this.setSSID = this.setSSID.bind(this);
    this.setPass = this.setPass.bind(this);
    this.formHandler = this.formHandler.bind(this);
    this.deviceMutation = this.deviceMutation.bind(this);
    this.state = { ssid: '', pass: '', publicKey: '', deviceName: '' };
  }
  pageChangeHandler(e) {
    this.props.onPageChange(e);
  }
  stepChangeHandler(e) {
    this.props.onStepChange(e)
  }
  navChangeHandler(e) {
    this.props.onNavChange(e)
  }
  backVisHandler(e) {
    this.props.onBackVisChange(e);
  }
  componentDidMount() {
    this.unmounted = false;
    this.stepChangeHandler(0);
    this.navChangeHandler(false);
  }
  setSSID(e) {
    settings.wifiSSID = e.target.value;
  }
  setPass(e) {
    settings.wifiPass = e.target.value;
  }
  setName(e) {
    this.setState({ deviceName: e.target.value })
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
  createDevice() {
    return (
      `mutation CreateDevice {
        createDevice(input:{name: "${this.state.deviceName}", customerEmail:"${this.props.userEmail}", publicKey:"${this.state.publicKey}"}) {
          id
          name
          customerEmail
          publicKey
        }
      }`
    )
  }
  async deviceMutation() {
    const createDevice = this.createDevice();
    const newDevice = await API.graphql(graphqlOperation(createDevice));
    console.log(JSON.stringify(newDevice));
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
                  this.setState({ publicKey: obj[key] })
                  this.stepChangeHandler(1);
                  this.navChangeHandler(true);
                  this.backVisHandler('visible');
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
        <p>We found your PotBot, please enter your WiFi information below</p>
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
        <p>Connect back to your regular WiFi network and then click the button below to complete the setup</p>
        <Form className="bg-dark">
          <Form.Group controlId="deviceName">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" placeholder="Enter your PotBot's name" onChange={this.setName}></Form.Control>
          </Form.Group>
        </Form>
        <button className="btn btn-lg btn-primary" onClick={() => {
          this.deviceMutation()
            .then(() => {
              this.stepChangeHandler(0);
              this.pageChangeHandler('userPage')
            })
            .catch((e) => { console.log(e) })
        }}>Register your PotBot!</button>
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
    this.pageChangeHandler = this.pageChangeHandler.bind(this);
    this.emailChangeHandler = this.emailChangeHandler.bind(this);
  }
  pageChangeHandler(e) {
    this.props.onPageChange(e);
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
  emailChangeHandler(e) {
    this.props.onEmailChange(e);
  }
  render() {
    if (this.props.page === 'addDevicePage') {
      return (
        <AddDevicePage
          onBackVisChange={this.backVisHandler}
          step={this.props.step}
          onStepChange={this.stepChangeHandler}
          internalNav={this.props.internalNav}
          onNavChange={this.navChangeHandler}
          onPageChange={this.pageChangeHandler}
          userEmail={this.props.userEmail}
        ></AddDevicePage>
      )
    }
    if (this.props.page === 'userPage') {
      return <UserPage
        onBackVisChange={this.backVisHandler}
        backVis={this.props.backVis}
        step={this.props.step}
        onStepChange={this.stepChangeHandler}
        internalNav={this.props.internalNav}
        onNavChange={this.navChangeHandler}
        userEmail={this.props.userEmail}
        onEmailChange={this.emailChangeHandler}
      >
      </UserPage>;
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
    this.emailChangeHandler = this.emailChangeHandler.bind(this);
    this.state = { backVis: "hidden", page: "userPage", step: 0, internalNav: false, userEmail: '' }
  }
  componentDidMount() {
    this.unmounted = false;
  }
  componentWillUnmount() {
    this.unmounted = true;
  }
  pageChangeHandler(e) {
    this.setState({ page: e });
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
  emailChangeHandler(e) {
    this.setState({ userEmail: e })
  }
  render() {
    return (
      <Container className="App d-flex align-items-center align-content-around bg-dark overflow-auto" style={{ width: 480, height: window.innerHeight }}>
        <TopHeader
          backVis={this.state.backVis}
          onBackVisChange={this.backVisHandler}
          forwardVis='hidden'
          step={this.state.step}
          onStepChange={this.stepChangeHandler}
          internalNav={this.state.internalNav}
          onNavChange={this.navChangeHandler}
        ></TopHeader>
        <Page
          page={this.state.page}
          backVis={this.state.backVis}
          onBackVisChange={this.backVisHandler}
          step={this.state.step}
          onStepChange={this.stepChangeHandler}
          internalNav={this.state.internalNav}
          onNavChange={this.navChangeHandler}
          onPageChange={this.pageChangeHandler}
          userEmail={this.state.userEmail}
          onEmailChange={this.emailChangeHandler}
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



export default withAuthenticator(App, {
  includeGreetings: false
});
//export default App
