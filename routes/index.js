var express = require('express');
var router = express.Router();

/* ===== 메인페이지 ===== */
router.get('/', (req, res) => res.render('pages/main'));

/* ===== 사용자관련 ===== */
router.get('/login', (req, res) => res.render('pages/login'));
router.get('/join', (req, res) => res.render('pages/join'));
router.get('/find-id', (req, res) => res.render('pages/find-id'));
router.get('/find-pw', (req, res) => res.render('pages/find-pw'));
router.get('/reset-pw', (req, res) => res.render('pages/reset-pw'));

/* ===== 사용자페이지 ===== */
router.get('/my-kitchen', (req, res) => res.render('pages/my-kitchen'));

module.exports = router;
