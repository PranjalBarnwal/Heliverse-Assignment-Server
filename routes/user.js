import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { adminAuthMiddleware, principalAuthMiddleware } from "../middleware.js";

config();
const router = Router();
const prisma = new PrismaClient();
const TEACHER = "TEACHER";
const STUDENT = "STUDENT";

//teacher zod validation
const teacherSignupSchema = z.object({
  name: z.string(),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character"),
});
const teacherSigninSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character"),
});

//student zod validation
const studentSignupSchema = z.object({
  name: z.string(),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character"),
});
const studentSigninSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character"),
});

//user update zod validation
const updateSchema = z.object({
  id: z.string(),
  email: z.string().email("Invalid email address").optional(),
  name: z.string().optional(),
  role: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character")
    .optional(),
});

//classroom zod validation
const classroomSchema = z.object({
  name: z.string(),
});

//teacher signin signup routes
router.post("/account/teacher/signup", async (req, res) => {
  try {
    const { success } = teacherSignupSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).send({
        message: "Incorrect Inputs",
      });
    }

    const existingUser = await prisma.User.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (existingUser) {
      return res.status(400).send({
        message: "Email already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await prisma.User.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: TEACHER,
      },
    });

    const token = await jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    return res.status(200).send({
      message: "Profile created successfully",
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error at teacher signup");
  }
});

router.post("/account/teacher/signin", async (req, res) => {
  try {
    const { success } = teacherSigninSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).send({
        message: "Incorrect Inputs",
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Incorrect credentials" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res.status(400).send({
        message: "Incorrect Password",
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    return res.status(200).send({
      message: "Log in successfull",
      token: token,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ message: "Internal server error while teacher login" });
  }
});

//student signin signup routes
router.post("/account/student/signup", async (req, res) => {
  try {
    const { success } = studentSignupSchema.safeParse(req.body);
    if (!success) {
      return res.status.send({
        message: "Incorrect Inputs",
      });
    }

    const existingUser = await prisma.User.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (existingUser) {
      return res.status(400).send({
        message: "Email already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await prisma.User.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: STUDENT,
      },
    });

    const token = await jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    return res.status(200).send({
      message: "Profile created successfully",
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error at student signup");
  }
});

router.post("/account/student/signin", async (req, res) => {
  try {
    const { success } = studentSigninSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).send({
        message: "Incorrect Inputs",
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Incorrect credentials" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res.status(400).send({
        message: "Incorrect Password",
      });
    }

    const token = await jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    return res.status(200).send({
      message: "Log in successfull",
      token: token,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ message: "Internal server error while student login" });
  }
});

//fetching students
router.get("/account/student", async (req, res) => {
  try {
    const data = await prisma.user.findMany({
      where: {
        role: STUDENT,
      },
    });

    console.log(data);

    res.status(200).send({
      data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal Server Error at fetching all students",
      error: err,
    });
  }
});

//fetching timetable by classId
router.get("classroom/:classId/timetable", async (req, res) => {
  try {
    const classroomId = req.params.classId;

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        schedules: {
          include: {
            lectures: true,
          },
        },
      },
    });

    if (!classroom) {
      return res.status(400).send({
        message: "Classroom not found",
      });
    }

    res.status(200).send(classroom);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal Server Error while fetching timetable",
      error: err.message,
    });
  }
});


//defining teacher and principal middleware route
router.use(adminAuthMiddleware);

//fetching students by classId
router.get("/classroom/:id/students", async (req, res) => {
  try {
    const classroomId = req.params.id;

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: { students: true },
    });

    if (!classroom) {
      return res.status(400).send({
        message: "Classroom not found",
      });
    }

    res.status(200).send(classroom.students);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal Server Error while fetching students by classId",
      error: err.message,
    });
  }
});
//fetching all teachers
router.get("/account/teacher", async (req, res) => {
  console.log("student accounts");
  try {
    const data = await prisma.user.findMany({
      where: {
        role: TEACHER,
      },
    });

    res.status(200).send({
      data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal Server Error at fetching all teachers",
      error: err,
    });
  }
});

