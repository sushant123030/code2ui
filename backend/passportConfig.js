const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple');
const User = require('./models/UserModel');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const formatApplePrivateKey = (key) => {
  if (!key) return key;
  return key.replace(/\\n/g, '\n');
};

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const fullName = profile.displayName || profile.name?.givenName || 'Google User';
        const profileImage = profile.photos?.[0]?.value || '';
        if (!email) {
          return done(new Error('Google account did not return an email'), null);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          existingUser.provider = 'google';
          existingUser.providerId = profile.id;
          if (!existingUser.profileImage) existingUser.profileImage = profileImage;
          await existingUser.save();
          return done(null, existingUser);
        }

        const newUser = new User({
          fullName,
          name: fullName,
          email,
          profileImage,
          provider: 'google',
          providerId: profile.id,
        });
        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID || '',
      teamID: process.env.APPLE_TEAM_ID || '',
      keyID: process.env.APPLE_KEY_ID || '',
      privateKey: formatApplePrivateKey(process.env.APPLE_PRIVATE_KEY || ''),
      callbackURL: `${BACKEND_URL}/api/auth/apple/callback`,
      passReqToCallback: false,
      scope: ['name', 'email'],
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        const email = profile.email || idToken?.email;
        const givenName = profile.name?.firstName || profile.name?.name || 'Apple User';
        const familyName = profile.name?.lastName || '';
        const fullName = `${givenName} ${familyName}`.trim() || 'Apple User';
        if (!email) {
          return done(new Error('Apple account did not return an email'), null);
        }

        let existingUser = await User.findOne({ providerId: profile.id });
        if (!existingUser) {
          existingUser = await User.findOne({ email });
        }

        if (existingUser) {
          existingUser.provider = 'apple';
          existingUser.providerId = profile.id;
          await existingUser.save();
          return done(null, existingUser);
        }

        const newUser = new User({
          fullName,
          name: fullName,
          email,
          provider: 'apple',
          providerId: profile.id,
        });
        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

module.exports = passport;