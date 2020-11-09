const router = require('express').Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');

const UserModel = require('../../models/User');
const User = require('../../models/User');

//@route    POST api/users
//@desc     Register user
//@access   Public
router.post(
    '/',
    [
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with more than 6 characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { name, email, password } = req.body;

        try {

            let user = await UserModel.findOne({ email: email }, () => console.log('termino busqueda de usuario'));

            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User with that email already exist' }] });
            }

            // Get user's Gravatar

            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });

            user = new User({
                name,
                email,
                avatar,
                password
            });

            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 3600 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token })
                }
            )

        } catch (error) {
            console.log('INICIO DEL ERROR', error.message, 'FIN DEL ERROR',);
            res.status(500).send('Server error');
        }
    });

module.exports = router;

