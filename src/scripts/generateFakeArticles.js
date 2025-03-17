/**
 * Script tạo dữ liệu giả cho bài viết phân tích
 * 
 * Sử dụng: node -r dotenv/config src/scripts/generateFakeArticles.js
 */

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/vi');
require('dotenv').config();

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Kết nối MongoDB thành công!'))
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

// Định nghĩa schemas
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
    content: { type: String },
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

const leagueSchema = new mongoose.Schema({
  name: { type: String },
  country: { type: String },
  logo: { type: String }
});

const matchSchema = new mongoose.Schema({
  leagueId: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
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
  venue: {
    name: { type: String },
    city: { type: String }
  },
  status: { type: String },
  round: { type: String },
  analysisInfo: {
    hasArticle: { type: Boolean },
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    analysisStatus: { type: String }
  }
});

// Tạo models
const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);
const League = mongoose.models.League || mongoose.model('League', leagueSchema);
const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);

// Danh sách giải đấu
const leagues = [
  { 
    name: 'Premier League', 
    country: 'Anh', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png' 
  },
  { 
    name: 'La Liga', 
    country: 'Tây Ban Nha', 
    logo: 'https://assets.laliga.com/assets/logos/laliga-v/laliga-v-1200x1200.png' 
  },
  { 
    name: 'Serie A', 
    country: 'Ý', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Serie_A_logo_%28cropped%29.svg/1200px-Serie_A_logo_%28cropped%29.svg.png' 
  },
  { 
    name: 'Bundesliga', 
    country: 'Đức', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/1200px-Bundesliga_logo_%282017%29.svg.png' 
  },
  { 
    name: 'Ligue 1', 
    country: 'Pháp', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Ligue_1_Uber_Eats_logo.svg/1200px-Ligue_1_Uber_Eats_logo.svg.png' 
  },
  { 
    name: 'Champions League', 
    country: 'Châu Âu', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/UEFA_Champions_League_logo_2.svg/1200px-UEFA_Champions_League_logo_2.svg.png' 
  }
];

