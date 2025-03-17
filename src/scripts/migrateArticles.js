/**
 * Script để di chuyển dữ liệu phân tích từ model Match sang model Article
 * 
 * Thực thi script này bằng lệnh: node -r dotenv/config src/scripts/migrateArticles.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

console.log('Bắt đầu di chuyển dữ liệu phân tích...');

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Kết nối đến MongoDB thành công'))
  .catch(err => {
    console.error('Lỗi kết nối đến MongoDB:', err);
    process.exit(1);
  });

// Định nghĩa schemas
const matchSchema = new mongoose.Schema({
  leagueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "League",
  },
  homeTeam: {
    name: { type: String },
    logo: { type: String },
    score: { type: Number },
  },
  awayTeam: {
    name: { type: String },
    logo: { type: String },
    score: { type: Number },
  },
  matchDate: { type: Date },
  kickoffTime: { type: String },
  analysis: {
    isAnalyzed: { type: Boolean },
    aiStatus: { type: String },
    articles: [
      {
        title: { type: String },
        url: { type: String },
        source: { type: String },
        content: { type: String },
        fetchedAt: { type: Date },
      },
    ],
    aiAnalysis: {
      content: { type: String },
      generatedAt: { type: Date },
      status: { type: String },
      predictedScore: {
        home: { type: Number },
        away: { type: Number },
      },
    },
  },
});

const articleSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
  },
  matchInfo: {
    homeTeam: {
      name: { type: String },
      logo: { type: String }
    },
    awayTeam: {
      name: { type: String },
      logo: { type: String }
    },
    matchDate: { type: Date },
    kickoffTime: { type: String },
    leagueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "League"
    },
    leagueName: { type: String },
    leagueLogo: { type: String }
  },
  referencedArticles: [
    {
      title: { type: String },
      url: { type: String },
      source: { type: String },
      content: { type: String },
      fetchedAt: { type: Date }
    }
  ],
  aiAnalysis: {
    content: { type: String, default: "" },
    generatedAt: { type: Date },
    status: { type: String },
    predictedScore: {
      home: { type: Number },
      away: { type: Number }
    }
  },
  analysisStatus: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date }
});

// Tạo models
const Match = mongoose.model('Match', matchSchema);
const League = mongoose.model('League', mongoose.Schema({
  name: String,
  country: String,
  logo: String
}));
const Article = mongoose.model('Article', articleSchema);

async function migrateData() {
  try {
    // Lấy tất cả trận đấu có phân tích
    const matches = await Match.find({
      "analysis.isAnalyzed": true
    }).populate('leagueId');

    console.log(`Tìm thấy ${matches.length} trận đấu có phân tích để di chuyển`);

    let successCount = 0;
    let errorCount = 0;

    // Xử lý từng trận đấu
    for (const match of matches) {
      try {
        // Kiểm tra xem đã có bài phân tích cho trận đấu này chưa
        const existingArticle = await Article.findOne({ matchId: match._id });
        
        if (existingArticle) {
          console.log(`Bài phân tích cho trận đấu ${match._id} đã tồn tại, bỏ qua`);
          continue;
        }

        // Tạo dữ liệu cho bài phân tích mới
        const newArticle = new Article({
          matchId: match._id,
          matchInfo: {
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            matchDate: match.matchDate,
            kickoffTime: match.kickoffTime,
            leagueId: match.leagueId?._id,
            leagueName: match.leagueId?.name || "Unknown League",
            leagueLogo: match.leagueId?.logo
          },
          referencedArticles: match.analysis.articles || [],
          aiAnalysis: {
            content: match.analysis.aiAnalysis?.content || "",
            generatedAt: match.analysis.aiAnalysis?.generatedAt || new Date(),
            status: match.analysis.aiAnalysis?.status === "generated" ? "generated" : "pending",
            predictedScore: match.analysis.aiAnalysis?.predictedScore || {}
          },
          analysisStatus: match.analysis.aiAnalysis?.status === "generated" ? "completed" : "in_progress",
          createdAt: match.createdAt || new Date(),
          updatedAt: new Date()
        });

        // Lưu bài phân tích mới
        await newArticle.save();

        // Cập nhật trận đấu để tham chiếu đến bài phân tích mới
        await Match.findByIdAndUpdate(match._id, {
          analysisInfo: {
            hasArticle: true,
            articleId: newArticle._id,
            analysisStatus: match.analysis.aiAnalysis?.status === "generated" ? "completed" : "in_progress"
          }
        });

        successCount++;
        console.log(`Di chuyển thành công trận đấu ${match._id}`);
      } catch (err) {
        errorCount++;
        console.error(`Lỗi khi xử lý trận đấu ${match._id}:`, err);
      }
    }

    console.log('Kết quả di chuyển dữ liệu:');
    console.log(`- Tổng số trận đấu: ${matches.length}`);
    console.log(`- Thành công: ${successCount}`);
    console.log(`- Lỗi: ${errorCount}`);

  } catch (err) {
    console.error('Lỗi khi di chuyển dữ liệu:', err);
  } finally {
    // Đóng kết nối
    mongoose.connection.close();
    console.log('Kết nối đã đóng, quá trình di chuyển dữ liệu hoàn thành');
  }
}

// Thực thi hàm di chuyển dữ liệu
migrateData(); 