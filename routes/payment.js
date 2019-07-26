const express = require('express');
const router = express.Router();
const request = require('request');
const Donor = require('../models/donor');
const _ = require('lodash')
const {initializePayment, verifyPayment} = 
require('../config/paystack') (request);

// paystack/pay route
router.get('/pay', (req, res) => {
  res.render('payForm')
})

router.post('/pay', (req, res) => {
    if(req.body === "" || req.body.email.length < 7 ) {
        req.flash("error", "Please enter the correct details")
    }
    const form = {
        full_name: req.body.full_name,
        email: req.body.email,
        amount: req.body.amount
    }
    form.metadata = {
        full_name: form.full_name
    }
    form.amount *= 100;
    initializePayment(form, (error, body)=>{
        if(error){
            //handle errors
            res.status(400).send('something went wrong')
            console.log(error);
            return;
        }
        response = JSON.parse(body);
       res.redirect(response.data.authorization_url)
    }) 
})

router.get('/callback',  (req, res) => {
    const ref = req.query.reference;
    verifyPayment(ref, (error, body) => {
        if(error) {
            res.status(400).send('something went wrong')
            console.log(error)
        }
        response = JSON.parse(body)
        console.log(response)
        const data = {
            reference: response.data.reference,
            amount: response.data.amount,
            email: response.data.customer.email,
            full_name: response.data.metadata.full_name
        }
    
     const donor = new Donor(data)
     donor.save()
     .then((donor) => {
       if(donor) {
        req.flash("success", "payment successful")
           res.redirect('/paystack/receipt/' + donor.id);
       }
     })
     .catch((error) => {
        res.status(400).send('something went wrong');
      }) 
    })
})

router.get('/receipt/:id', async (req, res) => {
     try {
        const donors = await Donor.findById(req.params.id)
        console.log(donors)
        res.render('receipt', { donors })
     } catch (error) {
         res.status(400).send('something went wrong')
     }
})

module.exports = router;