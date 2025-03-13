import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Tải biến môi trường
dotenv.config();

// Thông tin kết nối MongoDB
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/football-analysis";

// Dữ liệu mẫu cho leagues
const leaguesSeedData = [
  {
    name: "Premier League",
    country: "England",
    season: "2023-2024",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "La Liga",
    country: "Spain",
    season: "2023-2024",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Serie A",
    country: "Italy",
    season: "2023-2024",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Bundesliga",
    country: "Germany",
    season: "2023-2024",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Dữ liệu mẫu cho users (KTV)
const usersSeedData = [
  {
    username: "ktv001",
    password: "password123", // Sẽ được mã hóa
    fullName: "Nguyễn Văn A",
    email: "ktv001@example.com",
    role: "ktv",
    status: "active",
    isOnline: true,
    lastLogin: new Date(),
    currentTasks: 2,
    totalTasksCompleted: 150,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    username: "ktv002",
    password: "password123", // Sẽ được mã hóa
    fullName: "Trần Thị B",
    email: "ktv002@example.com",
    role: "ktv",
    status: "active",
    isOnline: false,
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 ngày trước
    currentTasks: 1,
    totalTasksCompleted: 120,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Hàm tạo dữ liệu mẫu cho matches dựa trên leagues đã tạo
const createMatchesSeedData = (leagueIds) => {
  return [
    {
      leagueId: leagueIds[0], // Premier League
      homeTeam: {
        name: "Manchester United",
        logo: "/logos/mu.png",
        score: 2,
      },
      awayTeam: {
        name: "Liverpool",
        logo: "/logos/liverpool.png",
        score: 1,
      },
      matchDate: new Date("2024-03-15T20:00:00Z"),
      kickoffTime: "20:00",
      venue: {
        name: "Old Trafford",
        city: "Manchester",
      },
      status: "scheduled",
      round: "Vòng 28",
      analysis: {
        isAnalyzed: false,
        articles: [],
        aiAnalysis: {
          content: "",
          generatedAt: null,
          status: "pending",
        },
        wordpressPost: {
          postId: "",
          status: "draft",
          publishedAt: null,
          url: "",
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      leagueId: leagueIds[1], // La Liga
      homeTeam: {
        name: "Real Madrid",
        logo: "/logos/real.png",
        score: 3,
      },
      awayTeam: {
        name: "Barcelona",
        logo: "/logos/barca.png",
        score: 2,
      },
      matchDate: new Date("2024-03-16T21:00:00Z"),
      kickoffTime: "21:00",
      venue: {
        name: "Santiago Bernabéu",
        city: "Madrid",
      },
      status: "scheduled",
      round: "Vòng 29",
      analysis: {
        isAnalyzed: true,
        articles: [
          {
            title: "El Clásico Preview",
            url: "https://example.com/article1",
            source: "Marca",
          },
        ],
        aiAnalysis: {
          content: "Phân tích trận đấu...",
          generatedAt: new Date("2024-03-14T10:00:00Z"),
          status: "generated",
        },
        wordpressPost: {
          postId: "123",
          status: "published",
          publishedAt: new Date("2024-03-14T11:00:00Z"),
          url: "https://example.com/post/123",
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      leagueId: leagueIds[2], // Serie A
      homeTeam: {
        name: "AC Milan",
        logo: "/logos/milan.png",
        score: 2,
      },
      awayTeam: {
        name: "Inter Milan",
        logo: "/logos/inter.png",
        score: 2,
      },
      matchDate: new Date("2024-03-17T19:45:00Z"),
      kickoffTime: "19:45",
      venue: {
        name: "San Siro",
        city: "Milan",
      },
      status: "scheduled",
      round: "Vòng 30",
      analysis: {
        isAnalyzed: false,
        articles: [],
        aiAnalysis: {
          content: "",
          generatedAt: null,
          status: "pending",
        },
        wordpressPost: {
          postId: "",
          status: "draft",
          publishedAt: null,
          url: "",
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
};

async function seedDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Đã kết nối với MongoDB");

    const db = client.db();
    const leaguesCollection = db.collection("leagues");
    const usersCollection = db.collection("users");
    const matchesCollection = db.collection("matches");

    // Kiểm tra xem đã có dữ liệu chưa
    const leaguesCount = await leaguesCollection.countDocuments();
    const usersCount = await usersCollection.countDocuments({ role: "ktv" });
    const matchesCount = await matchesCollection.countDocuments();

    console.log(`Số lượng giải đấu hiện có: ${leaguesCount}`);
    console.log(`Số lượng KTV hiện có: ${usersCount}`);
    console.log(`Số lượng trận đấu hiện có: ${matchesCount}`);

    // Thêm dữ liệu leagues nếu chưa có
    if (leaguesCount === 0) {
      const result = await leaguesCollection.insertMany(leaguesSeedData);
      console.log(`Đã thêm ${result.insertedCount} giải đấu`);
    }

    // Thêm dữ liệu users (KTV) nếu chưa có
    if (usersCount === 0) {
      // Mã hóa mật khẩu cho tất cả users
      const usersWithHashedPasswords = await Promise.all(
        usersSeedData.map(async (user) => {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.password, salt);
          return { ...user, password: hashedPassword };
        })
      );

      const result = await usersCollection.insertMany(usersWithHashedPasswords);
      console.log(`Đã thêm ${result.insertedCount} KTV`);
    }

    // Thêm dữ liệu matches nếu chưa có
    if (matchesCount === 0) {
      // Lấy ID của các leagues đã tạo
      const leagues = await leaguesCollection.find().toArray();
      const leagueIds = leagues.map((league) => league._id);

      // Tạo dữ liệu matches với leagueId thực tế
      const matchesSeedData = createMatchesSeedData(leagueIds);
      const result = await matchesCollection.insertMany(matchesSeedData);
      console.log(`Đã thêm ${result.insertedCount} trận đấu`);
    }

    console.log("Hoàn tất tạo dữ liệu mẫu!");
  } catch (error) {
    console.error("Lỗi:", error);
  } finally {
    await client.close();
    console.log("Đã đóng kết nối MongoDB");
  }
}

seedDatabase();
