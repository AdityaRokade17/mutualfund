const express = require('express');
const router = express.Router();
const leadController = require('../TestingControllers/testingLeadsController');
// const leadController = require('../controllers/leadsController');
const auth = require('../middlewares/auth');

router.post('/create', leadController.createLead);
router.get('/', auth, leadController.getLeads);
router.get('/status-names', leadController.getStatusNames);
router.get('/current-status', auth, leadController.getCurrentStatuses);
router.put('/status/:lead_id', auth, leadController.updateLeadStatus);
router.put('/complete/:lead_id', auth, leadController.markLeadAsCompleted);
router.put('/reassign/:lead_id', auth, leadController.reassignLead);
router.get('/assignment-history/:lead_id', auth, leadController.viewAssignmentHistory);


module.exports = router;
