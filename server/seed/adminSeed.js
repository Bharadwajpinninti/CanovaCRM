import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

const seedAdmin = async () => {
  const adminExists = await Admin.findOne({
    email: process.env.ADMIN_EMAIL,
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      10
    );

    await Admin.create({
      firstName: process.env.ADMIN_FIRST_NAME,
      lastName: process.env.ADMIN_LAST_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
    });

    console.log("✅ Admin created from env");
  } else {
    console.log("ℹ️ Admin already exists");
  }
};

export default seedAdmin;
