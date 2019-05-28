
var CONSTANTS = {
    MULTITENANCY: {
        TENANTIDENTIFIER: "tenantIdentifier",
        DATABASE: "database"
    },
    DEFAULTPAGING: 20
}


localStorageMapper = function(connectionString, connectionSuccess, connectionError) {

    this.connectionString = connectionString;

    this.multitenancy = CONSTANTS.MULTITENANCY.TENANTIDENTIFIER;

    var dbConMain = {};

    this.connectInit = function(success, error) {

    };

    this.connectInit(connectionSuccess, connectionError);


    this.setMultiTenancy = function(value) {
        this.multitenancy = value;
    };


    this.closeConnection = function() {

    };


    this.getObjById = function(id, success, error, client) {

        var db;

        if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER) {
            const adapter = new FileSync('db.json')
            db = low(adapter)
        } else if (this.multitenancy == CONSTANTS.MULTITENANCY.DATABASE) {
            const adapter = new FileSync('db' + client + '.json')
            db = low(adapter)
        }

        success(db.get('objects')
            .find({ _id: id })
            .value())

    }


    this.getObjsByCriteria = function(criteria, success, error, client, flags) {
        var db;

        if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER) {
            const adapter = new FileSync('db.json')
            db = low(adapter)
        } else if (this.multitenancy == CONSTANTS.MULTITENANCY.DATABASE) {
            const adapter = new FileSync('db' + client + '.json')
            db = low(adapter)
        }

        // flags contain thigs lik $sort or $page

        success(db.get('objects')
            .find(criteria)
            .value())
    }


    this.aggregateObjsByCriteria = function(aggregation, criteria, success, error, client, flags) {

        var db;

        if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER) {
            const adapter = new FileSync('db.json')
            db = low(adapter)
        } else if (this.multitenancy == CONSTANTS.MULTITENANCY.DATABASE) {
            const adapter = new FileSync('db' + client + '.json')
            db = low(adapter)
        }

        switch (aggregation) {
            case 'count':

                // flags contain thigs lik $sort or $page

                success(db.get('objects')
                    .find(criteria)
                    .value().length)

                break;
            default:
                error();
        }

    }

    this.updateObj = function(spooElement, success, error, client) {

        var db;

        if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER) {
            const adapter = new FileSync('db.json')
            db = low(adapter)
        } else if (this.multitenancy == CONSTANTS.MULTITENANCY.DATABASE) {
            const adapter = new FileSync('db' + client + '.json')
            db = low(adapter)
        }

        success(db.get('objects')
            .find({ _id: spooElement._id })
            .assign(spooElement)
            .write())

    };

    this.addObj = function(spooElement, success, error, client) {

        var db;


        if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER) {
            const adapter = new FileSync('db.json')
            db = low(adapter)
        } else if (this.multitenancy == CONSTANTS.MULTITENANCY.DATABASE) {
            const adapter = new FileSync('db' + client + '.json')
            db = low(adapter)
        }


        db.defaults({ objects: [] })
            .write()


        db.get('objects')
            .push(spooElement)
            .write()

        success(spooElement);


    };

    this.removeObj = function(spooElement, success, error, client) {

        var db;

        if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER) {
            const adapter = new FileSync('db.json')
            db = low(adapter)
        } else if (this.multitenancy == CONSTANTS.MULTITENANCY.DATABASE) {
            const adapter = new FileSync('db' + client + '.json')
            db = low(adapter)
        }

        success(db.get('objects')
            .remove({ _id: spooElement._id })
            .write())
    };


}

module.exports = localStorageMapper;