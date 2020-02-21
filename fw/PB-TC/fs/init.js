load('api_config.js');
load('api_timer.js');
load('api_shadow.js');
load('api_gpio.js');
load('api_dht.js');
load('api_rpc.js');

//output pins
let lightPin = Cfg.get('potbot.lightPin');
let exFanPin = Cfg.get('potbot.exFanPin');
let inFanPin = Cfg.get('potbot.inFanPin');
let watPin = Cfg.get('potbot.watPin');

//GPIO setup
GPIO.set_mode(lightPin, GPIO.MODE_OUTPUT);
GPIO.set_mode(exFanPin, GPIO.MODE_OUTPUT);
GPIO.set_mode(inFanPin, GPIO.MODE_OUTPUT);
GPIO.set_mode(watPin, GPIO.MODE_OUTPUT);

//dht sensor setup
let dhtPin = Cfg.get('potbot.dhtPin');
let dht = DHT.create(dhtPin, DHT.DHT22);

//shadow object
let state = {
    name: Cfg.get('potbot.name'),
    temperature: 0,
    temperatureSetting: 75,
    humidity: 0,
    humiditySetting: 40,
    light: true,
    intakeFan: true,
    exhaustFan: true,
    water: false,
    lightOnHour: 0,
    lightOnMinute: 0,
    lightTime: Cfg.get('potbot.lightTime'),
    lightTimer: 16, //hours
    waterTime: Cfg.get('potbot.waterTime'),
    waterTimer: 20, //seconds
    fanTime: Cfg.get('potbot.fanTime'),
    fanTimer: 2, //fan alternates every x hours,
    manual: false
};

let waterRunning = false; //true when water function is active

//shadow handler
Shadow.addHandler(function (event, obj) {
    if (event === 'CONNECTED') {
        // Connected to shadow - report our current state.
        Shadow.update(0, state);
    } else if (event === 'UPDATE_DELTA') {
        // Got delta. Iterate over the delta keys, handle those we know about.
        for (let key in obj) {
            if (key === 'name') {
                state.name = obj.name;
                print('Device Name: ', state.name);
            };
            if (key === 'manual') {
                state.manual = obj.manual;
                print('Manual Mode: ', state.manual);
            };
            if (key === 'light') {
                state.light = obj.light;
                print('Light:', state.light);
            };
            if (key === 'intakeFan') {
                state.intakeFan = obj.intakeFan;
                print('intake fan:', state.light);
            };
            if (key === 'exhaustFan') {
                state.exhaustFan = obj.exhaustFan;
                print('exhaust fan:', state.exhaustFan);
            };
            if (key === 'water') {
                state.water = obj.water;
                print('watering:', state.water);
            };
            if (key === 'temperatureSetting') {
                state.temperatureSetting = obj.temperatureSetting;
                print('new temperature setting: ', state.temperatureSetting);
            }
            if (key === 'humiditySetting') {
                state.humiditySetting = obj.humiditySetting;
                print('new humidity setting: ', state.humiditySetting);
            };
            if (key === 'lightOnHour') {
                state.lightOnHour = obj.lightOnHour;
                print('Light On Hour:', state.lightOnHour);
            };
            if (key === 'lightOnMinute') {
                state.lightOnMinute = obj.lightOnMinute;
                print('Light On Minute:', state.lightOnMinute);
            };
            if (key === 'lightTime') {
                state.lightTime = obj.lightTime;
                Cfg.set({ potbot: { lightTime: state.lightTime } });
                print('new light time: ', state.lightTime);
            };
            if (key === 'lightTimer') {
                state.lightTimer = obj.lightTimer;
                print('light will stay on for: ', state.lightTimer, ' hours');
            }
            if (key === 'waterTime') {
                state.waterTime = obj.waterTime;
                Cfg.set({ potbot: { lightTime: state.waterTime } });
                print('new watering time: ', state.waterTime);
            };
            if (key === 'waterTimer') {
                state.waterTimer = obj.waterTimer;
                print('will water for (seconds):', state.waterTimer, ' seconds');
            };
            if (key = 'fanTime') {
                state.fanTime = obj.fanTime;
                Cfg.set({ potbot: { lightTime: state.lightTime } });
                print('fan will turn on initially at: ', state.fanTime);
            };
            if (key === 'fanTimer') {
                state.fanTimer = obj.fanTimer;
                print('fan will alternate every', state.fanTimer, 'hours');
            };
        };
        // Once we've done synchronising with the shadow, report our state.
        Shadow.update(0, state);
    };
});

