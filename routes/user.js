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
const PRINCIPAL = "PRINCIPAL";

//teacher zod validation
const teacherSignupSchema = z.object({
  name: z.string(),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long")
});
const teacherSigninSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long")

});

//student zod validation
const studentSignupSchema = z.object({
  name: z.string(),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long")
    
});
const studentSigninSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long")
   
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
    // console.log("User id",user);
    if (!user || user.role !== TEACHER) {
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
      role: user.role,
      userid: user.id,
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

    if (!user || user.role !== STUDENT) {
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
      role: user.role,
      userid: user.id,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ message: "Internal server error while student login" });
  }
});

//principal signin route
router.post("/account/principal/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user || user.role !== PRINCIPAL) {
      return res.status(400).json({ message: "Incorrect credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

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
      message: "Log in successful",
      token: token,
      role: user.role,
      userid: user.id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal server error while principal login",
    });
  }
});

//fetching students by student id
router.get("/classroom/student/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        classroom: {
          include: {
            teacher: {
              select: {
                name: true,
              },
            },
            schedules: true, 
            students: true,
          },
        },
      },
    });

    if (!student || !student.classroom) {
      return res.status(404).send({
        message: "Student or classroom not found",
      });
    }

    res.status(200).send({
      classroomName: student.classroom.name,
      teacherName: student.classroom.teacher?.name,
      students: student.classroom.students,
      schedules: student.classroom.schedules,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal Server Error at fetching student's class details",
      error: err,
    });
  }
});



//fetching students
router.get("/account/student", async (req, res) => {
  try {
    const data = await prisma.user.findMany({
      where: {
        role: STUDENT,
      },
      include: {
        classroom: true,
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

//fething class by classId
router.get("/classroom/:id", async (req, res) => {
  const classroomId = req.params.id;

  try {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        schedules: true,
        students: true,
      },
    });

    if (!classroom) {
      return res.status(404).json({
        message: "Classroom not found",
      });
    }

    res.status(200).json(classroom);
  } catch (error) {
    console.error("Error fetching classroom:", error);
    res.status(500).json({
      message: "Internal Server Error while fetching classroom",
      error: error.message,
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

//fetch classroom by teacherId
router.get("/classroom/teacher/:id", async (req, res) => {
  console.log("Hello");
  const teacherId = req.params.id;
  try {
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      include: {
        teaching: {
          include: {
            schedules: {
              include: {
                lectures: true,
              },
            },
          },
        },
      },
    });

    if (!teacher || !teacher.teaching) {
      return res.status(400).json({
        message: "Classroom not found for the given teacher",
      });
    }

    res.status(200).send(teacher.teaching);
  } catch (error) {
    console.error("Error fetching classroom by teacher ID:", error);
    res.status(500).json({
      message: "Internal Server Error while fetching classroom by teacher ID",
      error: error.message,
    });
  }
});

//defining teacher and principal middleware route
router.use(adminAuthMiddleware);

//fetching students by teacherId
router.get("/teacher/:id/students", async (req, res) => {
  try {
    const teacherId = req.params.id;

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      include: { teaching: true },
    });

    if (!teacher || !teacher.teaching) {
      return res.status(400).send({
        message: "Teacher or classroom not found",
      });
    }

    const students = await prisma.user.findMany({
      where: { classroomId: teacher.teaching.id },
      include: { classroom: true },
    });

    res.status(200).send(students);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal Server Error while fetching students by teacherId",
      error: err.message,
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

//update route for students
router.put("/account/update/student", async (req, res) => {
  try {
    const { success } = await updateSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).send({
        message: "Incorrect Inputs",
      });
    }
    console.log("before");

    const { id, name, email, password, role } = req.body;
    console.log("after");
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
      updatedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal Server Error while updating user",
      error: err,
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
    // const { success } = await classroomSchema.safeParse(req.body);
    // if (!success) {
    //   return res.status(400).send({
    //     message: "Incorrect Inputs",
    //   });
    // }

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

//fetch all classroom with teachers
router.get("/allclassrooms", async (req, res) => {
  try {
    const classrooms = await prisma.classroom.findMany({
      include: {
        teacher: true,
        schedules: {
          select: {
            day: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    res.status(200).send({
      classrooms,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal Server Error while fetching classrooms",
      error: err,
    });
  }
});

//fetching all teachers
router.get("/account/teacher", async (req, res) => {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: "TEACHER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teaching: true,
        // password: false,
      },
    });

    res.status(200).send({
      teachers,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({
      message: "Internal Server Error while fetching teachers",
      error: error.message,
    });
  }
});

//add schedule
router.post("/account/add/schedule", async (req, res) => {
  try {
    console.log("schedule");
    const { classroomId, day, startTime, endTime } = req.body;
    if (!classroomId || !day || !startTime || !endTime)
      res.status(400).send({
        message: "Please enter all fields",
      });
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
    console.log("before");

    const { id, name, email, password, role } = req.body;
    console.log("after");
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
      updatedUser,
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

    const existingTeacherAssignment = await prisma.Classroom.findFirst({
      where: {
        teacherId: teacherID,
      },
    });

    if (existingTeacherAssignment) {
      return res.status(400).send({
        message: `Teacher with id ${teacherID} is already assigned to class with id ${existingTeacherAssignment.id}`,
      });
    }

    const existingClass = await prisma.Classroom.findUnique({
      where: {
        id: classID,
      },
      select: {
        teacherId: true,
      },
    });

    if (existingClass.teacherId) {
      return res.status(400).send({
        message: `Classroom already has a teacher assigned with id ${existingClass.teacherId}`,
      });
    }

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

//unassigning teacher
router.put("/unassign/teacher", async (req, res) => {
  try {
    const { classID } = req.body;

    const existingClass = await prisma.Classroom.findUnique({
      where: {
        id: classID,
      },
      select: {
        teacherId: true,
      },
    });

    if (!existingClass) {
      return res.status(404).send({
        message: `Classroom with id ${classID} not found`,
      });
    }

    if (!existingClass.teacherId) {
      return res.status(400).send({
        message: `Classroom with id ${classID} does not have a teacher assigned`,
      });
    }
    const updatedClass = await prisma.Classroom.update({
      where: {
        id: classID,
      },
      data: {
        teacherId: null,
      },
    });

    res.status(200).send({
      message: `Teacher unassigned from class with id ${classID}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error while unassigning teacher",
    });
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

//deleteing classroom by classid
router.delete("/account/classroom/delete", async (req, res) => {
  try {
    const { classroomId } = req.body;

    if (!classroomId) {
      return res.status(400).send({
        message: "Classroom ID is required",
      });
    }

    const deletedClassroom = await prisma.classroom.delete({
      where: { id: classroomId },
    });

    res.status(200).send({
      message: "Classroom successfully deleted",
      classroom: deletedClassroom,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal Server Error while deleting classroom",
      error: err.message,
    });
  }
});

export { router };
