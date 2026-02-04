import express from 'express';
import {
    upsertWorkLog,
    getWorkLogs,
    addTimeToMember, 
} from '../controllers/worklogController.js';

const router = express.Router();

router.post('/', upsertWorkLog);
router.get("/", getWorkLogs);
router.post('/add-time', addTimeToMember);

export default router;