process.env.TZ = process.env.TZ || 'Asia/Manila'; // all clock-in times use this timezone

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
require('./models/Employee').ensureAccounts(); // make sure every employee has a login and an admin exists

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

// Serve the built React app in production (npm run build in /client)
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`HRIS server running on http://localhost:${PORT}`));