router.post("/account/add/lecture", async (req, res) => {
  try {
    const { scheduleId, subject, startTime, endTime } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return res.status(404).send({
        message: "Schedule not found",
      });
    }

    if (start < schedule.startTime || end > schedule.endTime) {
      return res.status(400).send({
        message: "Lecture timings are out of schedule timing",
      });
    }
    const overlappingLectures = await prisma.lecture.findMany({
      where: {
        scheduleId: scheduleId,
        OR: [
          {
            startTime: { lt: end },
            endTime: { gt: start },
          },
        ],
      },
    });

    if (overlappingLectures.length > 0) {
      return res.status(400).send({
        message: "Lecture timings overlap with existing lectures",
      });
    }
    const lecture = await prisma.lecture.create({
      data: {
        scheduleId: scheduleId,
        subject,
        startTime: start,
        endTime: end,
      },
    });

    res.status(200).send({
      message: `Lecture ${subject} added successfully in the schedule`,
      lecture,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error while adding lecture",
    });
  }
});

//deleting user route
router.delete("/account/student/delete", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).send({
        message: "User ID is required",
      });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: userId, role: STUDENT },
    });

    res.status(200).send({
      message: "User successfully deleted",
      user: deletedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal Server Error while deleting user",
      error: err.message,
    });
  }
});
//defining principal middleware
router.use(principalAuthMiddleware);

//classroom creation
router.post("/account/classroom", async (req, res) => {
  try {
    const { success } = await classroomSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).send({
        message: "Incorrect Inputs",
      });
    }

    const classroom = await prisma.Classroom.create({
      data: {
        name: req.body.name,
      },
    });
    return res.status(200).send({
      message: "Class created successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error at classroom creation");
  }
});

router.post("/account/add/schedule", async (req, res) => {
  try {
    const { classroomId, day, startTime, endTime } = req.body;

    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        classroomId: classroomId,
        day: day,
      },
    });

    if (existingSchedule) {
      return res.status(400).send({
        message: "Classroom already has a schedule on this day",
      });
    }

    const schedule = await prisma.schedule.create({
      data: {
        classroomId: classroomId,
        day,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    res.status(200).send({
      message: `schedule created for class with id ${classroomId}`,
      schedule,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error while adding schedule",
    });
  }
});
//update route
router.put("/account/update", async (req, res) => {
  try {
    const { success } = await updateSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).send({
        message: "Incorrect Inputs",
      });
    }

    const { id, name, email, password, role } = req.body;
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return res.status(200).send({
      message: "User updated successfully",
      id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal Server Error while updating user",
      error: err,
    });
  }
});

//assigning users route
router.put("/assign/teacher", async (req, res) => {
  try {
    const { teacherID, classID } = req.body;

    // check for already assigned entries

    const updatedClass = await prisma.Classroom.update({
      where: {
        id: classID,
      },
      data: {
        teacherId: teacherID,
      },
    });

    if (updatedClass)
      res.status(200).send({
        message: `${teacherID} assigned to class with id ${classID}`,
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Internal Server Error while assigning teacher" });
  }
});

router.put("/assign/student", async (req, res) => {
  try {
    const { studentID, classID } = req.body;

    // check for already assigned entries

    const updatedStudent = await prisma.User.update({
      where: {
        id: studentID,
      },
      data: {
        classroomId: classID,
      },
    });

    if (updatedStudent)
      res.status(200).send({
        message: `${studentID} assigned to class with id ${classID}`,
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Internal Server Error while assigning teacher" });
  }
});

//deleting user route
router.delete("/account/teacher/delete", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).send({
        message: "User ID is required",
      });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: userId, role: TEACHER },
    });

    res.status(200).send({
      message: "User successfully deleted",
      user: deletedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal Server Error while deleting user",
      error: err.message,
    });
  }
});

export { router };
