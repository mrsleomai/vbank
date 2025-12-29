const express = require('express');
const path = require('path');
const app = express();
const PORT = 5500;

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(express.static(path.join(__dirname)));

// Маршруты для HTML страниц
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/cards', (req, res) => {
    res.sendFile(path.join(__dirname, 'cards.html'));
});

app.get('/security', (req, res) => {
    res.sendFile(path.join(__dirname, 'security.html'));
});

app.get('/articles', (req, res) => {
    res.sendFile(path.join(__dirname, 'articles.html'));
});

// Normalize trailing slash and serve article pages without .html
app.get('/articles/', (req, res) => {
    res.redirect(301, '/articles');
});

app.get('/articles/115-fz', (req, res) => {
    res.sendFile(path.join(__dirname, 'articles', '115-fz.html'));
});
app.get('/articles/choose-card', (req, res) => {
    res.sendFile(path.join(__dirname, 'articles', 'choose-card.html'));
});
app.get('/articles/finance-basics', (req, res) => {
    res.sendFile(path.join(__dirname, 'articles', 'finance-basics.html'));
});
app.get('/articles/investing', (req, res) => {
    res.sendFile(path.join(__dirname, 'articles', 'investing.html'));
});

app.get('/articles/card-security', (req, res) => {
    res.sendFile(path.join(__dirname, 'articles', 'card-security.html'));
});

app.get('/contacts', (req, res) => {
    res.sendFile(path.join(__dirname, 'contacts.html'));
});

app.get('/sitemap', (req, res) => {
    res.sendFile(path.join(__dirname, 'sitemap.html'));
});

// Страница 404
app.get('/404', (req, res) => {
    res.sendFile(path.join(__dirname, '404.html'));
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});