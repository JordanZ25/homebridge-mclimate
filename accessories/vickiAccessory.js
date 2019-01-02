const axios = require('../utils/apiClient.js');
class VickiAccessory {
    constructor(log, config) {
        this.log = log;
        this.name = config["name"];
        this.vickiName = config["vicki_name"] || this.name;
        this.binaryState = 0;
        this.log("Starting a Vicki with name '" + this.vickiName + "'...");
        this.serial_number = config['serial_number'];
        this.access_token = config['access_token'];
        this.refresh_token = config['refresh_token'];
        this.apiClient = (new axios(this.access_token, this.refresh_token)).instance;
    }

    getCurrentTemperature(callback) {
        this.apiClient.post('provider/fetch', {
            "serial_number": this.serial_number
        }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.access_token
                }
            }).then(function (response) {
                var temp = response.data.provider.temperature;
                callback(null, temp)
            })
    }
    setTargetTemperature(value, callback) {
        this.apiClient.get('controllers/' + this.serial_number, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.access_token,
                'Accept-Response': 'Advanced'
            }
        }).then((response) => {
            
            this.apiClient.post('provider/send', {
                "serial_number": this.serial_number,
                "command" : "set_motor_position",
                "position" : value
            }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.access_token
                    }
                }).then((response) => {
                    console.log("Set the Temperature on '%s' to %s", this.vickiName, value);
                })
        })
        callback(null);
    }
    getTargetTemperature(callback) {

        this.apiClient.post('provider/fetch', {
            "serial_number": this.serial_number
        }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.access_token
                }
            }).then(function (response) {
                var displayDigits = response.data.provider.displayDigits;
                callback(null, displayDigits)
            })
    }
    
    getServices() {
        let vickiService = new Service.Thermostat(this.name);

        vickiService.getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', this.getCurrentTemperature.bind(this));

        vickiService.getCharacteristic(Characteristic.TargetTemperature)
            .on('set', this.setTargetTemperature.bind(this))
            .on('get', this.getTargetTemperature.bind(this))

        return [vickiService];
    }
}
module.exports = VickiAccessory