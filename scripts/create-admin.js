const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// Thông tin kết nối MongoDB
const uri = "mongodb://127.0.0.1:27017/football-analysis";

// Thông tin user admin mẫu
const adminUser = {
  username: "admin",
  password: "admin123", // Mật khẩu sẽ được mã hóa
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function createAdminUser() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Đã kết nối với MongoDB");

    const db = client.db();
    const users = db.collection("users");

    // Kiểm tra xem user đã tồn tại chưa
    const existingUser = await users.findOne({ username: adminUser.username });
    if (existingUser) {
      console.log("User admin đã tồn tại!");
      return;
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);

    // Tạo user với mật khẩu đã mã hóa
    const result = await users.insertOne({
      ...adminUser,
      password: hashedPassword,
    });

    console.log("Đã tạo user admin thành công!");
    console.log("ID:", result.insertedId);
    console.log("Username:", adminUser.username);
    console.log("Password:", adminUser.password, "(Chưa mã hóa)");
    console.log("Role:", adminUser.role);
  } catch (error) {
    console.error("Lỗi:", error);
  } finally {
    await client.close();
    console.log("Đã đóng kết nối MongoDB");
  }
}

createAdminUser();
