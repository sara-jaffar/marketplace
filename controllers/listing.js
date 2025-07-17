const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const isSignedIn = require('../middleware/is-signed-in');

// VIEW NEW LISTING FORM
router.get('/new', (req, res) => {
    res.render('listings/news.ejs')
})

// POST FORM DATA TO THE DATABASE
router.post('/', async (req, res) => {
    try {
        req.body.seller = req.session.user._id;
        await Listing.create(req.body);
        res.redirect('/listings')
    } catch(error) {
        console.log(error);
        res.send('something went wrong');
    }
})

// VIEW INDEX PAGE
router.get('/', async (req, res) => {
   const foundListings =  await Listing.find();
   console.log(foundListings);
   res.render('listings/index.ejs', { foundListings: foundListings});
})

// VIEW A SINGLE LISTING (SHOW PAGE)
router.get('/:listingId', async (req, res) => {
    try {
        const foundListing = await Listing.findById(req.params.listingId).populate('seller').populate('comments.author');
        console.log(foundListing);
        console.log(req.session.user);
        res.render('listings/show.ejs', { foundListing: foundListing });
    } catch(error) {
        console.log(error);
        res.redirect('/');
    }
})

// DELETE LISTING FROMM THE DATABASE
router.delete('/:listingId', async (req, res) => {
    // find the listing
    const foundListing = await Listing.findById(req.params.listingId).populate('seller');
    // check if the logged in user owns the listing
    if (foundListing.seller._id.equals(req.session.user._id)) {
        // delete the listing and redirect
        await foundListing.deleteOne()
        return res.redirect('/listings')
    }
    return res.send('Not authorized')
})

//RENDER THE EDIT FORM VIEW
router.get('/:listingId/edit', async (req, res) => {
    const foundListing = await Listing.findById(req.params.listingId).populate('seller');
    if (foundListing.seller._id.equals(req.session.user._id)) {
        return res.render('listings/edit.ejs', { foundListing: foundListing});
    } 
    return res.send('Not authorized');
})

router.put('/:listingId', async (req, res) => {
    const foundListing = await Listing.findById(req.params.listingId).populate('seller');

    if (foundListing.seller._id.equals(req.session.user._id)) {
        await Listing.findByIdAndUpdate(req.params.listingId, req.body, { new: true });
        return res.redirect(`/listings/${req.params.listingId}`);
    } 
    return res.send('Not authorized');
})

// POST COMMENT FORM TO THE DATABASE
router.post('/:listingId/comments', isSignedIn, async (req, res) => {
    const foundListing = await Listing.findById(req.params.listingId)
    req.body.author = req.session.user._id
    console.log(req.body)
    foundListing.comments.push(req.body)
    await foundListing.save()
    res.redirect(`/listings/${req.params.listingId}`)
})

module.exports = router;