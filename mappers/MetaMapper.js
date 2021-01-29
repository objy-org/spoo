var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;
var Admin = mongoose.mongo.Admin;

var clientSchema = {
    name: String,
    key: String,
    displayName: String,
    applications: []
};

var ClientSchema = new Schema(clientSchema);

var clientActivationSchema = {
    key: String
};
var ClientActivationSchema = new Schema(clientActivationSchema);


var userRegistrationSchema = {
    email: String,
    client: String,
    key: String,
    date: { type: Date, default: Date.now, expires: '30d' }
};
var UserRegistrationSchema = new Schema(userRegistrationSchema);


var passwordResetSchema = {
    uId: Schema.Types.ObjectId,
    key: String,
    client: String,
    date: { type: Date, default: Date.now, expires: '1d' }
};
var PasswordResetSchema = new Schema(passwordResetSchema);



var MetaMapper = function() {

    this.database = {};

    this.connect = function(connectionString, success, error, options) {
        this.database = mongoose.createConnection(connectionString, options);

        this.database.on('error', function(err) {
            error(err)
        });

        this.database.once('open', function() {
            success();
        });

        return this;
    };

    this.setConnection = function(connection) {
        this.database = connection;
    }

    this.redeemClientRegistration = function(_key, success, error) {

        var db = this.database.useDb('spoo__meta');

        ClientActivation = db.model('ClientActivation', ClientActivationSchema);

        console.log(_key);

        ClientActivation.findOne({ key: _key }, function(err, data) {

            if (err) {
                error(err);
                return;
            }
            if (data == null) {
                error("activation key not found");
                return;
            }

            ClientActivation.remove({ key: _key }, function(err, data) {
                if (err) {
                    error(err);
                    return;
                }

                success(_key);
                return;
            });
        });

    }

    this.createClient = function(_key, clientName, success, error) {

        var db = this.database.useDb(clientName);

        this.database.db.listCollections({ name: 'clientinfos' })
            .next(function(err, collinfo) {
                if (collinfo) {
                    error('Name already taken');
                    return;
                }
                console.log("ignoring err");

                Client = db.model('ClientInfo', ClientSchema);

                var devSecret = shortid.generate() + '' + shortid.generate();

                var newClient = new Client({ name: clientName, key: _key, displayName: clientName });

                newClient.save(function(err, data) {
                    if (err) {
                        console.log("save err");
                        error(err);
                        return;
                    }

                    success(data);
                    console.log('SAVED TO DB');
                })

            });

    }

    this.createClientRegistration = function(success, error) {

        var db = this.database.useDb('spoo__meta');

        ClientActivationKey = db.model('ClientActivation', ClientActivationSchema);

        var newKey = new ClientActivationKey({ _id: null, key: shortid.generate() + shortid.generate() });

        newKey.save(function(err, data) {
            if (err) {
                console.log("save err");
                error(err);
                return;
            }
            console.log('SAVED TO DB');
            console.log(data);
            success(data);
        })

    }


    this.createUserRegistrationKey = function(email, client, success, error) {

        var db = this.database.useDb(client);

        UserRegistration = db.model('UserRegistration', UserRegistrationSchema);

        var newKey = new UserRegistration({ _id: null, client: client, key: shortid.generate() + shortid.generate(), email: email });

        newKey.save(function(err, data) {
            if (err) {
                console.log("save err");
                error(err);
                return;
            }
            console.log(data);
            success(data);
            console.log('SAVED TO DB');
        })

    }

    this.createPasswordResetKey = function(uId, client, success, error) {

        var db = this.database.useDb(client);

        PasswordReset = db.model('PasswordReset', PasswordResetSchema);

        var newKey = new PasswordReset({ _id: null, client: client, key: shortid.generate() + shortid.generate(), uId: uId });

        newKey.save(function(err, data) {
            if (err) {
                console.log("save err");
                error(err);
                return;
            }
            console.log(data);
            success(data);
            console.log('SAVED TO DB');
        })

    }


    this.redeemPasswordResetKey = function(_key, client, success, error) {

        var db = this.database.useDb(client);

        PasswordReset = db.model('PasswordReset', PasswordResetSchema);

        console.log("key", _key);
        PasswordReset.findOne({ key: _key }, function(err, data) {

            if (err) {
                error(err);
                return;
            }
            if (data == null) {
                error("reset key not found");
                return;
            }

            PasswordReset.remove({ key: _key }, function(_err, _data) {
                if (_err) {
                    error(_err);
                    return;
                }

                success(data);
                return;
            });
        });
    }


    this.addClientApplication = function(app, success, error, client) {

        var db = this.database.useDb(client);

        ClientInfo = db.model('ClientInfo', ClientSchema);
        getable = ClientInfo;

        var exists = false;

        getable.find({}).exec(function(err, data) {
            if (err) {
                error(err);
                return;
            }

            exists = data.applications.find(app => app.name == app.name);

            if (exists) {
                error({ message: "applications already exists" });
                return;
            }

            getable.update({
                "$addToSet": {
                    "applications": app
                }
            }, function(err, data) {
                if (err) {
                    error(err);
                    return;
                }
                console.log(data);
                success({ "message": "ok" });
                return;
            });
        });

    }

    this.removeClientApplication = function(appId, success, error, client) {

        var db = this.database.useDb(client);

        ClientInfo = db.model('ClientInfo', ClientSchema);
        getable = ClientInfo;

        var exists = false;

        getable.find({}).exec(function(err, data) {
            if (err) {
                error(err);
                return;
            }

            exists = data.applications.find(app => app.name == appId);

            if (!exists) {
                error({ message: "applications doesn't exist" });
                return;
            }

            getable.update({
                "$pull": {
                    "applications": {
                        "name": appId
                    }
                }
            }, function(err, data) {
                if (err) {
                    error(err);
                    return;
                }
                console.log(data);
                success({ "message": "ok" });
                return;
            });
        });

    }


    this.getClientApplications = function(success, error, client) {

        var db = this.database.useDb(client);

        ClientInfo = db.model('ClientInfo', ClientSchema);
        getable = ClientInfo;

        getable.findOne({}, function(err, data) {
            if (err) {
                error(err);
                return;
            }
            console.log('data:', data);
            if (data.applications) success(data.applications);
            else success(null)
            return;
        });
    }

}

module.exports = MetaMapper;