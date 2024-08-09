import { Router } from "express";
import {router as userRouter} from "./user.js"

const router=Router();


router.use("/user",userRouter);

export {router} ;