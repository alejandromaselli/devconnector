const router = require('express').Router();
const auth = require('../../middleware/auth');
const UserModel = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

//@route    GET api/auth
//@desc     Test route
//@access   Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)
    } catch (error) {
        console.error(err.message);
        res.status(500).send('server Error', error);
    }
});

//@route    POST api/auth
//@desc     Authenticate user and get token
//@access   Public
router.post(
    '/',
    [
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password', 
            'Password is required'
        ).exists({ min: 6 })
    ],
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body;

        try {

            let user = await UserModel.findOne({ email: email }, (user, error) => { if (error) console.log(error) });


            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] })
            }

            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token })
                }
            );

        } catch (error) {
            console.log('INICIO DEL ERROR', error.message, 'FIN DEL ERROR',);
            res.status(500).send('Server error');
        }
    });

module.exports = router;