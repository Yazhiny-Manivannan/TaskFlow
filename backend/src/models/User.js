const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple email format check: something@something.something, with no spaces.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [50, 'Full name must be at most 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // creates a database index that blocks duplicate emails
      lowercase: true, // "Bob@X.com" and "bob@x.com" become the same email
      trim: true,
      maxlength: [100, 'Email must be at most 100 characters'],
      match: [EMAIL_REGEX, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      maxlength: [72, 'Password must be at most 72 characters'],
      select: false, // the password hash is NOT returned by queries unless we ask
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// HOOK: runs before every save. Hashes the password if it is new or changed.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return; // password unchanged, so do not hash it again
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// METHOD: checks a typed password against the stored hash.
userSchema.methods.matchPassword = function (typedPassword) {
  return bcrypt.compare(typedPassword, this.password);
};

// Whenever a user is converted to JSON, remove the password and internal fields.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);