// Danh sách đội bóng nổi tiếng
const teams = [
  // Premier League
  { name: 'Manchester United', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png', league: 'Premier League' },
  { name: 'Manchester City', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png', league: 'Premier League' },
  { name: 'Liverpool', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png', league: 'Premier League' },
  { name: 'Chelsea', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png', league: 'Premier League' },
  { name: 'Arsenal', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png', league: 'Premier League' },
  { name: 'Tottenham Hotspur', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/1200px-Tottenham_Hotspur.svg.png', league: 'Premier League' },
  
  // La Liga
  { name: 'Real Madrid', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png', league: 'La Liga' },
  { name: 'Barcelona', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png', league: 'La Liga' },
  { name: 'Atletico Madrid', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/1200px-Atletico_Madrid_2017_logo.svg.png', league: 'La Liga' },
  { name: 'Sevilla', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/1200px-Sevilla_FC_logo.svg.png', league: 'La Liga' },
  
  // Serie A
  { name: 'Juventus', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_icon_%28black%29.svg/1200px-Juventus_FC_2017_icon_%28black%29.svg.png', league: 'Serie A' },
  { name: 'Inter Milan', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/1200px-FC_Internazionale_Milano_2021.svg.png', league: 'Serie A' },
  { name: 'AC Milan', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/AC_Milan_logo.svg/1200px-AC_Milan_logo.svg.png', league: 'Serie A' },
  { name: 'Napoli', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/SSC_Napoli_%282021%29.svg/1200px-SSC_Napoli_%282021%29.svg.png', league: 'Serie A' },
  
  // Bundesliga
  { name: 'Bayern Munich', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png', league: 'Bundesliga' },
  { name: 'Borussia Dortmund', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/1200px-Borussia_Dortmund_logo.svg.png', league: 'Bundesliga' },
  { name: 'RB Leipzig', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/RB_Leipzig_2014_logo.svg/1200px-RB_Leipzig_2014_logo.svg.png', league: 'Bundesliga' },
  
  // Ligue 1
  { name: 'Paris Saint-Germain', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/1200px-Paris_Saint-Germain_F.C..svg.png', league: 'Ligue 1' },
  { name: 'Marseille', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Olympique_Marseille_logo.svg/1200px-Olympique_Marseille_logo.svg.png', league: 'Ligue 1' },
  { name: 'Lyon', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/Olympique_Lyonnais.svg/1200px-Olympique_Lyonnais.svg.png', league: 'Ligue 1' }
];

// Mảng các từ khóa bóng đá để tạo nội dung phong phú
const footballKeywords = [
  'tấn công', 'phòng ngự', 'chuyền bóng', 'đánh đầu', 'sút', 'bàn thắng', 'thẻ vàng', 'thẻ đỏ',
  'phản công', 'chiến thuật', 'hậu vệ', 'tiền vệ', 'tiền đạo', 'bóng chết', 'phạt đền', 'góc',
  'kiểm soát bóng', 'ưu thế', 'chủ động', 'áp lực', 'tốc độ', 'kỹ thuật', 'thể lực', 'quyết định',
  'thay người', 'cơ hội', 'tình huống', 'chiến thắng', 'trận hòa', 'thất bại', 'giải đấu', 'mùa giải',
  'hiệp một', 'hiệp hai', 'phút bù giờ', 'bảng xếp hạng', 'điểm số', 'vòng đấu'
];

// Hàm tạo bài phân tích bóng đá ngẫu nhiên
function generateAnalysisContent() {
  const paragraphs = [];
  const paragraphCount = faker.number.int({ min: 4, max: 8 });
  
  // Tạo đoạn mở đầu
  paragraphs.push(`${faker.lorem.paragraph(8)} ${faker.helpers.arrayElement(footballKeywords)} ${faker.lorem.paragraph(4)}`);
  
  // Tạo phân tích hiệp 1
  paragraphs.push(`# Hiệp 1\n\n${faker.lorem.paragraph(10)} ${faker.helpers.arrayElement(footballKeywords)} ${faker.lorem.paragraph(6)} ${faker.helpers.arrayElement(footballKeywords)} ${faker.lorem.paragraph(5)}`);
  
  // Tạo phân tích hiệp 2
  paragraphs.push(`# Hiệp 2\n\n${faker.lorem.paragraph(10)} ${faker.helpers.arrayElement(footballKeywords)} ${faker.lorem.paragraph(6)} ${faker.helpers.arrayElement(footballKeywords)} ${faker.lorem.paragraph(5)}`);
  
  // Tạo các đoạn phân tích theo nhiều khía cạnh
  for (let i = 0; i < paragraphCount - 3; i++) {
    const heading = faker.helpers.arrayElement([
      '# Phân tích chiến thuật',
      '# Những cầu thủ nổi bật',
      '# Điểm yếu cần khắc phục',
      '# Phong độ của các cầu thủ',
      '# Chiến thuật phòng ngự',
      '# Lối chơi tấn công',
      '# Đánh giá về đội hình',
      '# Tương quan sức mạnh'
    ]);
    paragraphs.push(`${heading}\n\n${faker.lorem.paragraph(12)} ${faker.helpers.arrayElement(footballKeywords)} ${faker.lorem.paragraph(7)} ${faker.helpers.arrayElement(footballKeywords)} ${faker.lorem.paragraph(6)}`);
  }
  
  // Tạo đoạn kết luận
  paragraphs.push(`# Kết luận\n\n${faker.lorem.paragraph(10)} ${faker.helpers.arrayElement(footballKeywords)} ${faker.lorem.paragraph(5)}`);
  
  return paragraphs.join('\n\n');
}

// Hàm tạo bài viết tham khảo
function generateReferencedArticle() {
  const sources = ['Bóng Đá+', 'Thể Thao 247', 'VnExpress', 'Người Đưa Tin', 'Dân Trí', 'Tiền Phong', 'Tuổi Trẻ', 'Vietnamnet', 'Thanh Niên', 'Zing News'];
  
  return {
    title: faker.lorem.sentence(),
    url: faker.internet.url(),
    source: faker.helpers.arrayElement(sources),
    content: faker.lorem.paragraphs(3),
    fetchedAt: faker.date.recent({ days: 7 })
  };
}

// Hàm tạo số lượng bài viết tham khảo ngẫu nhiên
function generateReferencedArticles() {
  const articles = [];
  const articleCount = faker.number.int({ min: 2, max: 5 });
  
  for (let i = 0; i < articleCount; i++) {
    articles.push(generateReferencedArticle());
  }
  
  return articles;
}

// Hàm tạo trận đấu ngẫu nhiên với bài phân tích
async function createRandomMatch(leagueObjects) {
  try {
    // Chọn giải đấu ngẫu nhiên
    const league = faker.helpers.arrayElement(leagueObjects);
    
    // Lọc đội bóng theo giải đấu
    const leagueTeams = teams.filter(team => team.league === league.name);
    
    // Nếu không có đội bóng nào trong giải, chọn ngẫu nhiên từ tất cả
    const availableTeams = leagueTeams.length > 1 ? leagueTeams : teams;
    
    // Chọn hai đội khác nhau để làm đội nhà và đội khách
    let homeTeamIdx = faker.number.int({ min: 0, max: availableTeams.length - 1 });
    let awayTeamIdx;
    do {
      awayTeamIdx = faker.number.int({ min: 0, max: availableTeams.length - 1 });
    } while (awayTeamIdx === homeTeamIdx);
    
    const homeTeam = availableTeams[homeTeamIdx];
    const awayTeam = availableTeams[awayTeamIdx];
    
    // Tạo thời gian trận đấu ngẫu nhiên (trong vòng 45 ngày gần đây)
    const matchDate = faker.date.recent({ days: 45 });
    const kickoffTime = `${faker.number.int({ min: 18, max: 21 })}:${faker.helpers.arrayElement(['00', '15', '30', '45'])}`;
    
    // Tạo tỷ số ngẫu nhiên
    const homeScore = faker.number.int({ min: 0, max: 5 });
    const awayScore = faker.number.int({ min: 0, max: 4 });
    
    // Tạo sân vận động
    const venue = {
      name: `${faker.location.city()} Stadium`,
      city: faker.location.city()
    };
    
    // Tạo thông tin trận đấu
    const match = new Match({
      leagueId: league._id,
      homeTeam: {
        name: homeTeam.name,
        logo: homeTeam.logo,
        score: homeScore
      },
      awayTeam: {
        name: awayTeam.name,
        logo: awayTeam.logo,
        score: awayScore
      },
      matchDate,
      kickoffTime,
      venue,
      status: 'completed',
      round: `Vòng ${faker.number.int({ min: 1, max: 38 })}`,
      analysisInfo: {
        hasArticle: true
      }
    });
    
    // Lưu trận đấu
    await match.save();
    
    // Tạo bài phân tích cho trận đấu
    const article = new Article({
      matchId: match._id,
      matchInfo: {
        homeTeam: {
          name: homeTeam.name,
          logo: homeTeam.logo
        },
        awayTeam: {
          name: awayTeam.name,
          logo: awayTeam.logo
        },
        matchDate,
        kickoffTime,
        leagueId: league._id,
        leagueName: league.name,
        leagueLogo: league.logo
      },
      referencedArticles: generateReferencedArticles(),
      aiAnalysis: {
        content: generateAnalysisContent(),
        generatedAt: faker.date.recent({ days: 3 }),
        status: 'generated',
        predictedScore: {
          home: faker.number.int({ min: 0, max: 4 }),
          away: faker.number.int({ min: 0, max: 3 })
        }
      },
      analysisStatus: 'completed',
      createdAt: faker.date.recent({ days: 5 }),
      updatedAt: new Date()
    });
    
    // Lưu bài phân tích
    await article.save();
    
    // Cập nhật trận đấu với ID bài phân tích
    match.analysisInfo.articleId = article._id;
    match.analysisInfo.analysisStatus = 'completed';
    await match.save();
    
    return { match, article };
  } catch (error) {
    console.error('Lỗi tạo trận đấu:', error);
    return null;
  }
}

// Hàm chính để tạo dữ liệu
async function generateData() {
  try {
    // Xóa dữ liệu cũ (Chỉ dùng để test, bỏ comment nếu cần)
    // await League.deleteMany({});
    // await Match.deleteMany({});
    // await Article.deleteMany({});
    
    console.log('Đang tạo các giải đấu...');
    const leagueObjects = [];
    
    // Kiểm tra và tạo các giải đấu nếu chưa tồn tại
    for (const leagueData of leagues) {
      const existingLeague = await League.findOne({ name: leagueData.name });
      if (existingLeague) {
        leagueObjects.push(existingLeague);
      } else {
        const newLeague = new League(leagueData);
        await newLeague.save();
        leagueObjects.push(newLeague);
      }
    }
    
    console.log(`Đã tạo ${leagueObjects.length} giải đấu`);
    
    // Đếm số bài phân tích hiện có
    const existingArticlesCount = await Article.countDocuments();
    console.log(`Hiện có ${existingArticlesCount} bài phân tích`);
    
    // Số lượng bài phân tích cần tạo thêm
    const articlesToCreate = 50; // Có thể điều chỉnh số lượng
    console.log(`Chuẩn bị tạo ${articlesToCreate} bài phân tích mới...`);
    
    // Tạo các bài phân tích
    for (let i = 0; i < articlesToCreate; i++) {
      const result = await createRandomMatch(leagueObjects);
      if (result) {
        process.stdout.write(`Tạo bài phân tích ${i + 1}/${articlesToCreate}...\r`);
      }
    }
    
    console.log(`\nĐã tạo xong ${articlesToCreate} bài phân tích mới!`);
    const totalArticles = await Article.countDocuments();
    console.log(`Tổng số bài phân tích hiện có: ${totalArticles}`);
    
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu:', error);
  } finally {
    mongoose.connection.close();
    console.log('Kết nối đã đóng, quá trình tạo dữ liệu hoàn thành');
  }
}

// Chạy hàm tạo dữ liệu
generateData(); 