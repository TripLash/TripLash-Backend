const express = require('express');
const router = express.Router();
const guideController = require('../Controllers/guideController');

router.post('/createGuide/' , guideController.createGuide);

module.exports = router;
