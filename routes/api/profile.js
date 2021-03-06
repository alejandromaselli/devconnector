const router = require('express').Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route    GET api/profile/me
//@desc     GET current user's profile
//@access   Private
router.get('/me', auth, async (req, res) => {
    try {

        const profile = await Profile.findOne({ user: req.user.id }).populate('user',
            ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: `There's no profile for this user` })
        }

        res.json(profile);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error')
    }
});

//@route    post api/profile
//@desc     Create or Update user profile
//@access   Private
router.post('/', [auth, [
    check('status', 'status is required')
        .not()
        .isEmpty(),
    check('skills', 'Skills is required')
        .not()
        .isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // Build profile object

    const profileFields = {};

    profileFields.user = req.user.id;

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {}

    if (youtube) profileFields.youtube = youtube;
    if (facebook) profileFields.facebook = facebook;
    if (twitter) profileFields.twitter = twitter;
    if (instagram) profileFields.instagram = instagram;
    if (linkedin) profileFields.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );

            return res.json(profile)
        }

        // Create
        profile = new Profile(profileFields);

        await profile.save();

        res.json(profile);

    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

    res.send('finish');
});

//@route    GET api/profile/
//@desc     GET all profiles
//@access   Private
router.get('/', async (req, res) => {
    try {

        const profiles = await Profile.find().populate('user', ['name', 'avatar']);

        res.json(profiles);

    } catch (error) {

        console.error(error.message);

        res.status(500).send('Server error');

    }
});

//@route    DELETE api/profile
//@desc     Delete profile, user & posts
//@access   Private
router.delete('/', auth, async (req, res) => {
    try {
        //@todo - remove user's posts


        //Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        //Remove user
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User deleted' })

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

//@route    PUT  api/profile
//@desc     Add profile experience
//@access   Private
router.put('/experience',
    [
        auth,
        [
            check('title', 'Title is required')
                .not()
                .isEmpty(),
            check('company', 'Company is required')
                .not()
                .isEmpty(),
            check('from', 'From date is required')
                .not()
                .isEmpty()
        ]
    ],
    async (req, res) => {

        console.log('goes errors');

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.experience.unshift(newExp);

            console.log(newExp);

            await profile.save();

            res.json(profile);

        } catch (error) {
            console.error(error);
            res.json(error);
        }
    }
);

//@route    DELETE  api/profile
//@desc     Add profile experience
//@access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {

        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove index
        const RemoveIndex = profile.experience
            .map(item => { item.id })
            .indexOf(req.params.exp_id);

        profile.experience.splice(RemoveIndex, 1);

        await profile.save();

        res.json(profile)

    } catch (error) {
        console.error(error)
        res.json(error)
    }
});


//@route    PUT api/education
//@desc     Add profile education
//@access   Private
router.put(
    '/education',
    [
        auth,
        [
            check('school', 'School is required')
                .not()
                .isEmpty(),
            check('degree', 'Degree is required')
                .not()
                .isEmpty(),
            check('fieldofstudy', 'Field of study date is required')
                .not()
                .isEmpty(),
            check('from', 'From date is required')
                .not()
                .isEmpty()
        ]
    ],
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.education.unshift(newEdu);

            await profile.save();

            res.json(profile);

        } catch (error) {
            console.error(error);
            res.send('Server Error');
        }
    }
);

//@route    DELETE  api/education
//@desc     Add profile education
//@access   Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {

        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove index
        const RemoveIndex = profile.experience
            .map(item => { item.id })
            .indexOf(req.params.edu_id);

        profile.experience.splice(RemoveIndex, 1);

        await profile.save();

        res.json(profile)

    } catch (error) {
        console.error(error)
        res.json(error)
    }
});

module.exports = router;