
import { Router } from 'express';

import {
  getMahasiswa,
  getMahasiswaDetail,
  addMahasiswa,
  editMahasiswa,
  removeMahasiswa
} from '../controllers/mahasiswaControllers.js';

const router = Router();

router.get('/', getMahasiswa);
router.get('/:id', getMahasiswaDetail);
router.post('/', addMahasiswa);
router.put('/:id', editMahasiswa);
router.delete('/:id', removeMahasiswa);

export default router;
