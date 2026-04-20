// const jwt = require('jsonwebtoken');

// // IMPORTANT: Store your secret key securely in a .env file
// // process.env.JWT_SECRET should be a long, complex, random string.
// const SECRET_KEY = process.env.JWT_SECRET || 'your-fallback-secret'; 

// function authenticateToken(req, res, next) {
//     // 1. Get the Authorization header
//     const authHeader = req.headers['authorization']; 
//     // console.log(req.headers);
    
//     // The token format is typically 'Bearer TOKEN_STRING'. 
//     // We split it to get just the TOKEN_STRING.
//     const token = authHeader && authHeader.split(' ')[1];

//     // 2. Check if the token is missing
//     if (token == null) {
//         // 401 Unauthorized: The request requires user authentication
//         return res.status(401).json({ message: 'Authentication failed: No token provided' });
//     }

//     // 3. Verify the token
//     jwt.verify(token, SECRET_KEY, (err, user) => {
//         // If there's an error (e.g., token expired, invalid signature)
//         if (err) {
//             // 403 Forbidden: The server understood the request, but refuses to fulfill it (invalid token)
//             console.error('JWT Verification Error:', err.message);
//             return res.status(403).json({ message: 'Authentication failed: Invalid token' });
//         }

//         // 4. If the token is valid, attach the decoded user payload to the request
//         // This makes user data (like user ID) available in the route handler (req.user)
//         req.user = user;
        
//         // Move on to the next handler function (the route logic)
//         next();
//     });
// }

// module.exports = authenticateToken;
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // 1️⃣ No Authorization header
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // 2️⃣ Extract token
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Malformed token' });
  }

  // 3️⃣ Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT error:', err.message);

      return res.status(403).json({
        message: err.name === 'TokenExpiredError'
          ? 'Token expired'
          : 'Invalid token'
      });
    }

    // 4️⃣ Attach decoded payload
    req.user = decoded; // {_id, name}
    next();
  });
}

module.exports = authenticateToken;
