import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

const adminAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(403).json({});

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.id = decoded.id;

    if (decoded.role == "TEACHER" || decoded.role == "PRINCIPAL") next();
    else res.status(400).send({message:"Not sufficient permission"});


  } catch (err) {
    return res.status(400).send({
      message: "Error authenticating",
      error: err,
    });
  }
};

const principalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(403).json({});

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.id = decoded.id;

    if (decoded.role == "PRINCIPAL") next();
    else res.status(400).send({message:"Not sufficient permission"});


  } catch (err) {
    return res.status(400).send({
      message: "Error authenticating",
      error: err,
    });
  }
};



export { adminAuthMiddleware,principalAuthMiddleware };
