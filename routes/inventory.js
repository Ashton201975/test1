const express = require('express'); 
const req = require('express/lib/request');
const router = express.Router(); 
const moment = require('moment'); 
const Inventory = require('../models/Inventory');
const alertMessage = require('../helpers/messenger');

// Require for file upload
const fs = require('fs');
const upload = require('../helpers/imageUpload');

router.post('/addInventory', (req, res) => { 

    let itemName = req.body.itemName;
    let description = req.body.description.slice(0, 1999);
    let quantity = req.body.quantity;
    let price = req.body.price;
    let totalPrice = req.body.totalPrice;
    let supplierName = req.body.supplierName;
    let supplierPhoneNumber = req.body.supplierPhoneNumber;
    let checkedByStaffName = req.body.checkedByStaffName;
    let importDate = moment(req.body.importDate, 'DD/MM/YYYY'); 
    let expiryDate = moment(req.body.expiryDate, 'DD/MM/YYYY'); 
    let ingredientType = req.body.ingredientType;
    let posterURL = req.body.posterURL; 
    let status = req.body.status; 
    let userId = 1; 
    
    // Multi-value components return array of strings or undefined    
    Inventory.create({ 
        itemName, 
        description, 
        quantity, 
        price,
        totalPrice, 
        supplierName, 
        supplierPhoneNumber,
        checkedByStaffName,
        importDate,
        expiryDate,
        ingredientType,
        status,
        posterURL,
        userId 
        }) .then((inventory) => { 
            res.redirect('/inventory/listInventorys'); 
        }) 
        .catch(err => console.log(err)) 
    });

// List videos belonging to current logged in user 
router.get('/listInventorys', (req, res) => { 
    Inventory.findAll({ 
        where: { 
            // userId: req.user.id 
        }, 
        order: [ 
            // ['title', 'ASC'] 
        ], 
        raw: true 
    }) .then((inventorys) => { 
        // pass object to listVideos.handlebar 
        res.render('inventory/listInventorys', { 
            inventorys
        }); 
    }) 
    .catch(err => console.log(err)); 
});

// Shows edit video page 
router.get('/edit/:id', (req, res) => { 
    Inventory.findOne({ 
        where: { 
            id: req.params.id 
        } 
    }).then((inventory) => {
    // Only authorised user who is owner of the inventory
             
            // call views/video/editVideo.handlebar to render the edit video page 
            res.render('inventory/editInventory', { 
                inventory // passes video object to handlebar 
            });    
    })
            
     
});

// Save edited Inventory
router.put('/saveEditedInventory/:id', (req, res) => {
    let itemName = req.body.itemName;
    let description = req.body.description.slice(0, 1999);
    let quantity = req.body.quantity;
    let price = req.body.price;
    let totalPrice = req.body.totalPrice;
    let supplierName = req.body.supplierName;
    let supplierPhoneNumber = req.body.supplierPhoneNumber;
    let checkedByStaffName = req.body.checkedByStaffName;
    let importDate = moment(req.body.importDate, 'DD/MM/YYYY'); 
    let expiryDate = moment(req.body.expiryDate, 'DD/MM/YYYY'); 
    let ingredientType = req.body.ingredientType; 
    let posterURL = req.body.posterURL;
    let status = req.body.status; 

    Inventory.update({
        itemName,
        description,
        quantity,
        price,
        totalPrice,
        supplierName,
        supplierPhoneNumber,
        checkedByStaffName,
        importDate,
        expiryDate,
        ingredientType,
        posterURL,
        status
    }, {
        where: {
            id: req.params.id
        }
    }).then((inventory) => {
        res.redirect('/inventory/listInventorys')
    }).catch(err => console.log(err))
});

router.get('/delete/:id', (req, res) => {
    Inventory.findOne({
    where: {
        id: req.params.id
        }
    }).then((inventory) => {
        let inventoryitemName = inventory.itemName
            Inventory.destroy({
                where: {
                    id: req.params.id
                }
            }).then(() => {
                alertMessage(res, 'Successfully', inventoryitemName + '  Successfully deleted', 'far fa-trash-alt', true);
                res.redirect('/inventory/listInventorys');
            })
        

            }).catch(err => console.log(err));

        })

 // Upload poster
router.post('/upload', (req, res) => {
    // Create user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)){
        fs.mkdirSync('./public/uploads/' + req.user.id);
    }

    upload(req, res, (err) =>{
        if(err) {
            res.json({file:'/img/no-image.jpg', err: err});
        } else {
            if (req.file === undefined) {
                res.json({file: '/img/no-image.jpg', err: err});
            }else {
                res.json({file:`/uploads/${req.user.id}/${req.file.filename}`});
            }
        }
    });

})   

// Add New Inventory
router.get('/showAddInventory', (req, res) => {
    res.render('inventory/addInventory');
});

module.exports = router;