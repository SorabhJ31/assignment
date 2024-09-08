const express = require('express');
const router = express.Router();
const { addProducts, viewQuotations } = require('../controllers/productController');
const auth = require('../middlewares/auth');

router.post('/products', auth, addProducts);
router.get('/quotations', auth, viewQuotations);

module.exports = router;
