const express = require('express');
const Model = require('../models/UserModel');
const router = express.Router();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticateToken');


router.post('/add', (req, res) => {
  console.log(req.body);
  // Here you would typically handle the request to add a user


  new Model(req.body).save()
    .then((result) => {
      res.status(200).json(result);
    }).catch((err) => {
      console.log(err);
      res.status(500).json({ err });
    });

});
router.get('/getall', authenticateToken, (req, res) => {
  Model.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});


router.get('/getbyemail/:email', (req, res) => {
  console.log(req.params.email);
  Model.findOne({ email: req.params.email }) //to find the first matching email from params and responds with object and not array and also in case of synatx error it responds with null
    .then((result) => {
      res.status(200).json(result);
    }).catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});


router.get('/getbyid/:id', (req, res) => {
  Model.findById(req.params.id)
    .then((result) => {
      res.status(200).json(result);
    }).catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/getuser', authenticateToken, (req, res) => {
  const userId = req.user.id || req.user._id;
  Model.findById(userId)
    .then((result) => {
      res.status(200).json(result);
    }).catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/delete/:id', (req, res) => {
  Model.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(200).json(result);
    }).catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put('/update', authenticateToken, (req, res) => {
  console.log(req.body);

  const userId = req.user.id || req.user._id;
  Model.findByIdAndUpdate(userId, req.body, { new: true })  //new:true to return the updated document at first send
    .then((result) => {
      res.status(200).json(result);
    }).catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});


router.post('/authenticate', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  Model.findOne({ email, password })
    .then((result) => {
      if (result) {
        //create token
        const { _id, name } = result;
        const secret = process.env.JWT_SECRET;
        
        if (!secret) {
          console.error('JWT_SECRET is not defined in environment variables');
          return res.status(500).json({ message: 'Server configuration error' });
        }
        
        jwt.sign(
          { _id, name },
          secret,
          { expiresIn: '1h' },
          //h=hours, m=minutes, d=days, nothing for seconds
          (err, token) => {
            if (err) {
              console.log('JWT sign error:', err);
              res.status(500).json({ message: 'Error generating token', error: err });
            } else {
              res.status(200).json({ token });
            }
          }
        );

      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    })
    .catch((err) => {
      console.log('Database error:', err);
      res.status(500).json({ message: 'Database error', error: err });
    });
});

module.exports = router;
// const express = require('express');
// const User = require('../models/UserModel');
// const jwt = require('jsonwebtoken');
// const authenticateToken = require('../middleware/authenticateToken');
// const upload = require('../middleware/multer');

// const router = express.Router();

// /* REGISTER */
// router.post('/add', async (req, res) => {
//   try {
//     const user = await new User(req.body).save();
//     res.status(200).json(user);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// /* LOGIN */
// router.post('/authenticate', async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email, password });
//   if (!user) {
//     return res.status(401).json({ message: 'Invalid credentials' });
//   }

//   const token = jwt.sign(
//     { _id: user._id, name: user.name },
//     process.env.JWT_SECRET,
//     { expiresIn: '1h' }
//   );

//   res.status(200).json({ token });
// });

// /* GET LOGGED-IN USER */
// router.get('/getuser', authenticateToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select('-password');
//     res.status(200).json(user);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// /* ✅ UPDATE PROFILE (NO :id — USE JWT) */
// router.put(
//   '/update-profile',
//   authenticateToken,
//   upload.single('profileImage'),
//   async (req, res) => {
//     try {
//       const updateData = {
//         name: req.body.name,
//         email: req.body.email
//       };

//       if (req.file) {
//         updateData.profileImage = req.file.path; // Cloudinary URL
//       }

//       const updatedUser = await User.findByIdAndUpdate(
//         req.user._id,
//         updateData,
//         { new: true }
//       );

//       res.status(200).json(updatedUser);
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   }
// );

// module.exports = router;

