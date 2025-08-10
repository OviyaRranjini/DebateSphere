const express = require('express');
const router = express.Router();
const debateController = require('../controllers/debateController');
const authMiddleware = require('../middleware/auth');

// You can protect this route with authentication middleware if needed
router.post('/otp/send', debateController.sendOtpHandler);
router.post('/otp/verify', debateController.verifyOtpHandler);
router.post('/', debateController.addDebate);
router.get('/', debateController.listAll);
router.get('/mine', authMiddleware,debateController.listMine);
router.post('/:id/register', authMiddleware,debateController.register);
router.get('/:id', debateController.getById);
router.delete('/:id', authMiddleware, debateController.deleteDebate);
router.get('/byKey/:debateKey', debateController.getDebateByKey);

module.exports = router;
