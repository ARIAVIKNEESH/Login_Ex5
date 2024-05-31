const http = require('http');
const querystring = require('querystring');
const mongoose = require('mongoose');

// MongoDB setup
mongoose.connect('mongodb://127.0.0.1:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}) 
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// Server setup
const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    if (req.url === '/register') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        const parsedData = querystring.parse(body);
        const { username, password } = parsedData;
        try {
          const existingUser = await User.findOne({ username });
          if (existingUser) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Username already exists');
          } else {
            const newUser = new User({ username, password });
            await newUser.save();
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Registration successful!');
          }
        } catch (err) {
          console.error('MongoDB save error:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      });
    } else if (req.url === '/login') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        const parsedData = querystring.parse(body);
        const { username, password } = parsedData;
        try {
          const user = await User.findOne({ username });
          if (user && user.password === password) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Login successful!');
          } else {
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end('Invalid username or password');
          }
        } catch (err) {
          console.error('MongoDB find error:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

const PORT = 4002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
