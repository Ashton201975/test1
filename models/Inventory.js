const Sequelize = require('sequelize');
const sequelize = require('../config/DBConfig');
const db = require('../config/DBConfig');

const Inventory = db.define('inventory', { 
    itemName: { 
        type: Sequelize.STRING 
    }, 
    description: { 
        type: Sequelize.STRING(2000) 
    },
    quantity: { 
        type: Sequelize.INTEGER
    },
    price: { 
        type: Sequelize.FLOAT
    },
    totalPrice: { 
        type: Sequelize.FLOAT
    },
    supplierName: { 
        type: Sequelize.STRING 
    }, 
    supplierPhoneNumber: { 
        type: Sequelize.STRING 
    }, 
    ingredientType: {
        type: Sequelize.STRING
    },
    importDate: { 
        type: Sequelize.DATE 
    },
    expiryDate: { 
        type: Sequelize.DATE 
    },
    checkedByStaffName: { 
        type: Sequelize.STRING
    },
    status: { 
        type: Sequelize.STRING 
    }

});

module.exports = Inventory;