//this loop sets state values based on sensor and time data
Timer.set(1000, Timer.REPEAT, function () {
    //get time
    let now = Timer.now(); //returns epoch time (seconds since 1/1/1970)
    print('Now: ', now);
    let time = now % 86400; //divides epoch time by seconds in a day; remainder is seconds since midnight
    print('Time: ', time);

    //get seconds since midnight from light on time
    let hoursSeconds = state.lightOnHour * 3600;
    let minutesSeconds = state.lightOnMinute * 60;
    state.lightTime = hoursSeconds + minutesSeconds;
    Cfg.set({ potbot: { lightTime: state.lightTime } });

    //adjust light off time for overflow into next day
    let lightOffTime = function() {
        if (state.lightTime + (state.lightTimer * 3600) > 86400) {
            return (state.lightTime + (state.lightTimer * 3600)) - 86400;
        } else {
            return state.lightTime + (state.lightTimer * 3600);
        };
    };
    print('Light Off Time: ', lightOffTime())

    //water 10 minutes after light turns on
    if (state.lightTime > 0) {
        state.waterTime = state.lightTime + 600;
        Cfg.set({ potbot: { waterTime: state.waterTime } });
    };

    //fans turn on initially when light turns on
    if (state.fanTime === 0 && state.lightTime > 0) {
        state.fanTime = state.lightTime;
    }

    //get temp/humid
    let tempC = dht.getTemp();
    let tempF = (tempC * 1.8) + 32;
    if (Cfg.get('potbot.metric')) {
        state.temperature = tempC;
    } else {
        state.temperature = tempF;
    };
    print('temperature: ', state.temperature);
    state.humidity = dht.getHumidity();
    print('humidity: ', state.humidity);

    if (!state.manual) { //if manual mode is off
        //compare temp/humid to settings, act accordingly
        if (state.temperature > state.temperatureSetting) {
            state.intakeFan = true;
            state.exhaustFan = true;
        };
        if (state.temperature < state.temperatureSetting) {
            state.intakeFan = false;
            state.exhaustFan = false;
        };
        if (state.humidity > state.humiditySetting) {
            state.exhaustFan = true;
        };
        if (state.humidity < state.humiditySetting) {
            state.exhaustFan = false;
        };

        //compare time to timers, act accordingly 
        if (time >= state.lightTime && time <= lightOffTime()) {
            state.light = true;
        };
        if (time >= lightOffTime() && time <= state.lightTime) { 
            state.light = false;
        };
        if (time === state.fanTime) {
            state.intakeFan = true
            state.exhaustFan = true;
        };
        if (time === state.fanTime + (state.fanTimer * 3600)) {
            state.intakeFan = false;
            state.exhaustFan = false;
            state.fanTime = time + (state.fanTimer * 3600); //set fan on time to x hours from now
        };
        if (time === state.waterTime) {
            state.water = true;
        };
    };

}, null);

RPC.addHandler('Water', function () {
    state.water = false;
    GPIO.write(watPin, 1);
    Timer.set(state.waterTimer * 1000, 0, function () {
        GPIO.write(watPin, 0);
    }, null);
    waterRunning = false;
});

//this loop sets outputs based on state values
Timer.set(1000, Timer.REPEAT, function () {
    GPIO.write(lightPin, state.light ? 1 : 0); //change back to 0 : 1 before final versioning
    GPIO.write(inFanPin, state.intakeFan ? 1 : 0);
    GPIO.write(exFanPin, state.exhaustFan ? 1 : 0);
    if (state.water && !waterRunning) {
        waterRunning = true;
        RPC.call(RPC.LOCAL, 'Water', null, function (resp, err_code, err_msg, ud) {
            if (err_code !== 0) {
              print("Error: (" + JSON.stringify(err_code) + ') ' + err_msg);
            } else {
              print('Result: ' + JSON.stringify(result));
            }
          });
    };
}, null);