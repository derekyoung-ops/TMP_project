import express from 'express';
import {
    upsertWorkLog,
    getWorkLogs 
} from '../controllers/worklogController.js';

const router = express.Router();

router.post('/', upsertWorkLog);
router.get("/", getWorkLogs);

export default router;