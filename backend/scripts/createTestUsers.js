const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../src/models/User");

const createTestUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected");

        const passwordHash = await bcrypt.hash("123456", 10);

        const users = [
            {
                name: "Test Admin",
                email: "admin@test.com",
                password: passwordHash,
                role: "admin",
                isActive: true
            },
            {
                name: "Test Site Officer",
                email: "officer@test.com",
                password: passwordHash,
                role: "site_officer",
                site: "Pakri Barwadih Coal Mining Project",
                isActive: true
            }
        ];

        for (const userData of users) {
            const existingUser = await User.findOne({
                email: userData.email
            });

            if (existingUser) {
                console.log(
                    `Already exists: ${userData.email}`
                );
                continue;
            }

            await User.create(userData);

            console.log(
                `Created: ${userData.email} (${userData.role})`
            );
        }

        console.log("Test users setup complete");

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error creating test users:", error);
        process.exit(1);
    }
};

createTestUsers();