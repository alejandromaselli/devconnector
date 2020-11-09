const router = require('express').Router();
const auth = require('../../middleware/auth');
const mongoose = require('mongoose');
const User = require('../../models/User');

//@route    GET api/auth
//@desc     Test route
//@access   Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)
    } catch (error) {
        console.error(err.message);
        res.status(500).send('server Error');
    }
});

module.exports = router;