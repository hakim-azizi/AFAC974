const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

// Import access to database tables
const tables = require("../../database/tables");

const login = async (req, res, next) => {
  try {
    // Fetch a specific user from the database based on the provided email
    const user = await tables.user.readByEmailWithPassword(req.body.email);

    if (user == null) {
      res.sendStatus(422);
      return;
    }

    const verified = await argon2.verify(
      user.hashed_password,
      req.body.password 
    );

    if (verified) {
      // Respond with the user and a signed token in JSON format (but without the hashed password)
      delete user.hashed_password;
          // Suppression du mot de passe non haché de la requête par mesure de sécurité
    delete req.body.password;

      const token = await jwt.sign(
        { sub: user.id, isAdmin: user.is_admin },
        process.env.APP_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.json({
        token,
        user,
      });
    } else {
      res.sendStatus(422);
    }
  } catch (err) {
    // Pass any errors to the error-handling middleware
    next(err);
  }
};

const readToken = async (req, res, next) => {
  res.sendStatus(200);
  next();
};

module.exports = {
  login,
  readToken,
};
