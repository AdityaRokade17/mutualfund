const express = require('express');
const router = express.Router();
const userController = require('../controllers/authuserController');
const auth = require('../middlewares/auth');

router.post('/login', userController.login);
router.post('/create-subprofile', auth, userController.createSubprofile);
router.get('/subprofiles', auth, userController.getSubprofiles);
router.put('/subprofile/:id', auth, userController.updateSubprofile);

module.exports = router;
