const express = require('express');
const path = require('path');
const app = express();
const port = 3000;


app.use(express.static(__dirname));


app.use('/css', express.static(path.join(__dirname, 'css')));


app.use('/js', express.static(path.join(__dirname, 'js')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/:page', (req, res) => {
    const page = req.params.page;
    // Only allow specific HTML pages
    const allowedPages = ['login', 'register', 'resources'];
    if (allowedPages.includes(page)) {
        res.sendFile(path.join(__dirname, `${page}.html`));
    } else if (page === 'admin') {
        // Admin page requires authentication
        const token = req.headers.authorization;
        if (!token) {
            res.redirect('/login.html');
            return;
        }
        res.sendFile(path.join(__dirname, 'admin.html'));
    } else {
        res.status(404).send('Page not found');
    }
});


app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 