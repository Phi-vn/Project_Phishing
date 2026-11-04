// =============================================================================
// CƠ SỞ TRI THỨC ĐA LĨNH VỰC TOÀN NĂNG & BỘ NÃO SUY LUẬN ĐỜI SỐNG CHO TRỢ LÝ AN NINH MẠNG PHISHARMOR
// =============================================================================

// Chuẩn hóa chuỗi tiếng Việt: chữ thường, không dấu
export function normalizeVi(str: string): string {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

// Hàm làm sạch triệt để câu hỏi của người dùng để tra cứu chủ đề chính xác
function cleanQueryForSearch(raw: string): string {
  let s = (raw || "").trim();
  // Bỏ các từ mở đầu chào hỏi, rào trước đón sau
  s = s.replace(/^(?:vậy\s+)?(?:cho\s+(?:tôi|tui|mình|em)\s+hỏi|bạn\s+cho\s+(?:tôi|tui|mình|em)\s+hỏi|cho\s+hỏi|bạn\s+ơi|bé\s+ơi|bot\s+ơi|ê\s+bot|bạn\s+có\s+biết|bạn\s+biết|mày\s+biết|kể\s+cho\s+(?:tôi|tui|mình)\s+nghe\s+về|kể\s+về|tìm\s+hiểu\s+về|giải\s+thích\s+về|thông\s+tin\s+về|hãy\s+cho\s+biết|cho\s+biết|ai\s+là|nguồn\s+gốc\s+của)\s*/i, "");
  // Bỏ các từ định lượng chung ở đầu: "các", "những", "một số"
  s = s.replace(/^(?:các|những|một\s+số)\s+/i, "");
  // Bỏ các từ đệm kết thúc câu hỏi
  s = s.replace(/(?:\s+(?:không\s+vậy\s+bạn|không\s+bạn|không\s+ạ|không\s+nhỉ|không|được\s+không|vậy\s+bạn|hả\s+bạn|hả|vậy|nhỉ|nè|nhé|nha|ạ|\?))+$/i, "");
  // Bỏ các dạng câu hỏi thường gặp ở cuối: là gì, ở đâu, học những gì...
  s = s.replace(/(?:\s+(?:học\s+những\s+kiến\s+thức\s+nào|học\s+những\s+gì|gồm\s+những\s+gì|có\s+những\s+gì|là\s+gì|như\s+thế\s+nào|thế\s+nào|ở\s+đâu|nằm\s+ở\s+đâu|tọa\s+lạc\s+ở\s+đâu|ở\s+chỗ\s+nào|ra\s+sao|bao\s+nhiêu|khi\s+nào|bao\s+giờ|từ\s+đâu|bắt\s+nguồn\s+từ\s+đâu))+$/i, "");
  return s.trim();
}

// Kiểm tra độ liên quan giữa tiêu đề/trích đoạn Wikipedia và câu hỏi của người dùng
function isTitleRelevant(query: string, title: string, snippet?: string): boolean {
  const normQ = normalizeVi(query);
  const normT = normalizeVi(title);
  const normS = snippet ? normalizeVi(snippet.replace(/<[^>]+>/g, " ")) : "";

  // Khớp trực tiếp tiêu đề
  if (normQ.includes(normT) || normT.includes(normQ)) return true;

  // Lọc các từ khóa cốt lõi (từ 3 ký tự trở lên, loại bỏ hư từ phổ biến)
  const stopWords = new Set(["ban", "cho", "hoi", "biet", "ve", "nay", "duoc", "khong", "cua", "cac", "nhung", "nguoi", "mot", "trong", "tai", "sao", "gi", "ai", "dau", "hoc", "thuc", "kham"]);
  const qWords = normQ.split(/[\s,.;:!?/-]+/).filter(w => w.length >= 3 && !stopWords.has(w));
  const tWords = normT.split(/[\s,.;:!?/-]+/).filter(w => w.length >= 3 && !stopWords.has(w));

  if (qWords.length === 0) return true;

  // Tiêu đề PHẢI chứa ít nhất 1 từ khóa cốt lõi của câu hỏi
  const matchTitleCount = qWords.filter(qw => tWords.some(tw => tw.includes(qw) || qw.includes(tw))).length;
  if (matchTitleCount === 0) return false;

  if (qWords.length <= 2) {
    return matchTitleCount >= 1;
  }
  return matchTitleCount >= 2 || (matchTitleCount / qWords.length) >= 0.5;
}

// 1. TÌM KIẾM BÁCH KHOA TOÀN THƯ WIKIPEDIA VIỆT NAM THỜI GIAN THỰC (XÁC THỰC DANH NHÂN, ĐỊA DANH, SỰ KIỆN, KHOA HỌC)
export async function fetchWikipediaLive(rawQuery: string): Promise<string | null> {
  try {
    const norm = normalizeVi(rawQuery);

    // TUYỆT ĐỐI KHÔNG tìm kiếm Wikipedia cho các câu hỏi cảm xúc, tình cảm, hẹn hò, tán tỉnh, lời khuyên cá nhân
    const isSubjectiveOrEmotional = 
      norm.includes("tan gai") || norm.includes("tan crush") || norm.includes("cua gai") ||
      norm.includes("cua cam") || norm.includes("tan mot co gai") || norm.includes("tan mot ban nu") ||
      norm.includes("tan ban nam") || norm.includes("tan trai") || norm.includes("cua trai") ||
      norm.includes("hen ho") || norm.includes("to tinh") || norm.includes("nguoi yeu") ||
      norm.includes("ban gai") || norm.includes("crush") || norm.includes("thich mot") ||
      norm.includes("yeu mot") || norm.includes("tinh cam") || norm.includes("chia tay") ||
      norm.includes("tam su") || norm.includes("khuyen tui") || norm.includes("cho loi khuyen") ||
      norm.includes("nen lam gi") || norm.includes("khong biet lam sao") || norm.includes("phai lam sao") ||
      norm.includes("buon qua") || norm.includes("stress") || norm.includes("that tinh") ||
      norm.includes("met moi") || norm.includes("an ui") || norm.includes("hoi gi cung biet");

    // TUYỆT ĐỐI KHÔNG tìm kiếm Wikipedia cho các câu hỏi nội bộ hoặc kỹ thuật chuyên biệt của PhishArmor
    const isProjectOrTechnicalQuery =
      norm.includes("trang ") || norm.includes("do an") || norm.includes("du an") ||
      norm.includes("phisharmor") || norm.includes("onboarding") || norm.includes("login") ||
      norm.includes("overview") || norm.includes("metrics") || norm.includes("xgboost") ||
      norm.includes("phobert") || norm.includes("active learning") || norm.includes("extension") ||
      norm.includes("chuc nang") || norm.includes("cong dung") || norm.includes("he thong") ||
      norm.includes("link doc") || norm.includes("quet link");

    if (isSubjectiveOrEmotional || isProjectOrTechnicalQuery) return null;

    let clean = cleanQueryForSearch(rawQuery);
    if (!clean || clean.length < 2) return null;

    // Tìm kiếm bài viết phù hợp nhất trên Wikipedia tiếng Việt (lấy 5 kết quả để chọn lọc chuẩn nhất)
    const sUrl = `https://vi.wikipedia.org/w/api.php?action=query&list=search&srlimit=5&format=json&srsearch=${encodeURIComponent(clean)}`;
    const sRes = await fetch(sUrl, {
      headers: { "User-Agent": "PhishArmorAssistant/1.0 (academic-security-project@phisharmor.ai)" },
      signal: AbortSignal.timeout(6000)
    });
    if (!sRes.ok) return null;
    const sData = await sRes.json();
    const items = sData?.query?.search || [];
    if (items.length === 0) return null;

    // Kiểm tra độ phù hợp của tiêu đề hoặc tóm tắt để không bị lệch chủ đề
    const matchedItem = items.find((it: { title: string; snippet?: string }) => isTitleRelevant(clean, it.title, it.snippet));
    if (!matchedItem || !matchedItem.title) return null;

    const matchedTitle = matchedItem.title;
    // Lấy đoạn tóm tắt bài viết (Extract) có xử lý chuyển hướng Canonical Redirect
    const extUrl = `https://vi.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&redirects=1&titles=${encodeURIComponent(matchedTitle)}`;
    const eRes = await fetch(extUrl, {
      headers: { "User-Agent": "PhishArmorAssistant/1.0 (academic-security-project@phisharmor.ai)" },
      signal: AbortSignal.timeout(6000)
    });
    if (!eRes.ok) return null;
    const eData = await eRes.json();
    const pages = eData?.query?.pages || {};

    for (const pid of Object.keys(pages)) {
      if (pid !== "-1" && pages[pid].extract) {
        const text = pages[pid].extract.trim();
        if (text.length > 50) {
          const sentences = text.split("\n").filter((l: string) => l.trim().length > 0);
          const summary = sentences.slice(0, 3).join("\n\n");
          return `📖 **Thông tin bách khoa về "${pages[pid].title}":**\n\n${summary}\n\n*(Nguồn: Wikipedia Tiếng Việt)*`;
        }
      }
    }
  } catch {
    // Bỏ qua lỗi mạng
  }
  return null;
}

// 2. KHO TRI THỨC CHUYÊN GIA ĐA LĨNH VỰC CỤC BỘ (ẨM THỰC, SỨC KHỎE, KHOA HỌC, TÌNH YÊU, HỌC TẬP, AN NINH MẠNG...)
export function getRealLifeExpertAnswer(message: string): { reply: string; actionBtn?: { text: string; url: string } } | null {
  const raw = message.trim();
  const norm = normalizeVi(raw);

  // =========================================================================
  // 0.0 NẾU LÀ CÂU HỎI VỀ GIAO DIỆN / TRANG CỦA HỆ THỐNG PHISHARMOR
  // -> TRẢ VỀ NULL ĐỂ BỘ ĐIỀU HƯỚNG TRANG (generateDirectAnswer) HỖ TRỢ TRỰC TIẾP
  // =========================================================================
  const isPhishArmorUiSpecific =
    (norm.includes("phisharmor") && (norm.includes("trang") || norm.includes("giao dien") || norm.includes("chuc nang cua trang"))) ||
    norm.includes("trang nay") || norm.includes("o trang nay") || norm.includes("giai thich trang nay") ||
    norm.includes("trang scan") || norm.includes("trang overview") || norm.includes("trang metrics") ||
    norm.includes("trang history") || norm.includes("trang training") || norm.includes("trang feedback") ||
    norm.includes("trang settings") || norm.includes("trang block") || norm.includes("trang export") ||
    norm.includes("popup tien ich") || norm.includes("cai tien ich vao chrome");

  if (isPhishArmorUiSpecific) {
    return null;
  }

  // =========================================================================
  // 0. NĂNG LỰC CỦA TRỢ LÝ PHISHARMOR (HỎI ĐÁP & GIỚI THIỆU BẢN THÂN)
  // =========================================================================
  if (
    norm.includes("hoi gi cung biet") || norm.includes("hoi cai gi cung biet") ||
    norm.includes("ban biet lam gi") || norm.includes("ban lam duoc gi") ||
    norm.includes("biet lam gi") || norm.includes("biet lam nhung gi") ||
    norm.includes("lam duoc nhung gi") || norm.includes("co the lam nhung gi") ||
    norm.includes("gioi thieu ve ban") || norm.includes("ban la ai") ||
    norm.includes("tro ly gi")
  ) {
    return {
      reply: `🛡️ **CHÀO BẠN! TÔI LÀ TRỢ LÝ KỸ THUẬT AN NINH MẠNG PHISHARMOR** ✨\n\n` +
        `Mình được thiết kế với **Bộ Não Đa Tầng Thông Minh** để bạn hỏi bất cứ điều gì trên đời cũng có câu trả lời chi tiết và đầy đủ nhất:\n\n` +
        `1. 🛡️ **An Ninh Mạng & Bóc Tách Lừa Đảo:** Nhập bất kỳ URL nào để quét rủi ro thời gian thực, đọc điểm Trust Score, giải thích cây SHAP, mô hình PhoBERT VinAI & XGBoost.\n` +
        `2. 🍲 **Ẩm Thực & Nấu Ăn Chuẩn Vị:** Bí quyết nấu thịt kho tàu mềm rục, phở bò nước trong, sườn xào chua ngọt, canh chua cá lóc miền Tây, cơm tấm sườn nướng, bò kho, cà phê muối xứ Huế...\n` +
        `3. 💘 **Tình Yêu, Hẹn Hò & Tán Crush:** Cẩm nang cưa đổ crush từ A-Z, 5 dấu hiệu nàng bật đèn xanh, cách phái nữ bật đèn xanh cho crush nam, làm hòa sau khi cãi nhau, cách vượt qua thất tình...\n` +
        `4. 🏃‍♂️ **Sức Khỏe, Thể Hình & Giấc Ngủ:** Thâm hụt calo giảm cân an toàn, thực đơn tăng cơ/tăng cân, khắc phục mất ngủ bằng thở 4-7-8, giảm đau mỏi vai gáy cho dân IT văn phòng...\n` +
        `5. 🌌 **Khoa Học Tự Nhiên & Vũ Trụ:** Hố đen vũ trụ, tại sao nước biển mặn, sấm sét hình thành thế nào, tại sao bầu trời màu xanh, tốc độ ánh sáng, định lý Pythagoras...\n` +
        `6. 💻 **Công Nghệ & Lập Trình:** Roadmap học code từ con số 0, so sánh Python vs JavaScript, React vs Vue vs Angular, Docker, SQL vs NoSQL, trí tuệ nhân tạo LLM hoạt động ra sao...\n` +
        `7. 💼 **Phát Triển Bản Thân & Sự Nghiệp:** Viết CV xin việc chuẩn công thức XYZ của Google, trả lời phỏng vấn theo mô hình STAR, đánh bại thói quen trì hoãn với quy tắc 5 giây...\n` +
        `8. 🌐 **Bách Khoa Toàn Thư Wikipedia Realtime:** Tự động tra cứu bách khoa toàn thư trực tiếp cho bất kỳ danh nhân (Nguyễn Huệ, Steve Jobs, Elon Musk...), địa danh (tháp Eiffel, Phú Quốc...) hay sự kiện lịch sử nào!\n` +
        `9. ⚡ **Mở Rộng Không Giới Hạn với Google Gemini:** Bạn có thể bấm nút **⚡ Kết nối AI** ở góc trên khung chat để nạp khóa Gemini 1.5 Flash (miễn phí), giúp mình sáng tạo vô hạn mọi chủ đề trên thế giới!\n\n` +
        `Bạn cần tra cứu quy trình, hỏi đáp kỹ thuật hay phân tích liên kết nghi vấn, hãy gửi yêu cầu tại đây để được hỗ trợ 24/7! 🛡️`
    };
  }

  // =========================================================================
  // 1. ẨM THỰC & NẤU ĂN CHI TIẾT (RECIPES & COOKING)
  // =========================================================================

  // 1.1 THỊT KHO TÀU (KHO HỘT VỊT / KHO TRỨNG)
  if (
    norm.includes("thit kho tau") || norm.includes("thit kho hot vit") ||
    norm.includes("thit kho trung") || (norm.includes("thit kho") && norm.includes("nuoc dua"))
  ) {
    return {
      reply: `🍲 **HƯỚNG DẪN CÁCH NẤU THỊT KHO TÀU (KHO HỘT VỊT) MỀM RỤC, VÀNG ÓNG CHUẨN VỊ:**\n\n` +
        `• **Nguyên liệu chuẩn bị:**\n` +
        `  - 500g thịt ba chỉ (hoặc thịt nách) có nạc mỡ đan xen.\n` +
        `  - 5-6 quả trứng vịt (hoặc trứng gà/trứng cút) luộc chín bóc vỏ.\n` +
        `  - 1 quả dừa xiêm tươi (lấy nước ngọt tự nhiên).\n` +
        `  - Gia vị: Nước mắm ngon, hành tím, tỏi, ớt băm, đường, hạt nêm, hạt tiêu.\n\n` +
        `• **4 Bước nấu ngon chuẩn vị:**\n` +
        `  1. 🔪 **Sơ chế & Khử hôi:** Trần sơ thịt qua nước sôi có pha chút muối và vài lát gừng trong 2 phút. Rửa sạch lại với nước lạnh, cắt miếng vuông quân cờ cỡ 3-4cm.\n` +
        `  2. 🧂 **Ướp thịt đậm đà:** Ướp thịt với 2 muỗng canh nước mắm ngon, 1 muỗng đường, 1 muỗng hạt nêm, tiêu xay, hành tỏi băm nhuyễn trong ít nhất **30 phút** (để thịt ngấm đều).\n` +
        `  3. 🍯 **Thắng nước màu cánh gián:** Cho 1 muỗng đường vào nồi với chút xíu dầu ăn, đun lửa nhỏ đến khi đường chuyển màu cánh gián hổ phách thì trút thịt vào đảo thật nhanh tay cho săn lại.\n` +
        `  4. 🥥 **Kho nước dừa liu riu:** Đổ nước dừa xiêm ngập mặt thịt. Đun sôi bùng rồi vớt sạch bọt, hạ lửa thật nhỏ liu riu trong 45 phút. Tiếp tục cho trứng luộc vào kho thêm 15-20 phút đến khi thịt mềm tan trong miệng, mỡ trong veo và nước kho sánh vàng óng ả!\n\n` +
        `💡 *Mẹo nhỏ:* Không nên đậy nắp nồi khi kho để nước thịt luôn trong vắt và mỡ thịt không bị đục nha bạn ơi! 😋`
    };
  }

  // 1.2 NẤU PHỞ BÒ / PHỞ GÀ
  if (norm.includes("nau pho") || norm.includes("cach lam pho") || norm.includes("pho bo") || norm.includes("pho ga")) {
    return {
      reply: `🍜 **BÍ QUYẾT NẤU NƯỚC DÙNG PHỞ BÒ HÀ NỘI TRONG VẮT, NGỌT THANH:**\n\n` +
        `• **Nguyên liệu chính:** Xương ống bò (1-1.5kg), thịt thăn bò (hoặc nạm/gầu), bánh phở tươi, hành tây, gừng, hành hoa, rau mùi.\n` +
        `• **Gói hương vị phở truyền thống:** Hoa hồi (3-4 cánh), quế thanh, thảo quả (1 quả), hạt ngò (hạt mùi), đinh hương.\n\n` +
        `• **Quy trình chuẩn vị:**\n` +
        `  1. 🦴 **Xử lý xương:** Ngâm xương bò nước muối 1 giờ. Luộc chần ngập nước sôi 5 phút rồi xả sạch cặn máu đen dưới vòi nước (bước này quyết định nước dùng không bị hôi).\n` +
        `  2. 🧅 **Nướng thảo mộc:** Nướng cháy xém vỏ gừng và hành tây/hành tím, cạo sạch vỏ đen rồi đập dập. Rang thơm hoa hồi, quế, thảo quả rồi bỏ vào túi lọc vải.\n` +
        `  3. ⏱️ **Ninh nước dùng:** Cho xương bò, gừng hành nướng và túi thảo mộc vào nồi ngập nước, đun sôi rồi hạ lửa nhỏ nhất ninh trong **4 - 6 tiếng**. Thường xuyên vớt bọt. Nêm muối hạt, đường phèn và nước mắm ngon gần lúc hoàn tất.\n` +
        `  4. 🥢 **Thưởng thức:** Chần bánh phở qua nước sôi xếp vào tô, xếp thịt bò thái mỏng, rắc nhiều hành hoa, đầu hành chẻ và rau mùi, chan nước dùng đang sôi sùng sục lên trên. Ăn kèm quẩy giòn và giấm tỏi ớt là hết sẩy! 🤤`
    };
  }

  // 1.3 SƯỜN XÀO CHUA NGỌT
  if (norm.includes("suon xao chua ngot") || norm.includes("suon chua ngot")) {
    return {
      reply: `🍖 **CÔNG THỨC SƯỜN XÀO CHUA NGỌT BẤT BẠI - TỶ LỆ NƯỚC SỐT VÀNG:**\n\n` +
        `• **Tỷ lệ pha nước sốt chuẩn (Tính theo muỗng canh):**\n` +
        `  $$\\text{Sốt} = 2\\ \\text{Mắm} : 2\\ \\text{Đường} : 2\\ \\text{Giấm (hoặc cốt chanh)} : 2\\ \\text{Tương cà} : 1\\ \\text{Tương ớt} : 3\\ \\text{Nước lọc}$$\n\n` +
        `• **Cách làm siêu nhanh 15 phút:**\n` +
        `  1. Sườn non 500g chặt khúc vừa ăn, chần qua nước sôi rồi ướp chút hạt nêm 10 phút.\n` +
        `  2. Chiên sườn trên chảo dầu lửa vừa đến khi hai mặt vàng ruộm (không chiên quá khô làm mất độ mọng nước).\n` +
        `  3. Phi thơm hành tỏi băm, trút bát nước sốt vào đun sôi sủi bọt.\n` +
        `  4. Đổ sườn đã chiên vào đảo đều tay trên lửa nhỏ đến khi nước sốt keo lại, áo đều một lớp màu đỏ cam óng ánh quanh từng miếng sườn. Rắc chút mè rang hoặc tiêu lên trên và ăn cùng cơm nóng thì bao sạch nồi! 🍚✨`
    };
  }

  // 1.4 CANH CHUA CÁ LÓC MIỀN TÂY
  if (norm.includes("canh chua") || norm.includes("canh chua ca loc") || norm.includes("nau canh chua")) {
    return {
      reply: `🐟 **BÍ QUYẾT NẤU CANH CHUA CÁ LÓC MIỀN TÂY CHUA THANH ĐẬM ĐÀ:**\n\n` +
        `• **Nguyên liệu:** 1 con cá lóc tươi (khoảng 600-800g), me vắt chín (50g), 1/4 quả dứa (khóm), 2 quả cà chua, 1 cây bạc hà (dọc mùng), 5-6 trái đậu bắp, giá đỗ, ngò om (rau ngổ), ngò gai (mùi tàu), tỏi phi vàng.\n\n` +
        `• **4 Bước chuẩn vị:**\n` +
        `  1. 🔪 **Sơ chế cá:** Cá lóc làm sạch ruột, xát muối và nước cốt chanh cho sạch nhớt và tanh, cắt khúc vừa ăn.\n` +
        `  2. 🍲 **Nấu nước dùng chua thanh:** Đun sôi 1.2 lít nước, dầm me chín lấy nước cốt chua đổ vào nồi. Cho dứa và cá lóc vào đun sôi bùng, vớt sạch bọt.\n` +
        `  3. 🍅 **Thêm rau củ giòn ngọt:** Nêm nước mắm ngon, đường phèn và chút muối sao cho có vị chua ngọt hài hòa. Tiếp tục cho cà chua, đậu bắp, bạc hà vào đun sôi lại 2 phút (rau vừa chín tới giữ độ giòn).\n` +
        `  4. 🌿 **Hoàn thiện:** Tắt bếp, cho giá đỗ vào tô, múc cá và canh lên trên, rắc ngò om, ngò gai thái nhỏ và **tỏi phi vàng thơm lừng**. Chấm cá với chén nước mắm ớt mặn nguyên chất là đúng điệu Nam Bộ! 😋`
    };
  }

  // 1.5 CƠM TẤM SƯỜN NƯỚNG MẬT ONG
  if (norm.includes("com tam") || norm.includes("suon nuong com tam") || norm.includes("uop suon com tam")) {
    return {
      reply: `🥩 **BÍ QUYẾT ƯỚP SƯỜN NƯỚNG CƠM TẤM MỀM MỌNG, KHÔNG BỊ KHÔ:**\n\n` +
        `• **Gia vị ướp vàng cho 1kg sườn cốt lết:**\n` +
        `  - 2 muỗng canh sữa đặc Ông Thọ (Bí quyết giúp thớ thịt mềm ngọt mọng nước!).\n` +
        `  - 2 muỗng canh mật ong rừng.\n` +
        `  - 2 muỗng canh nước mắm ngon, 1 muỗng dầu hào, 1 muỗng dầu màu điều.\n` +
        `  - Tỏi, hành tím, đầu hành lá và sả băm nhuyễn vắt lấy nước cốt (không để xác bám vào thịt khi nướng sẽ bị cháy khét).\n` +
        `  - 1 muỗng canh mỡ heo hoặc bơ thực vật đun chảy.\n\n` +
        `• **Cách nướng:** Dùng sống dao đập nhẹ lên miếng sườn cho mềm sợi cơ. Ướp thịt ít nhất 2-4 tiếng trong ngăn mát tủ lạnh. Nướng trên than hoa lửa vừa, trong lúc nướng quét đều nước ướp pha chút mỡ hành lên mặt thịt. Sườn chín vàng ruộm, thơm nức mũi! 🤤`
    };
  }

  // 1.6 BÒ KHO BÁNH MÌ
  if (norm.includes("bo kho") || norm.includes("nau bo kho") || norm.includes("cach lam bo kho")) {
    return {
      reply: `🥖 **CÁCH NẤU BÒ KHO THƠM LỪNG, THỊT MỀM GÂN GIÒN CHUẨN VỊ:**\n\n` +
        `• **Nguyên liệu:** 1kg thịt nạm bò có đan xen gân giòn, 2 củ cà rốt, 4 cây sả đập dập, 1 gói bột gia vị bò kho (hoặc hoa hồi + quế), 1 quả dừa tươi, tỏi hành gừng băm.\n\n` +
        `• **Cách làm:**\n` +
        `  1. Thịt bò chần qua nước sôi gừng khử mùi, cắt quân cờ 3cm. Ướp với bột bò kho, 2 muỗng dầu màu điều, 1 muỗng mắm, 1 muỗng đường, tiêu, tỏi gừng băm trong 40 phút.\n` +
        `  2. Phi thơm sả đập dập và hành tỏi, trút thịt bò vào xào săn trên lửa lớn.\n` +
        `  3. Đổ nước dừa tươi ngập mặt thịt, hạ nhỏ lửa ninh liu riu 45 phút cho bò mềm rục.\n` +
        `  4. Cho cà rốt cắt khúc vào nấu thêm 15 phút. Pha 1 muỗng bột năng với chút nước hòa vào nồi để nước sốt sánh sệt đỏ cam đẹp mắt. Ăn cùng bánh mì nóng giòn hoặc hủ tiếu là tuyệt đỉnh! 🍲`
    };
  }

  // 1.7 LUỘC TRỨNG LÒNG ĐÀO
  if (norm.includes("luoc trung long dao") || norm.includes("trung long dao") || (norm.includes("luoc trung") && norm.includes("may phut"))) {
    return {
      reply: `🥚 **BẢNG THỜI GIAN LUỘC TRỨNG LÒNG ĐÀO CHUẨN XÁC TỪNG PHÚT:**\n\n` +
        `*(Tính từ thời điểm nước sôi sùng sục, hạ lửa vừa và thả nhẹ trứng vào nồi)*:\n\n` +
        `• **4 - 5 Phút:** Lòng trắng vừa đông nhẹ mềm mịn, lòng đỏ còn lỏng dạng sốt (thích hợp chấm bánh mì).\n` +
        `• **6 - 7 Phút (CHUẨN NGON NHẤT):** Lòng trắng chín giòn định hình, lòng đỏ dẻo quánh, dẻo sệt béo ngậy cực đỉnh!\n` +
        `• **8 - 9 Phút:** Lòng đỏ chín lòng đào đặc, chỉ còn ướt nhẹ ở tâm giữa.\n` +
        `• **10 - 12 Phút:** Trứng chín hoàn toàn (trứng luộc truyền thống).\n\n` +
        `💡 **MẸO BÓC VỎ SIÊU DỄ TRONG 3 GIÂY:**\n` +
        `Vừa hết thời gian, vớt ngay trứng thả vào một âu **nước đá lạnh ngắt** ngâm trong 5 phút. Sự sốc nhiệt sẽ làm lòng trắng co lại, tách rời màng vỏ, bóc một đường là vỏ tróc tuột ra trơn láng! 🧊✨`
    };
  }

  // 1.8 CÀ PHÊ MUỐI XỨ HUẾ
  if (norm.includes("ca phe muoi") || norm.includes("lam ca phe muoi") || norm.includes("pha ca phe muoi")) {
    return {
      reply: `☕ **CÔNG THỨC PHA CÀ PHÊ MUỐI XỨ HUẾ BÉO NGẬY, ĐẬM ĐÀ:**\n\n` +
        `• **Nguyên liệu:**\n` +
        `  - 25g cà phê Robusta pha phin nguyên chất (chiết xuất ra ~40-50ml cốt cà phê đậm).\n` +
        `  - 20ml sữa đặc Ông Thọ.\n` +
        `  - 40ml kem béo thực vật (Rich's lùn) hoặc Whipping Cream.\n` +
        `  - 1/4 muỗng cà phê muối hồng hoặc muối tinh sạch.\n\n` +
        `• **Cách làm:**\n` +
        `  1. 🥛 **Đánh lớp kem muối béo:** Cho kem béo Rich's, sữa tươi và muối vào ca, dùng máy đánh trứng cầm tay đánh bông mịn trong 1-2 phút đến khi kem đạt độ sánh dẻo nhẹ (không đánh cứng như kem bánh sinh nhật).\n` +
        `  2. ☕ **Rót cà phê:** Cho sữa đặc vào đáy ly, thêm đá viên đầy ly rồi rót cà phê phin đậm đà lên trên.\n` +
        `  3. 🧂 **Phủ màng kem muối:** Rót nhẹ nhàng lớp kem muối bồng bềnh lên trên cùng. Vị mặn nhẹ của muối sẽ trung hòa vị đắng gắt và làm bùng nổ vị béo ngọt thanh tao khó cưỡng! ✨`
    };
  }

  // 1.9 PHA NƯỚC MẮM CHUA NGỌT TỎI ỚT NỔI
  if (norm.includes("pha nuoc mam") || norm.includes("nuoc mam chua ngot") || norm.includes("nuoc mam cham nem")) {
    return {
      reply: `🥣 **CÔNG THỨC PHA NƯỚC MẮM CHUA NGỌT TỎI ỚT NỔI BỒNG BỀNH (TỶ LỆ VÀNG 1:1:1:4):**\n\n` +
        `• **Công thức chuẩn:** 1 muỗng mắm ngon + 1 muỗng đường + 1 muỗng nước cốt chanh + 4 muỗng nước ấm + tỏi ớt băm nhuyễn.\n\n` +
        `• **BÍ QUYẾT ĐỂ TỎI ỚT NỔI 100%:** Khuấy tan hoàn toàn Nước ấm + Đường + Nước chanh + Nước mắm trước cho hòa quyện. **Sau cùng mới thả tỏi và ớt băm khô vào!** Tỏi ớt sẽ nổi bồng bềnh lên mặt cực kỳ đẹp mắt! Chấm chả giò, nem rán, bún chả hay cá chiên đều ngon số 1! 🥢🌶️`
    };
  }

  // =========================================================================
  // 2. SỨC KHỎE, THỂ HÌNH & DINH DƯỠNG (HEALTH & FITNESS)
  // =========================================================================

  // 2.1 GIẢM CÂN AN TOÀN
  if (
    norm.includes("giam can") || norm.includes("giam mo") ||
    norm.includes("tham hut calo") || norm.includes("giam beo")
  ) {
    return {
      reply: `🏃‍♂️ **NGUYÊN TẮC GIẢM CÂN KHOA HỌC & AN TOÀN (KHÔNG NHỊN ĂN TIÊU CỰC):**\n\n` +
        `Quy luật khoa học duy nhất để giảm mỡ thành công là **THÂM HỤT CALO (Calorie Deficit)**:\n` +
        `$$\\text{Calo Nạp Vào (Ăn uống)} < \\text{Calo Tiêu Thụ (TDEE)}$$\n\n` +
        `• **1. Mức thâm hụt lý tưởng:** Giảm từ **300 - 500 kcal/ngày** so với mức TDEE của bạn. Giúp bạn giảm bền vững 0.5kg mỡ/tuần mà không bị mệt mỏi, sạm da hay rụng tóc.\n\n` +
        `• **2. Dinh dưỡng thông minh:**\n` +
        `  - **Tăng Protein (Đạm):** Ăn ức gà, cá, trứng, đậu phụ (chiếm 25-30% khẩu phần) giúp no lâu và bảo tồn cơ bắp.\n` +
        `  - **Chọn Carb tốt:** Thay cơm trắng/bánh ngọt bằng khoai lang, yến mạch, gạo lứt (chỉ số đường huyết GI thấp).\n` +
        `  - **Cắt giảm 'Calo rỗng':** Tuyệt đối ngưng trà sữa, nước ngọt có gas, đồ chiên rán ngập dầu và bia rượu.\n\n` +
        `• **3. Vận động hỗ trợ:** Đi bộ 8.000 - 10.000 bước mỗi ngày và tập kháng lực 3-4 buổi/tuần!`
    };
  }

  // 2.2 TĂNG CƠ / TĂNG CÂN CHO NGƯỜI GẦY
  if (norm.includes("tang can") || norm.includes("nguoi gay") || norm.includes("tang co") || norm.includes("bulking")) {
    return {
      reply: `💪 **LỘ TRÌNH TĂNG CÂN & TĂNG CƠ LÀNH MẠNH CHO NGƯỜI GẦY:**\n\n` +
        `• **1. Nguyên tắc Thặng dư Calo (Calorie Surplus):** Nạp dư **300 - 500 kcal/ngày** so với mức năng lượng tiêu hao.\n` +
        `• **2. Chia nhỏ bữa ăn (5-6 bữa/ngày):** Ngoài 3 bữa chính đầy đủ thịt cá cơm rau, bổ sung thêm 2-3 bữa phụ với: Chuối tiêu, sữa tươi nguyên kem, bơ đậu phộng, các loại hạt (hạnh nhân, óc chó) và sinh tố bơ.\n` +
        `• **3. Nạp đủ Protein:** 1.5g - 2.0g Protein / 1kg cân nặng (thịt bò, ức gà, trứng gà, đậu nành, Whey Protein).\n` +
        `• **4. Tập Gym / Kháng lực:** Tập trung các bài nâng tạ gánh đùi (Squat), đẩy ngực (Bench Press), hít xà (Pull-up) để kích thích tổng hợp cơ bắp thay vì tích mỡ thừa bụng dưới!`
    };
  }

  // 2.3 KHẮC PHỤC MẤT NGỦ
  if (norm.includes("mat ngu") || norm.includes("kho ngu") || norm.includes("ngu khong duoc") || norm.includes("bi mat ngu")) {
    return {
      reply: `🌙 **CÁCH KHẮC PHỤC MẤT NGỦ & CHÌM VÀO GIẤC NGỦ SAU 10 PHÚT:**\n\n` +
        `• **1. Kỹ thuật thở 4-7-8 (Thư giãn thần kinh):** Hít vào bằng mũi trong 4 giây -> Giữ hơi 7 giây -> Thở từ từ bằng miệng trong 8 giây. Lặp lại 4 chu kỳ giúp hạ nhịp tim và thả lỏng toàn bộ cơ bắp.\n` +
        `• **2. Vệ sinh giấc ngủ (Sleep Hygiene):**\n` +
        `  - Cắt toàn bộ ánh sáng xanh điện thoại/laptop trước khi ngủ 45 phút.\n` +
        `  - Không uống cà phê, trà đậm sau 14h chiều.\n` +
        `  - Nhiệt độ phòng ngủ lý tưởng: 24°C - 26°C, không gian tối và thông thoáng.\n` +
        `  - Uống 1 ly sữa ấm hoặc trà hoa cúc/tim sen ấm trước khi lên giường.`
    };
  }

  // 2.4 ĐAU MỎI VAI GÁY / ĐAU LƯNG DÂN VĂN PHÒNG
  if (norm.includes("vai gay") || norm.includes("dau co") || norm.includes("dau lung") || norm.includes("dau moi lung")) {
    return {
      reply: `🧘‍♂️ **GIẢI CỨU ĐAU MỎI CỔ VAI GÁY & CỘT SỐNG CHO DÂN IT / VĂN PHÒNG:**\n\n` +
        `• **1. Quy tắc ngồi công thái học 90-90-90:** Khuỷu tay gập 90 độ, đầu gối gập 90 độ, bàn chân đặt phẳng trên sàn. Màn hình máy tính ngang tầm mắt (không cúi gập cổ nhìn xuống laptop).\n` +
        `• **2. Bài tập thu cằm (Chin Tuck) 1 phút:** Ngồi thẳng lưng, dùng 2 ngón tay ấn nhẹ cằm ra phía sau như đang tạo "nọng cằm", giữ 5 giây rồi thả lỏng. Làm 10 lần giúp kéo giãn nhóm cơ cổ phía sau.\n` +
        `• **3. Quy tắc 50/10:** Cứ ngồi làm việc 50 phút thì đứng dậy đi lại, xoay khớp vai và uống một ly nước ấm!`
    };
  }

  // 2.5 LƯỢNG NƯỚC UỐNG HÀNG NGÀY
  if (norm.includes("uong bao nhieu nuoc") || norm.includes("luong nuoc moi ngay") || norm.includes("uong nuoc the nao")) {
    return {
      reply: `💧 **CÔNG THỨC TÍNH LƯỢNG NƯỚC CẦN UỐNG MỖI NGÀY:**\n\n` +
        `$$\\text{Lượng nước (Lít)} = \\text{Cân nặng (kg)} \\times 0.04$$\n` +
        `*(Ví dụ: 50kg cần 2.0L; 60kg cần 2.4L; 70kg cần 2.8L nước/ngày)*.\n\n` +
        `• **4 Thời điểm vàng:** Sau khi thức dậy, trước bữa ăn 30 phút, trước khi tắm và trước khi ngủ 30 phút (1 ngụm nhỏ). Uống từng ngụm nhỏ, không đợi khát mới uống!`
    };
  }

  // 2.6 ĐAU BỤNG, ĐAU DẠ DÀY, TIÊU HÓA, BỤNG DẠ
  if (
    norm.includes("dau bung") || norm.includes("dau da day") || norm.includes("dau bao tu") ||
    norm.includes("bot dau bung") || norm.includes("giam dau bung") || norm.includes("cach het dau bung") ||
    norm.includes("chua dau bung") || norm.includes("bi dau bung") || norm.includes("tieu chay") ||
    norm.includes("chuong bung") || norm.includes("day bung") || norm.includes("kho tieu")
  ) {
    return {
      reply: `🩺 **CÁCH GIẢM ĐAU BỤNG NHANH CHÓNG & AN TOÀN TẠI NHÀ:**\n\n` +
        `Ui thương bạn quá! Bị đau bụng rất mệt mỏi và khó chịu, bạn hãy áp dụng ngay các biện pháp làm dịu cơn đau này nhé:\n\n` +
        `1. 🍵 **Uống một cốc nước ấm hoặc trà gừng ấm:**\n` +
        `   • Nước ấm giúp giãn các cơ trơn dạ dày và đường ruột, làm dịu các cơn co thắt tức thì.\n` +
        `   • Nếu có gừng tươi, hãy đập dập 2-3 lát pha nước sôi ấm và chút mật ong; tinh chất gingerol trong gừng có tính kháng viêm và giảm co thắt rất hiệu quả.\n\n` +
        `2. ♨️ **Chườm ấm vùng bụng (Tác dụng giảm đau cực nhanh):**\n` +
        `   • Dùng túi chườm ấm (hoặc một chai nước ấm bọc trong khăn mỏng) đặt nhẹ lên vùng bụng quanh rốn trong 15-20 phút.\n` +
        `   • Nhiệt độ ấm sẽ kích thích tuần hoàn máu và giúp các bó cơ bụng thả lỏng thư giãn.\n\n` +
        `3. 🛏️ **Nghỉ ngơi đúng tư thế & Massage nhẹ:**\n` +
        `   • Hãy nằm co nhẹ hai đầu gối về phía bụng hoặc nằm nghiêng người sang bên trái để giảm áp lực lên các cơ quan nội tạng.\n` +
        `   • Dùng lòng bàn tay xoa nhẹ nhàng theo chiều kim đồng hồ quanh rốn trong 3-5 phút.\n\n` +
        `4. 🥣 **Ăn uống nhẹ nhàng (Tuyệt đối không ăn đồ kích thích):**\n` +
        `   • **Tuyệt đối tránh:** Đồ cay nóng, dầu mỡ chiên xào, đồ chua (chanh, xoài, giấm), sữa tươi, nước ngọt có ga và cà phê.\n` +
        `   • Nếu thấy đói, chỉ nên ăn cháo trắng loãng ấm, súp nhẹ hoặc vài lát bánh mì gối nướng giòn để trung hòa axit dịch vị.\n\n` +
        `⚠️ **LƯU Ý CẢNH BÁO Y TẾ:** Nếu bạn bị đau dữ dội ở vùng bụng dưới bên phải (dấu hiệu nghi viêm ruột thừa), đau quặn từng cơn kèm theo sốt cao, nôn mửa liên tục hoặc đi ngoài ra máu, hãy đến ngay cơ sở y tế hoặc bệnh viện gần nhất để bác sĩ kiểm tra kịp thời nhé!\n\n` +
        `Bạn nghỉ ngơi cho bụng êm lại nha, chúc bạn mau khỏi đau bụng và sớm khỏe lại nhé! ❤️🍀`
    };
  }

  // 2.7 ĐAU ĐẦU, NHỨC ĐẦU, CHÓNG MẶT
  if (
    norm.includes("dau dau") || norm.includes("nhuc dau") || norm.includes("chong mat") ||
    norm.includes("bot dau dau") || norm.includes("giam dau dau") || norm.includes("bi dau dau")
  ) {
    return {
      reply: `🤕 **CÁCH GIẢM ĐAU ĐẦU & NHỨC ĐẦU NHANH CHÓNG:**\n\n` +
        `• **1. Uống ngay 1 cốc nước ấm lớn:** Thiếu nước là thủ phạm phổ biến nhất gây đau nhức nửa đầu.\n` +
        `• **2. Tắt màn hình & Nghỉ ngơi nơi yên tĩnh:** Tạm gác máy tính/điện thoại, nằm nhắm mắt trong phòng tối thoáng khí 15-20 phút.\n` +
        `• **3. Massage bấm huyệt thái dương:** Dùng 2 ngón tay cái xoa tròn nhẹ nhàng hai bên thái dương và huyệt ấn đường (giữa hai đầu lông mày).\n` +
        `• **4. Chườm mát trán:** Đặt một chiếc khăn mát lên trán giúp co các mạch máu não đang căng tức.\n` +
        `• **5. Dùng thuốc khi cần:** Nếu đau nhiều, bạn có thể uống 1 viên Paracetamol 500mg sau ăn và nằm ngủ một giấc nhé!`
    };
  }

  // =========================================================================
  // 3. TÌNH YÊU, HẸN HÒ & GIAO TIẾP (DATING & RELATIONSHIPS)
  // =========================================================================

  // 3.1 BÍ QUYẾT TÁN GÁI / TÁN CRUSH TỪ A - Z
  if (
    norm.includes("tan gai") || norm.includes("tan crush") || norm.includes("cua gai") ||
    norm.includes("tan mot co gai") || norm.includes("tan mot ban nu") || norm.includes("cua cam") ||
    norm.includes("thich mot co gai") || norm.includes("thich mot ban nu") || norm.includes("cach tan gai") ||
    norm.includes("cach cua do") || norm.includes("bat chuyen voi crush") || (norm.includes("tan") && norm.includes("gai")) ||
    (norm.includes("tan") && norm.includes("co gai")) || (norm.includes("thich") && norm.includes("crush"))
  ) {
    return {
      reply: `💘 **CẨM NANG "THU HÚT & CƯA ĐỔ CRUSH" TỪ A - Z CHO CÁC CHÀNG TRAI:**\n\n` +
        `PhishArmor Assistant chia sẻ thật lòng nè: **Con gái không thích bị 'săn đuổi' dồn dập, họ bị 'thu hút' bởi sự chân thành, tự tin và tinh tế!** Dưới đây là chiến lược 4 giai đoạn chuẩn bài:\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🌿 **GIAI ĐOẠN 1: TÂM THẾ & NÂNG CẤP BẢN THÂN (ATTRACT, DON'T CHASE)**\n` +
        `• Cắt tóc gọn gàng, quần áo sạch sẽ thơm tho, xịt một chút nước hoa nhẹ dịu.\n` +
        `• Giữ cuộc sống thú vị: Chăm chỉ học tập, làm việc, tập gym. Một chàng trai có chí tiến thủ và đam mê luôn tỏa ra sức hút bí ẩn khó cưỡng!\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💬 **GIAI ĐOẠN 2: BẮT CHUYỆN DUYÊN DÁNG (TRÁNH 'EM ĂN CƠM CHƯA?')**\n` +
        `• **Tối kỵ:** Đừng nhắn *"Em ăn cơm chưa?"*, *"Em đang làm gì đấy?"*.\n` +
        `• **Mẹo hay:** Reply Story về một chủ đề nàng thích (quán cà phê đẹp, thú cưng, bài hát nàng share): *'Quán cà phê này ở đâu thế bạn, nhìn chill ghê'*, *'Bài hát này anh cũng nghe đi nghe lại cả tuần nay luôn đó'*!\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👂 **GIAI ĐOẠN 3: NGHỆ THUẬT NÓI CHUYỆN & KẾT NỐI SÂU SẮC**\n` +
        `• **Quy tắc 70/30:** Để cô ấy nói 70%, bạn nói 30% và đặt câu hỏi mở để nàng bộc lộ cảm xúc.\n` +
        `• **Ghi nhớ chi tiết nhỏ:** Nhớ nàng thích uống trà sữa ít đường hay nhiều đá, thích hoa gì. Sự chu đáo âm thầm này ăn điểm 100%!\n` +
        `• **Biết điểm dừng đúng lúc:** Khi cuộc trò chuyện đang vui nhất, chủ động xin phép dừng để hôm sau nàng mong ngóng tiếp.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `☕ **GIAI ĐOẠN 4: HẸN HÒ BUỔI ĐẦU TIÊN**\n` +
        `• Rủ có lý do cụ thể: *'Cuối tuần này anh ghé quán cà phê acoustic này hay lắm, chiều thứ Bảy em rảnh không anh qua đón em cùng đi nhé?'*.\n` +
        `• Chọn không gian yên tĩnh vừa phải để hai người dễ nhìn vào mắt nhau trò chuyện.\n\n` +
        `⛔ **CẤM KỴ:** Tuyệt đối không khủng bố tin nhắn khi nàng chưa kịp rep, không khoe mẽ vật chất và không vội vàng tỏ tình khi chưa đi chơi riêng vui vẻ 3-4 buổi nhé!`
    };
  }

  // 3.2 DẤU HIỆU BẠN NỮ BẬT ĐÈN XANH
  if (
    norm.includes("bat den xanh") || norm.includes("dau hieu con gai thich minh") ||
    norm.includes("lam sao biet co ay thich minh") || norm.includes("crush co thich minh khong")
  ) {
    return {
      reply: `🚦 **5 DẤU HIỆU KINH ĐIỂN CHO THẤY NÀNG ĐANG "BẬT ĐÈN XANH" CHO BẠN:**\n\n` +
        `1. 📱 **Tốc độ trả lời & Sự chủ động:** Cô ấy trả lời tin nhắn nhanh, không để cụt câu. Nếu bận, sau đó nàng sẽ chủ động giải thích lý do vì sao rep muộn.\n` +
        `2. 👁️ **Ngôn ngữ cơ thể:** Khi gặp mặt, nàng hay cười ngượng, đưa tay vuốt tóc, nghiêng người về phía bạn và ánh mắt long lanh.\n` +
        `3. 💌 **Tâm sự chuyện riêng:** Kể cho bạn nghe những chuyện gia đình, áp lực hoặc sở thích thầm kín mà nàng không kể với người ngoài.\n` +
        `4. ☕ **Luôn sẵn lòng khi bạn rủ đi chơi:** Dù bận, cô ấy vẫn cố gắng thu xếp hoặc chủ động gợi ý một ngày khác thay thế.\n` +
        `5. 🙈 **Có những cái chạm vô tình:** Nhẹ nhàng chạm tay, vỗ vai hoặc nép gần bạn khi đi dạo.\n\n` +
        `Có từ 3 dấu hiệu trở lên là đèn xanh đã sáng rực rỡ rồi đó bạn ơi! 🌟`
    };
  }

  // 3.3 PHÁI NỮ TÁN BẠN NAM / BẬT ĐÈN XANH CHO CRUSH NAM
  if (norm.includes("tan trai") || norm.includes("tan ban nam") || norm.includes("cua trai") || norm.includes("cach bat chuyen voi crush nam")) {
    return {
      reply: `🌸 **NGHỆ THUẬT "BẬT ĐÈN XANH" TINH TẾ ĐỂ CRUSH NAM CHỦ ĐỘNG TỎ TÌNH:**\n\n` +
        `Tâm lý học nam giới thực ra rất đơn giản: **Các chàng trai cực kỳ thích cảm giác được ngưỡng mộ, được cần đến và cảm giác che chở!**\n\n` +
        `1. 🛠️ **Nhờ chàng giúp đỡ những việc nhỏ:** Nhờ bạn ấy giải một bài toán khó, tư vấn mua laptop, chỉnh sửa mã code hoặc bê đồ nặng. Khi làm xong, hãy tặng chàng một nụ cười rạng rỡ và một lời cảm ơn chân thành: *'May mà có anh giúp, chứ không em không biết xoay xở sao luôn á!'*.\n\n` +
        `2. 👏 **Khen ngợi điểm mạnh thật lòng:** Con trai rất ít khi nhận được lời khen chân thành. Khen chàng áo hôm nay mặc hợp dáng, hoặc khen chàng xử lý công việc thông minh sẽ khiến chàng nhớ mãi cả ngày!\n\n` +
        `3. 👁️ **Giao tiếp bằng mắt 3 giây:** Nhìn thẳng vào mắt chàng, mỉm cười nhẹ rồi bẽn lẽn nhìn sang hướng khác. Tín hiệu này khiến chàng nhận ra bạn đặc biệt chú ý đến bạn ấy!\n\n` +
        `4. 💬 **Gợi ý khéo léo để chàng rủ đi chơi:** *'Dạo này có bộ phim này / quán ăn này nhìn ngon ghê mà em chưa có dịp đi thử...'*. Một chàng trai tinh ý sẽ lập tức chớp lấy thời cơ mời bạn đi ngay! 😉`
    };
  }

  // 3.4 VƯỢT QUA THẤT TÌNH / CHIA TAY
  if (norm.includes("that tinh") || norm.includes("chia tay") || norm.includes("bi tu choi") || norm.includes("nguoi yeu cu") || norm.includes("quen nguoi yeu cu")) {
    return {
      reply: `🌧️ **CÁCH CHỮA LÀNH TRÁI TIM & VƯỢT QUA CƠN ĐAU THẤT TÌNH / CHIA TAY:**\n\n` +
        `PhishArmor Assistant rất đồng cảm với nỗi buồn bạn đang trải qua. Trái tim bị tổn thương cũng giống như một vết thương hở, cần thời gian để kéo da non:\n\n` +
        `1. 🌊 **Cho phép bản thân được khóc và buồn:** Đừng gồng mình tỏ ra ổn! Hãy khóc thật to, nghe một vài bài nhạc buồn để xả hết cảm xúc dồn nén trong 1-2 ngày đầu.\n\n` +
        `2. 🚫 **Quy tắc tuyệt đối KHÔNG LIÊN LẠC (No Contact Rule):**\n` +
        `   - Tạm thời ẩn Story/Facebook của họ. Đừng vào trang cá nhân của họ xem họ đang làm gì để rồi tự làm đau chính mình.\n` +
        `   - Tuyệt đối không say xỉn rồi nhắn tin van xin quay lại! Sự níu kéo khi đối phương đã cạn tình chỉ làm giảm giá trị của bạn.\n\n` +
        `3. 🏃‍♀️ **Kích thích Dopamine & Endorphin tự nhiên:** Đi tập gym, chạy bộ, học thêm kỹ năng mới hoặc đi du lịch đổi gió cùng bạn thân.\n\n` +
        `4. 💎 **Nhìn nhận tích cực:** Người đó đến để dạy cho bạn một bài học trưởng thành. Cánh cửa này đóng lại là để một người tuyệt vời và xứng đáng hơn bước vào cuộc đời bạn! Cố lên nhé bạn ơi! ❤️`
    };
  }

  // 3.5 DUY TRÌ TÌNH YÊU LÂU DÀI & YÊU XA
  if (norm.includes("yeu xa") || norm.includes("tinh yeu lau dai") || norm.includes("giu lua tinh yeu")) {
    return {
      reply: `✈️ **BÍ QUYẾT GIỮ LỬA TÌNH YÊU LÂU BỀN & CHIẾN THẮNG KHOẢNG CÁCH YÊU XA:**\n\n` +
        `1. 📱 **Giao tiếp đều đặn nhưng chất lượng:** Đừng nhắn tin như báo cáo quân sự. Hãy gọi video cùng nhau nấu ăn, cùng xem một bộ phim hoặc chia sẻ những niềm vui vụn vặt trong ngày.\n\n` +
        `2. 🤝 **Sự tin tưởng tuyệt đối:** Khoảng cách địa lý dễ sinh ra nghi ngờ hoang mang. Hãy luôn rõ ràng và chủ động tạo cảm giác an toàn cho đối phương.\n\n` +
        `3. 🎁 **Những bất ngờ nhỏ không báo trước:** Lâu lâu đặt một ly trà sữa hoặc món ăn người ấy thích ship tận nhà kèm lời nhắn yêu thương.\n\n` +
        `4. 🎯 **Luôn có một cột mốc tái ngộ rõ ràng (End Date):** Tình yêu xa chỉ bền vững khi cả hai cùng nhìn về một tương lai: Biết chính xác ngày nào sẽ gặp lại và kế hoạch về chung một thành phố!`
    };
  }

  // 3.6 LÀM HÒA SAU TRANH CÃI
  if (norm.includes("lam hoa") || norm.includes("cai nhau") || norm.includes("gian nhau") || norm.includes("do ban gai giam")) {
    return {
      reply: `❤️ **CÁCH HÀN GẮN & LÀM HÒA KHÉO LÉO SAU KHI TRANH CÃI:**\n\n` +
        `1. 🧊 **Cho nhau khoảng lặng 1-2 tiếng:** Khi đang nóng giận, não lý trí bị cảm xúc lấn át, nói gì cũng dễ thành lời sát thương. Hãy đợi cả hai bình tâm lại trước.\n\n` +
        `2. 🤝 **Đích đến là 'Chúng ta cùng giải quyết vấn đề', không phải 'Ai thắng ai thua':** Dùng cấu trúc: *"Lúc nãy mình hơi nóng nảy nên lời nói chưa được khéo, mình xin lỗi vì đã làm bạn buồn. Chúng mình cùng ngồi lại nói chuyện nhẹ nhàng nhé."*\n\n` +
        `3. 🧋 **Hành động phá băng ngọt ngào:** Đặt một ly trà sữa/món ăn đối phương yêu thích kèm theo một mảnh giấy nhắn ngắn gọn, dễ thương. Sự chân thành và tôn trọng luôn là chìa khóa mở mọi cánh cửa! 🥰`
    };
  }

  // =========================================================================
  // 4. AN NINH MẠNG, BẢO VỆ TÀI KHOẢN & PHÒNG CHỐNG LỪA ĐẢO (CYBERSECURITY CORE)
  // =========================================================================

  // 4.1 CÁC HÌNH THỨC LỪA ĐẢO PHỔ BIẾN NHẤT HIỆN NAY
  if (
    norm.includes("cac hinh thuc lua dao") || norm.includes("chieu tro lua dao") ||
    norm.includes("lua dao mang") || norm.includes("bay lua dao")
  ) {
    return {
      reply: `🚨 **TOP 4 THỦ ĐOẠN LỪA ĐẢO TRỰC TUYẾN TINH VI NHẤT TẠI VIỆT NAM HIỆN NAY:**\n\n` +
        `1. 🎭 **Deepfake Video Call mạo danh người thân mượn tiền:** Kẻ gian dùng AI ghép khuôn mặt và giọng nói của người thân gọi video vài giây rồi giả vờ mạng chập chờn để giục chuyển tiền gấp.\n` +
        `2. 👮 **Mạo danh Công an, Viện kiểm sát đe dọa dính án ma túy/rửa tiền:** Gọi điện xưng cán bộ điều tra, yêu cầu tải ứng dụng 'Bộ Công An giả mạo' (.apk chứa mã độc đánh cắp tài khoản ngân hàng).\n` +
        `3. 📩 **Giả mạo SMS Brandname ngân hàng:** Nhắn tin báo 'Tài khoản của bạn bị khóa, đăng nhập ngay vào link... để xác thực'. Link dẫn tới trang web giả mạo giao diện ngân hàng để chiếm đoạt OTP.\n` +
        `4. 💼 **Tuyển Cộng tác viên làm nhiệm vụ Shopee/TikTok/Telegram:** Mồi chài làm nhiệm vụ thả tim nhận 20k-50k uy tín ban đầu, sau đó yêu cầu nạp tiền hàng chục triệu để 'hoàn tất đơn hàng lớn' rồi chiếm đoạt sạch tiền!\n\n` +
        `💡 *Nguyên tắc thép:* Cơ quan nhà nước KHÔNG BAO GIỜ làm việc qua điện thoại hay yêu cầu chuyển tiền; Ngân hàng KHÔNG BAO GIỜ gửi link yêu cầu nhập mã OTP!`,
      actionBtn: { text: "🔍 Kiểm Tra Ngay Một Link Nghi Vấn", url: "/scan" }
    };
  }

  // 4.2 LỠ BẤM VÀO LINK LỪA ĐẢO HOẶC LỠ NHẬP OTP THÌ PHẢI LÀM GÌ?
  if (
    norm.includes("lo bam vao link") || norm.includes("lo nhap otp") ||
    norm.includes("bi lua tien") || norm.includes("bi hack tai khoan") || norm.includes("lo nhap mat khau")
  ) {
    return {
      reply: `🆘 **KẾ HOẠCH KHẨN CẤP 4 BƯỚC KHI LỠ BẤM VÀO LINK LẠ HOẶC NHẬP MÃ OTP:**\n\n` +
        `1. 🛑 **BƯỚC 1 - KHÓA TÀI KHOẢN / KHÓA THẺ NGAY LẬP TỨC (TRONG 60 GIÂY ĐẦU):**\n` +
        `   • Mở ngay App ngân hàng trên điện thoại -> Chọn tính năng 'Khóa thẻ khẩn cấp' hoặc nhập sai mã PIN/mật khẩu 5 lần để tự động khóa tài khoản tạm thời.\n` +
        `   • Gọi thẳng đến Hotline tổng đài khẩn cấp 24/7 của ngân hàng yêu cầu nhân viên phong tỏa toàn bộ giao dịch đi!\n\n` +
        `2. 🔑 **BƯỚC 2 - ĐỔI MẬT KHẨU TOÀN BỘ TỪ MỘT THIẾT BỊ KHÁC:**\n` +
        `   • Dùng một máy tính hoặc điện thoại sạch khác để đổi mật khẩu Email chính, tài khoản ngân hàng, Facebook, Zalo.\n` +
        `   • Bấm 'Đăng xuất khỏi tất cả các thiết bị khác'.\n\n` +
        `3. 📴 **BƯỚC 3 - NGẮT KẾT NỐI MẠNG ĐIỆN THOẠI:**\n` +
        `   • Tắt Wi-Fi và 4G/5G ngay lập tức (hoặc bật Chế độ máy bay) nếu bạn vừa tải hoặc cài đặt tệp tin lạ đuôi '.apk' để ngăn mã độc truyền dữ liệu về máy chủ tin tặc.\n\n` +
        `4. 🚔 **BƯỚC 4 - BÁO CÁO CƠ QUAN CHỨC NĂNG:**\n` +
        `   • Chụp ảnh chụp màn hình lịch sử giao dịch và trình báo đến Công an phòng chống tội phạm công nghệ cao (A05) hoặc Cục An toàn thông tin.`,
      actionBtn: { text: "🛡️ Xem Trang Chặn & Cảnh Báo An Toàn", url: "/block" }
    };
  }

  // 4.3 CÁCH ĐẶT MẬT KHẨU AN TOÀN & BẢO VỆ 2FA
  if (norm.includes("mat khau an toan") || norm.includes("tao mat khau") || norm.includes("2fa la gi") || norm.includes("xac thuc 2 lop")) {
    return {
      reply: `🔐 **NGUYÊN TẮC THIẾT LẬP MẬT KHẨU BẤT KHẢ XÂM PHẠM & BẢO MẬT 2FA:**\n\n` +
        `• **1. Tránh xa các mật khẩu ngây thơ:** Tuyệt đối không dùng ngày sinh, số điện thoại, tên người yêu, '123456', 'admin123' hay 'password'.\n\n` +
        `• **2. Phương pháp Cụm mật khẩu (Passphrase):** Hãy ghép 4-5 từ ngẫu nhiên có nghĩa nhưng không ai đoán được kèm ký tự đặc biệt:\n` +
        `  Ví dụ: 'PhoBoHaNoi#NgonLam!2026' (Dài trên 16 ký tự, siêu dễ nhớ với bạn nhưng siêu máy tính phải mất hàng nghìn năm mới giải mã được!).\n\n` +
        `• **3. Kích hoạt Xác thực 2 bước (2FA):** Ưu tiên dùng ứng dụng tạo mã OTP như **Google Authenticator** hoặc **Microsoft Authenticator** thay vì SMS OTP!\n\n` +
        `• **4. Dùng Trình quản lý mật khẩu (Password Manager):** Bitwarden hoặc 1Password giúp bạn mỗi website dùng một mật khẩu ngẫu nhiên khác nhau mà không sợ bị quên!`
    };
  }

  // =========================================================================
  // 5. KHOA HỌC TỰ NHIÊN, VŨ TRỤ & HIỆN TƯỢNG ĐỜI SỐNG (SCIENCE & NATURE)
  // =========================================================================

  // 5.1 TẠI SAO BẦU TRỜI MÀU XANH?
  if (norm.includes("tai sao bau troi mau xanh") || norm.includes("vi sao bau troi xanh") || norm.includes("bau troi lai co mau xanh")) {
    return {
      reply: `🌌 **TẠI SAO BẦU TRỜI CÓ MÀU XANH LAM? (HIỆN TƯỢNG TÁN XẠ RAYLEIGH):**\n\n` +
        `Nguyên nhân hoàn toàn xuất phát từ vật lý quang học và khí quyển học:\n\n` +
        `1. ☀️ **Bản chất ánh sáng Mặt Trời:** Ánh sáng trắng từ Mặt Trời thực chất là sự tổng hợp của 7 sắc cầu vồng với các bước sóng khác nhau (từ bước sóng dài như Đỏ, Cam đến bước sóng ngắn như Xanh lam, Chàm, Tím).\n\n` +
        `2. 💨 **Tán xạ Rayleigh trong khí quyển:** Khí quyển Trái Đất chứa vô số phân tử khí Oxy ($O_2$) và Nitơ ($N_2$). Các phân tử này có kích thước nhỏ hơn bước sóng ánh sáng. Theo định luật Rayleigh, các hạt này tán xạ ánh sáng bước sóng ngắn (xanh lam, tím) **mạnh gấp 10 lần** so với ánh sáng bước sóng dài (đỏ, vàng).\n\n` +
        `3. 👁️ **Mắt người:** Mặc dù màu tím bị tán xạ mạnh nhất, nhưng mắt người có các tế bào hình nón nhạy cảm hơn rất nhiều với ánh sáng màu **Xanh Lam (Blue)**. Do đó, toàn bộ vòm trời hiện lên trước mắt chúng ta với màu xanh lam trong vắt!\n\n` +
        `*(Vào lúc hoàng hôn, ánh sáng phải đi qua tầng khí quyển dày hơn gấp nhiều lần, ánh sáng xanh bị tán xạ hết sạch trên đường đi, chỉ còn dải ánh sáng Đỏ và Cam đến được mắt ta, tạo nên cảnh hoàng hôn đỏ rực!)*`
    };
  }

  // 5.2 TẠI SAO LÁ CÂY MÀU XANH?
  if (norm.includes("tai sao la cay mau xanh") || norm.includes("vi sao la cay mau xanh") || norm.includes("la cay co mau xanh")) {
    return {
      reply: `🍃 **TẠI SAO LÁ CÂY LẠI CÓ MÀU XANH LỤC?**\n\n` +
        `• **1. Sắc tố Diệp Lục (Chlorophyll):** Trong tế bào lá cây chứa hàng triệu bào quan gọi là lục lạp, bên trong có chất diệp lục đảm nhận nhiệm vụ hấp thụ ánh sáng để quang hợp.\n\n` +
        `• **2. Cơ chế quang phổ học:** Chất diệp lục hấp thụ rất mạnh năng lượng từ ánh sáng dải màu **Đỏ** và **Xanh lam** của ánh sáng Mặt Trời để tạo ra đường Glucose. Tuy nhiên, nó **KHÔNG hấp thụ** dải ánh sáng màu **Xanh Lục (Green)**.\n\n` +
        `• **3. Phản chiếu vào mắt:** Ánh sáng xanh lục bị diệp lục phản xạ lại môi trường và truyền thẳng vào mắt chúng ta. Đó là lý do mắt người nhìn thấy lá cây có màu xanh lục mướt mắt! 🌿`
    };
  }

  // 5.3 TẠI SAO NƯỚC ĐÁ NỔI TRÊN NƯỚC?
  if (norm.includes("tai sao da noi tren nuoc") || norm.includes("vi sao bang noi") || norm.includes("nuoc da noi")) {
    return {
      reply: `🧊 **TẠI SAO NƯỚC ĐÁ (BĂNG) LẠI NỔI ĐƯỢC TRÊN MẶT NƯỚC LỎNG?**\n\n` +
        `Thông thường, hầu hết các chất khi đông đặc lại sẽ co lại và chìm xuống vì nặng hơn. Nhưng **NƯỚC LÀ MỘT NGOẠI LỆ KỲ DIỆU CỦA TỰ NHIÊN**:\n\n` +
        `1. ❄️ **Cấu trúc tinh thể liên kết Hydro:** Khi nhiệt độ hạ xuống dưới 4°C và đóng băng ở 0°C, các liên kết hydro giữ các phân tử nước cố định thành một mạng tinh thể hình lục giác rỗng có nhiều khoảng trống.\n\n` +
        `2. ⚖️ **Khối lượng riêng nhẹ hơn:** Cấu trúc rỗng này làm **thể tích tăng lên khoảng 9%**, dẫn đến khối lượng riêng của nước đá chỉ đạt khoảng **0.917 g/cm³**, nhẹ hơn khối lượng riêng của nước lỏng (**1.0 g/cm³**).\n\n` +
        `💡 *Ý nghĩa sinh tồn vĩ đại:* Nhờ tính chất này mà vào mùa đông ở các vùng cực, chỉ có bề mặt hồ/biển đóng băng, lớp băng nổi lên cách nhiệt giúp nguồn nước bên dưới vẫn ở dạng lỏng, bảo vệ toàn bộ sinh vật biển sống sót qua mùa đông buốt giá!`
    };
  }

  // 5.4 TỐC ĐỘ ÁNH SÁNG
  if (norm.includes("toc do anh sang") || norm.includes("van toc anh sang") || norm.includes("anh sang di chuyen")) {
    return {
      reply: `⚡ **TỐC ĐỘ ÁNH SÁNG TRONG CHÂN KHÔNG:**\n\n` +
        `$$c = 299.792.458\\ \\text{m/s}\\ \\approx 300.000\\ \\text{km/s}$$\n\n` +
        `• **Những con số kinh ngạc về tốc độ ánh sáng:**\n` +
        `  - Trong 1 giây, ánh sáng có thể chạy quanh Trái Đất **7.5 vòng**!\n` +
        `  - Ánh sáng từ Mặt Trời mất khoảng **8 phút 20 giây** để đến Trái Đất (khoảng cách 150 triệu km).\n` +
        `  - Theo Thuyết tương đối hẹp của Einstein, $c$ là giới hạn tốc độ tối đa của toàn bộ vũ trụ. Không một vật thể nào có khối lượng có thể tăng tốc bằng hoặc vượt qua tốc độ ánh sáng!`
    };
  }

  // 5.5 ĐỊNH LÝ PYTHAGORAS (PYTAGO)
  if (norm.includes("pythagoras") || norm.includes("pytago") || norm.includes("dinh ly pytago")) {
    return {
      reply: `📐 **ĐỊNH LÝ PYTHAGORAS (ĐỊNH LÝ PY-TA-GO TRONG HÌNH HỌC):**\n\n` +
        `• **Phát biểu:** Trong một tam giác vuông, bình phương của cạnh huyền bằng tổng bình phương của hai cạnh góc vuông.\n\n` +
        `$$\\mathbf{c^2 = a^2 + b^2}$$\n` +
        `*(Trong đó $c$ là độ dài cạnh huyền đối diện góc $90^\\circ$; $a$ và $b$ là độ dài hai cạnh góc vuông)*.\n\n` +
        `• **Bộ ba số Pythagoras kinh điển:**\n` +
        `  - Tam giác $(3, 4, 5)$: $3^2 + 4^2 = 9 + 16 = 25 = 5^2$.\n` +
        `  - Tam giác $(5, 12, 13)$: $5^2 + 12^2 = 25 + 144 = 169 = 13^2$.\n` +
        `  - Tam giác $(6, 8, 10)$, $(7, 24, 25)$.`
    };
  }

  // 5.6 HỐ ĐEN VŨ TRỤ (BLACK HOLE)
  if (norm.includes("ho den") || norm.includes("black hole") || norm.includes("ho den la gi")) {
    return {
      reply: `🕳️ **HỐ ĐEN (BLACK HOLE) LÀ GÌ? ĐIỀU GÌ XẢY RA KHI RƠI VÀO HỐ ĐEN?**\n\n` +
        `• **Bản chất vũ trụ học:** Hố đen là một vùng không-thời gian có trường hấp dẫn cực kỳ mãnh liệt do một lượng khối lượng khổng lồ bị nén vào một điểm có thể tích bằng 0 gọi là **Điểm Kỳ Dị (Singularity)**.\n\n` +
        `• **Chân trời sự kiện (Event Horizon):** Ranh giới một đi không trở lại bao quanh hố đen. Một khi bất kỳ vật chất nào, kể cả **ánh sáng** (vật thể bay nhanh nhất vũ trụ với 300.000 km/s), vượt qua chân trời sự kiện thì đều không thể thoát ra ngoài!\n\n` +
        `• **Hiệu ứng Mì Ý (Spaghettification):** Nếu một phi hành gia rơi vào hố đen, lực hấp dẫn tác động lên đôi chân sẽ mạnh hơn gấp hàng triệu lần tác động lên đầu, kéo giãn cơ thể bạn dài ra mỏng manh như một sợi mì Ý trước khi chạm đến điểm kỳ dị!\n\n` +
        `💡 *Phát hiện thế kỷ:* Năm 2019, kính viễn vọng Event Horizon Telescope (EHT) đã lần đầu tiên trong lịch sử nhân loại chụp được bức ảnh thực tế của hố đen siêu nặng ở trung tâm thiên hà M87!`
    };
  }

  // 5.7 TẠI SAO NƯỚC BIỂN LẠI MẶN?
  if (norm.includes("tai sao nuoc bien man") || norm.includes("vi sao bien man") || norm.includes("nuoc bien co vi man")) {
    return {
      reply: `🌊 **TẠI SAO NƯỚC BIỂN LẠI CÓ VỊ MẶN MÀ NƯỚC SÔNG SUỐI LẠI NGỌT?**\n\n` +
        `Nguyên nhân bắt nguồn từ một chu trình địa chất kéo dài hàng tỷ năm:\n\n` +
        `1. 🌧️ **Nước mưa hòa tan khoáng chất:** Nước mưa hấp thụ khí CO2 trong khí quyển tạo thành axit carbonic yếu. Khi mưa rơi xuống đất đá và đồi núi, tính axit nhẹ này bào mòn và hòa tan các khoáng chất, đặc biệt là các ion Natri ($Na^+$) và Clorua ($Cl^-$).\n\n` +
        `2. 🏞️ **Đổ dồn về đại dương:** Các con sông suối cuốn theo các khoáng chất này chảy ra biển cả. Nước sông cũng có một chút muối nhưng nồng độ quá loãng nên mắt thường và lưỡi ta cảm thấy nước ngọt.\n\n` +
        `3. ☀️ **Nước bốc hơi, muối tích tụ:** Khi ánh nắng Mặt Trời chiếu xuống biển, chỉ có nước nguyên chất ($H_2O$) bốc hơi lên trời tạo thành mây, còn toàn bộ muối bị giữ lại dưới biển. Trải qua hơn 4 tỷ năm tích tụ liên tục, nồng độ muối trung bình của nước biển hiện nay đạt khoảng **3.5%** (tương đương 35g muối trong mỗi lít nước biển)!`
    };
  }

  // 5.8 SẤM SÉT VÀ SẤM CHỚP HÌNH THÀNH THẾ NÀO?
  if (norm.includes("sam set") || norm.includes("sam chop") || norm.includes("tai sao co set") || norm.includes("tia set")) {
    return {
      reply: `⚡ **SẤM SÉT VÀ TIA CHỚP ĐƯỢC HÌNH THÀNH NHƯ THẾ NÀO?**\n\n` +
        `• **1. Tích tụ điện tích trong đám mây dông:** Trong các đám mây dông khổng lồ, các hạt băng nhẹ mang **điện tích dương** bay lên đỉnh mây, còn các hạt mưa/băng nặng mang **điện tích âm** lắng xuống đáy đám mây.\n\n` +
        `• **2. Phóng điện khổng lồ (Tia sét):** Sự chênh lệch điện tích giữa đám mây và mặt đất tạo ra một điện trường cực lớn lên đến hàng triệu Volt. Một dòng điện plasma khổng lồ phóng thẳng xuống đất với nhiệt độ lên tới **30.000°C** (nóng gấp 5 lần bề mặt Mặt Trời!).\n\n` +
        `• **3. Tiếng sấm rền:** Nhiệt độ cực lớn của tia sét làm không khí xung quanh giãn nở đột ngột với tốc độ siêu âm, tạo ra một làn sóng xung kích âm thanh nổ vang rền mà chúng ta gọi là **tiếng sấm**!\n\n` +
        `💡 *Vì tốc độ ánh sáng (300.000 km/s) nhanh hơn tốc độ âm thanh (340 m/s), nên ta luôn nhìn thấy tia chớp lóe lên trước rồi mới nghe thấy tiếng sấm sau vài giây!*`
    };
  }

  // 5.9 TRÍ TUỆ NHÂN TẠO (AI) & LARGE LANGUAGE MODELS (LLM) LÀ GÌ?
  if (
    norm.includes("tri tue nhan tao la gi") || norm.includes("ai hoat dong the nao") ||
    norm.includes("llm la gi") || norm.includes("chatgpt hoat dong the nao") || norm.includes("chatgpt la gi")
  ) {
    return {
      reply: `🤖 **BẢN CHẤT CỦA TRÍ TUỆ NHÂN TẠO (AI) & MÔ HÌNH NGÔN NGỮ LỚN (LLM):**\n\n` +
        `• **Bản chất cốt lõi:** Các AI như ChatGPT, Gemini hay PhoBERT thực chất là những cỗ máy toán học khổng lồ được xây dựng trên kiến trúc **Transformer (Cơ chế Attention - Chú ý)** do Google phát minh năm 2017.\n\n` +
        `• **Cách AI suy nghĩ và trả lời:**\n` +
        `  1. 📚 **Tiền huấn luyện (Pre-training):** AI đọc hàng trăm tỷ từ ngữ từ sách báo, Internet để học cấu trúc ngôn ngữ và tri thức loài người.\n` +
        `  2. 🎲 **Dự đoán từ tiếp theo (Next Token Prediction):** Khi bạn đặt câu hỏi, AI không 'suy nghĩ' theo kiểu ý thức con người, mà nó tính toán xác suất toán học xem **từ ngữ nào là phù hợp và hợp lý nhất để xuất hiện tiếp theo** dựa trên ngữ cảnh câu trước.\n` +
        `  3. 🎯 **Tinh chỉnh theo hành vi con người (RLHF):** Các chuyên gia huấn luyện bổ sung để AI trả lời lịch sự, an toàn, hữu ích và trung thực.\n\n` +
        `💡 *Trong dự án PhishArmor AI:* Hệ thống kết hợp mô hình học sâu **PhoBERT VinAI** (được huấn luyện riêng trên tiếng Việt) và thuật toán **XGBoost** để phát hiện các bẫy tâm lý lừa đảo cực kỳ chuẩn xác!`,
      actionBtn: { text: "🎯 Xem Kiến Trúc 4 Tầng AI PhishArmor", url: "/metrics" }
    };
  }

  // =========================================================================
  // 6. ĐỊA LÝ & THỦ ĐÔ CÁC QUỐC GIA (WORLD GEOGRAPHY)
  // =========================================================================
  if (
    norm.includes("thu do cua") || norm.includes("thu do nuoc") ||
    norm.includes("nuoc phap thu do") || norm.includes("thu do la gi")
  ) {
    if (norm.includes("uc") || norm.includes("australia")) {
      return {
        reply: `🇦🇺 **Thủ đô của nước Úc (Australia) chính là thành phố CANBERRA!**\n\n` +
          `Rất nhiều người thường nhầm lẫn thủ đô của Úc là Sydney hay Melbourne vì hai thành phố này quá nổi tiếng. Tuy nhiên, vào năm 1908, để giải quyết sự cạnh tranh giữa Sydney và Melbourne, chính phủ Úc đã quyết định xây dựng thành phố **Canberra** nằm ở giữa hai bang để làm thủ đô chính thức!`
      };
    }
    if (norm.includes("canada")) {
      return {
        reply: `🇨🇦 **Thủ đô của Canada chính là thành phố OTTAWA!**\n\n` +
          `(Nhiều người hay nhầm là Toronto hay Vancouver, nhưng thủ đô hành chính của Canada từ năm 1857 là Ottawa theo sắc lệnh của Nữ hoàng Victoria).`
      };
    }
    if (norm.includes("my") || norm.includes("hoa ky") || norm.includes("usa")) {
      return {
        reply: `🇺🇸 **Thủ đô của Hợp chúng quốc Hoa Kỳ (Mỹ) là WASHINGTON, D.C.!**\n\n` +
          `Thành phố New York là trung tâm kinh tế tài chính lớn nhất, nhưng thủ đô hành chính nơi đặt Nhà Trắng và Điện Capitol là thủ đô Washington, D.C. (District of Columbia).`
      };
    }
    if (norm.includes("phap") || norm.includes("france")) {
      return {
        reply: `🇫🇷 **Thủ đô của nước Pháp là kinh đô ánh sáng PARIS!**\n\n` +
          `Paris là trung tâm văn hóa, nghệ thuật, thời trang và ẩm thực hàng đầu thế giới, nổi tiếng với Tháp Eiffel, Bảo tàng Louvre, Nhà thờ Đức Bà Paris và dòng sông Seine thơ mộng.`
      };
    }
    if (norm.includes("nhat ban") || norm.includes("japan")) {
      return {
        reply: `🇯🇵 **Thủ đô của Nhật Bản là thành phố TOKYO!**\n\n` +
          `Tokyo là một trong những siêu đô thị hiện đại, sầm uất và an toàn bậc nhất hành tinh với hơn 14 triệu dân.`
      };
    }
    if (norm.includes("han quoc") || norm.includes("korea")) {
      return {
        reply: `🇰🇷 **Thủ đô của Hàn Quốc là thành phố SEOUL!**\n\n` +
          `Trái tim của xứ sở Kim Chi, nổi tiếng với dòng sông Hàn, tháp N Seoul và sự kết hợp hài hòa giữa cung điện cổ kính và công nghệ hiện đại.`
      };
    }
    if (norm.includes("trung quoc") || norm.includes("china")) {
      return {
        reply: `🇨🇳 **Thủ đô của Trung Quốc là BẮC KINH (BEIJING)!**\n\n` +
          `Thành phố lịch sử hơn 3.000 năm với Tử Cấm Thành, Quảng trường Thiên An Môn và Vạn Lý Trường Thành kỳ vĩ.`
      };
    }
    if (norm.includes("nga") || norm.includes("russia")) {
      return {
        reply: `🇷🇺 **Thủ đô của nước Nga là MÁT-XCƠ-VA (MOSCOW)!**\n\n` +
          `Nổi tiếng với Quảng trường Đỏ, Điện Kremlin và hệ thống tàu điện ngầm được ví như những cung điện nguy nga dưới lòng đất.`
      };
    }
    if (norm.includes("anh") || norm.includes("uk") || norm.includes("england")) {
      return {
        reply: `🇬🇧 **Thủ đô của Vương quốc Anh là thành phố LONDON!**\n\n` +
          `Nổi tiếng với tháp đồng hồ Big Ben, vòng quay London Eye, Cầu Tháp và Cung điện Buckingham.`
      };
    }
    if (norm.includes("thuy si") || norm.includes("switzerland")) {
      return {
        reply: `🇨🇭 **Thủ đô của Thụy Sĩ là thành phố BERN!**\n\n` +
          `(Zurich và Geneva là hai trung tâm tài chính và ngoại giao lớn nhất, nhưng Bern mới là thủ đô liên bang của Thụy Sĩ).`
      };
    }
    if (norm.includes("brazil")) {
      return {
        reply: `🇧🇷 **Thủ đô của Brazil là thành phố BRASÍLIA!**\n\n` +
          `(Nhiều người hay nhầm là Rio de Janeiro hay São Paulo, nhưng Brasília được xây dựng thần tốc từ năm 1960 để làm thủ đô mới).`
      };
    }
  }

  // =========================================================================
  // 7. HỌC TẬP, NGOẠI NGỮ & NĂNG SUẤT (STUDY & PRODUCTIVITY)
  // =========================================================================

  // 7.1 HỌC TIẾNG ANH CHO NGƯỜI MẤT GỐC
  if (
    norm.includes("hoc tieng anh") || norm.includes("tieng anh mat goc") ||
    norm.includes("hoc anh van") || norm.includes("mat goc tieng anh")
  ) {
    return {
      reply: `🇬🇧 **LỘ TRÌNH 4 BƯỚC HỌC TIẾNG ANH HIỆU QUẢ CHO NGƯỜI MẤT GỐC:**\n\n` +
        `• **Giai đoạn 1 - Chuẩn hóa Phát âm IPA (2 - 3 tuần):** Học thuộc **44 âm trong bảng phiên âm quốc tế IPA**. Phát âm đúng sẽ giúp tai bạn nghe chuẩn và không còn ngại nói.\n\n` +
        `• **Giai đoạn 2 - 1.000 Từ vựng cốt lõi theo ngữ cảnh (1 - 2 tháng):** Dùng phương pháp lặp lại ngắt quãng Spaced Repetition (App Anki). Học cả cụm từ (Collocations) thay vì học từ đơn lẻ.\n\n` +
        `• **Giai đoạn 3 - 5 Thì cơ bản trong giao tiếp:** Hiện tại đơn, Quá khứ đơn, Hiện tại hoàn thành, Tương lai đơn và Hiện tại tiếp diễn.\n\n` +
        `• **Giai đoạn 4 - Tắm ngôn ngữ mỗi ngày:** Xem phim sitcom *Friends*, luyện nghe *BBC Learning English, TED-Ed*, luyện nói độc thoại nhại giọng (Shadowing) 15 phút mỗi ngày!`
    };
  }

  // 7.2 PHƯƠNG PHÁP POMODORO
  if (norm.includes("pomodoro") || norm.includes("qua ca chua") || norm.includes("tap trung lam viec")) {
    return {
      reply: `🍅 **PHƯƠNG PHÁP POMODORO (QUẢ CÀ CHUA) - VŨ KHÍ TẬP TRUNG ĐỈNH CAO:**\n\n` +
        `• **Quy trình 5 bước thực hiện:**\n` +
        `  1. 📝 Chọn 1 nhiệm vụ duy nhất cần hoàn thành.\n` +
        `  2. ⏱️ Cài đặt hẹn giờ 25 phút (1 Pomodoro).\n` +
        `  3. 🚀 Tập trung cao độ 100%, không lướt điện thoại cho đến khi chuông reo.\n` +
        `  4. ☕ Nghỉ ngắn 5 phút (vươn vai, uống nước, nhìn xa).\n` +
        `  5. 🔄 Sau 4 chu kỳ Pomodoro (100 phút), thưởng cho mình kỳ nghỉ dài 15 - 30 phút để nạp lại năng lượng não bộ!`
    };
  }

  // 7.3 KỸ THUẬT FEYNMAN
  if (norm.includes("feynman") || norm.includes("hoc nhanh nho lau") || norm.includes("cach hoc thong minh")) {
    return {
      reply: `🧠 **KỸ THUẬT FEYNMAN - BÍ QUYẾT HỌC BẤT KỲ ĐIỀU GÌ SIÊU TỐC:**\n\n` +
        `Nguyên lý: *"Nếu bạn không thể giải thích điều gì đó một cách đơn giản, bạn chưa thực sự hiểu rõ nó!"*\n\n` +
        `• **4 Bước thực hiện:**\n` +
        `  1. 📖 Viết tên khái niệm bạn muốn học lên đầu trang giấy.\n` +
        `  2. 👶 Giảng lại khái niệm đó cho một đứa trẻ 10 tuổi bằng ngôn ngữ giản dị, cấm dùng thuật ngữ phức tạp.\n` +
        `  3. 🔍 Tìm ra lỗ hổng: Chỗ nào bạn bị khựng lại hay ấp úng? Đó chính là điểm bạn chưa nắm chắc!\n` +
        `  4. 📚 Mở lại tài liệu, đọc lại đúng chỗ đó và đơn giản hóa tiếp bằng ví dụ so sánh trực quan cho đến khi hiểu sâu sắc!`
    };
  }

  // =========================================================================
  // 8. CÔNG NGHỆ, LẬP TRÌNH & NGHỀ NGHIỆP IT (TECH & CODING)
  // =========================================================================

  // 8.1 NÊN HỌC PYTHON HAY JAVASCRIPT
  if (
    (norm.includes("python") && norm.includes("javascript")) ||
    (norm.includes("nen hoc ngon ngu gi") || norm.includes("lap trinh nen hoc gi"))
  ) {
    return {
      reply: `💻 **SO SÁNH PYTHON VS JAVASCRIPT - NÊN CHỌN HỌC NGÔN NGỮ NÀO?**\n\n` +
        `• **1. Chọn PYTHON nếu bạn muốn theo hướng:**\n` +
        `  - Trí tuệ nhân tạo (AI), Học máy (Machine Learning), Khoa học dữ liệu (Data Science).\n` +
        `  - Tự động hóa tác vụ (Automation / Scripting).\n` +
        `  - *Ưu điểm:* Cú pháp trong sáng, cực kỳ dễ học cho người mới bắt đầu.\n\n` +
        `• **2. Chọn JAVASCRIPT nếu bạn muốn theo hướng:**\n` +
        `  - Phát triển Website: Frontend (React, Next.js, Vue) lẫn Backend (Node.js, Express).\n` +
        `  - Phát triển ứng dụng di động đa nền tảng (React Native).\n` +
        `  - *Ưu điểm:* Ngôn ngữ độc tôn của trình duyệt web, thị trường tuyển dụng cực kỳ khổng lồ!\n\n` +
        `💡 *Lời khuyên:* Người mới toanh có thể học **Python** trước để rèn tư duy logic, sau đó học **JavaScript** để xây dựng ứng dụng thực tế!`
    };
  }

  // 8.2 REACT VS VUE VS ANGULAR
  if (
    (norm.includes("react") && (norm.includes("vue") || norm.includes("angular"))) ||
    norm.includes("frontend framework")
  ) {
    return {
      reply: `⚛️ **SO SÁNH BỘ BA QUYỀN LỰC FRONTEND: REACT VS VUE VS ANGULAR:**\n\n` +
        `• 🔵 **React (Meta / Facebook):** Thư viện UI dựa trên Component. Cộng đồng đông nhất thế giới, hệ sinh thái đồ sộ (Next.js, Tailwind), cơ hội việc làm áp đảo.\n\n` +
        `• 🟢 **Vue.js (Evan You):** Framework tiến bộ, dễ học nhất, tài liệu tuyệt đẹp, cú pháp Template trực quan, tối ưu sẵn cho startup.\n\n` +
        `• 🔴 **Angular (Google):** Framework hoàn chỉnh 'All-in-one' với TypeScript chặt chẽ, phù hợp cho hệ thống doanh nghiệp lớn (Enterprise) và ngân hàng.`
    };
  }

  // 8.3 DOCKER LÀ GÌ?
  if (norm.includes("docker la gi") || norm.includes("container la gi") || norm.includes("tai sao dung docker")) {
    return {
      reply: `🐳 **DOCKER LÀ GÌ? TẠI SAO MỌI LẬP TRÌNH VIÊN ĐỀU CẦN DOCKER?**\n\n` +
        `• **Bài toán kinh điển:** *"Trên máy em chạy bình thường mà sao đem qua máy server/máy sếp thì nó báo lỗi tè le?"* 😭\n\n` +
        `• **Lời giải của Docker:** Đóng gói toàn bộ mã nguồn cùng với môi trường chạy (OS, Python/Node version, thư viện phụ thuộc, cấu hình) vào một chiếc 'thùng hàng' độc lập gọi là **Container**.\n\n` +
        `• **Lợi ích:** Đảm bảo code chạy trên máy bạn thế nào thì trên Cloud (AWS, Azure) sẽ chạy y hệt 100%. Siêu nhẹ, khởi động chỉ mất vài giây và tốn cực ít RAM so với Máy ảo (VM)!`
    };
  }

  // 8.4 SQL VS NOSQL
  if (norm.includes("sql") && norm.includes("nosql")) {
    return {
      reply: `🗄️ **SO SÁNH CƠ SỞ DỮ LIỆU SQL VS NOSQL:**\n\n` +
        `• 📊 **SQL (Relational Database - MySQL, PostgreSQL):**\n` +
        `  - Lưu trữ dữ liệu dạng bảng với các hàng và cột có cấu trúc Schema định sẵn.\n` +
        `  - Đảm bảo tính toàn vẹn dữ liệu tuyệt đối (ACID). Rất thích hợp cho giao dịch tài chính, ngân hàng, quản lý đơn hàng e-commerce.\n\n` +
        `• 🍃 **NoSQL (Non-relational - MongoDB, Redis):**\n` +
        `  - Lưu trữ linh hoạt dạng JSON Document, Key-Value hoặc Graph, không cần Schema cố định.\n` +
        `  - Tốc độ đọc ghi cực nhanh, dễ dàng mở rộng phân tán theo chiều ngang (Horizontal Scaling). Rất thích hợp cho mạng xã hội, dữ liệu IoT, Big Data, cache lưu trữ tạm thời.`
    };
  }

  // 8.5 LỘ TRÌNH HỌC LẬP TRÌNH TỪ CON SỐ 0
  if (norm.includes("hoc lap trinh") || norm.includes("bat dau hoc code") || norm.includes("roadmap it") || norm.includes("moi hoc lap trinh")) {
    return {
      reply: `💻 **LỘ TRÌNH HỌC LẬP TRÌNH TỪ CON SỐ 0 CHO NGƯỜI MỚI BẮT ĐẦU:**\n\n` +
        `• **Giai đoạn 1 - Nền tảng tư duy máy tính (1 tháng):** Học cấu trúc điều khiển (if/else, vòng lặp for/while), hàm (functions) và cấu trúc dữ liệu mảng/chuỗi. Có thể bắt đầu bằng **Python** vì cú pháp thân thiện như tiếng Anh.\n\n` +
        `• **Giai đoạn 2 - Chọn hướng đi chuyên môn (3-6 tháng):**\n` +
        `  - **Lập trình Web (Fullstack):** Học HTML/CSS -> JavaScript -> React/Next.js -> Node.js/Python FastAPI -> Database SQL (PostgreSQL/MySQL).\n` +
        `  - **Trí tuệ nhân tạo (AI/Data):** Học Python sâu -> Thư viện Pandas, NumPy, Scikit-learn -> Học máy (Machine Learning) -> Học sâu (PyTorch, Hugging Face).\n\n` +
        `• **Giai đoạn 3 - Thực hành làm dự án thực tế (Project-based):** Đừng chỉ xem video suông! Hãy tự tay code các dự án mini, đẩy mã nguồn lên **GitHub** và triển khai lên môi trường chạy thực tế!`
    };
  }


  // =========================================================================
  // 8.6 NGUYÊN LÝ THIẾT KẾ PHẦN MỀM SOLID (OOP & CLEAN CODE)
  // =========================================================================
  if (norm.includes("solid") || norm.includes("nguyen ly solid") || norm.includes("5 nguyen ly solid")) {
    return {
      reply: `💎 **5 NGUYÊN LÝ THIẾT KẾ PHẦN MỀM S.O.L.I.D (CHUẨN CLEAN ARCHITECTURE):**\n\n` +
        `SOLID là bộ 5 nguyên lý thiết kế hướng đối tượng kinh điển do Robert C. Martin (Uncle Bob) đúc kết, giúp mã nguồn dễ đọc, dễ mở rộng và hạn chế tối đa lỗi ngầm:\n\n` +
        `1. 🎯 **S - Single Responsibility Principle (Đơn trách nhiệm):**\n` +
        `   • *Quy tắc:* Một Class hoặc Module chỉ nên có **một lý do duy nhất để thay đổi**.\n` +
        `   • *Ví dụ:* Không gộp logic tính toán tiền lương, lưu CSDL và gửi email thông báo vào cùng 1 class \`Employee\`. Hãy tách thành \`SalaryCalculator\`, \`EmployeeRepository\` và \`EmailService\`.\n\n` +
        `2. 🚪 **O - Open/Closed Principle (Đóng/Mở):**\n` +
        `   • *Quy tắc:* **Mở** cho việc mở rộng tính năng mới, nhưng **Đóng** với việc sửa đổi mã nguồn đã chạy ổn định.\n` +
        `   • *Cách làm:* Dùng Kế thừa (Inheritance) và Đa hình (Polymorphism) hoặc Interface thay vì dùng hàng loạt lệnh \`if/else\` hay \`switch/case\`.\n\n` +
        `3. 🔄 **L - Liskov Substitution Principle (Thay thế Liskov):**\n` +
        `   • *Quy tắc:* Các đối tượng của lớp con phải có thể thay thế lớp cha mà **không làm thay đổi tính đúng đắn** của chương trình.\n` +
        `   • *Ví dụ kinh điển:* Lớp \`Square\` (Hình vuông) kế thừa \`Rectangle\` (Hình chữ nhật) là vi phạm Liskov nếu thay đổi chiều rộng lại làm đổi luôn chiều cao.\n\n` +
        `4. 🧩 **I - Interface Segregation Principle (Phân tách Interface):**\n` +
        `   • *Quy tắc:* Nhiều Interface nhỏ chuyên biệt tốt hơn một Interface 'vạn năng' khổng lồ. Đừng ép Client phải triển khai những hàm mà họ không cần dùng.\n\n` +
        `5. 🔌 **D - Dependency Inversion Principle (Đảo ngược phụ thuộc):**\n` +
        `   • *Quy tắc:* Module cấp cao (High-level) không nên phụ thuộc trực tiếp vào module cấp thấp (Low-level); cả hai nên **phụ thuộc vào Abstraction (Interface)**.\n` +
        `   • *Ứng dụng:* Sử dụng kỹ thuật Dependency Injection (DI) để tiêm phụ thuộc, giúp viết Unit Test giả lập (Mocking) cực kỳ dễ dàng!`
    };
  }

  // =========================================================================
  // 8.7 MẪU THIẾT KẾ DESIGN PATTERNS (CREATIONAL, STRUCTURAL, BEHAVIORAL)
  // =========================================================================
  if (
    norm.includes("design pattern") || norm.includes("mau thiet ke") ||
    norm.includes("singleton") || norm.includes("factory pattern") || norm.includes("observer pattern") ||
    norm.includes("repository pattern") || norm.includes("strategy pattern")
  ) {
    return {
      reply: `🏗️ **CẨM NANG DESIGN PATTERNS KINH ĐIỂN TRONG LẬP TRÌNH PHẦN MỀM:**\n\n` +
        `Design Patterns là những giải pháp tối ưu đã được kiểm chứng qua thời gian cho các bài toán kiến trúc phần mềm phổ biến:\n\n` +
        `• 1. 👑 **Singleton Pattern (Creational):**\n` +
        `  - *Mục đích:* Đảm bảo một Class chỉ có duy nhất **1 Instance** tồn tại trong toàn bộ vòng đời ứng dụng và cung cấp điểm truy cập toàn cục.\n` +
        `  - *Ứng dụng:* Database Connection Pool, Logger, Cấu hình hệ thống (Settings Manager).\n\n` +
        `• 2. 🏭 **Factory Method Pattern (Creational):**\n` +
        `  - *Mục đích:* Định nghĩa Interface tạo đối tượng, để lớp con quyết định Class nào sẽ được khởi tạo, che giấu logic khởi tạo phức tạp.\n` +
        `  - *Ứng dụng:* Hệ thống thanh toán (Tạo cổng VNPay, MoMo, ZaloPay tùy vào lựa chọn người dùng).\n\n` +
        `• 3. 📡 **Observer Pattern (Behavioral):**\n` +
        `  - *Mục đích:* Thiết lập quan hệ 1-Nhiều (Publish/Subscribe). Khi một đối tượng thay đổi trạng thái, tất cả người theo dõi (Observers) đều nhận thông báo tự động.\n` +
        `  - *Ứng dụng:* Sự kiện DOM trong JavaScript, Redux store, thông báo đẩy (Push Notifications).\n\n` +
        `• 4. 🎯 **Strategy Pattern (Behavioral):**\n` +
        `  - *Mục đích:* Đóng gói các thuật toán khác nhau thành từng đối tượng độc lập và có thể hoán đổi cho nhau linh hoạt trong lúc chạy (Runtime).\n` +
        `  - *Ứng dụng:* Chọn thuật toán sắp xếp (QuickSort, MergeSort) hoặc chọn thuật toán AI (XGBoost, Random Forest, PhoBERT) trong PhishArmor!\n\n` +
        `• 5. 🗄️ **Repository Pattern (Architectural):**\n` +
        `  - *Mục đích:* Tạo một lớp trung gian giữa tầng Business Logic và tầng Data Access (Database), giúp code nghiệp vụ độc lập hoàn toàn với việc dùng SQL hay NoSQL.`
    };
  }

  // =========================================================================
  // 8.8 KIẾN TRÚC CLEAN ARCHITECTURE & LAYERED ARCHITECTURE
  // =========================================================================
  if (norm.includes("clean architecture") || norm.includes("kien truc phan mem") || norm.includes("onion architecture") || norm.includes("layered architecture")) {
    return {
      reply: `🏛️ **KIẾN TRÚC PHẦN MỀM CLEAN ARCHITECTURE (NGUYÊN LÝ VÒNG TRÒN ĐỒNG TÂM):**\n\n` +
        `Clean Architecture đặt **Nghiệp vụ cốt lõi (Business Domain)** làm trung tâm, hoàn toàn độc lập với Framework, Database, UI và thư viện bên ngoài:\n\n` +
        `1. 🟡 **Tầng 1 (Tâm vòng tròn) - Entities (Domain Layer):**\n` +
        `   • Chứa các quy tắc nghiệp vụ cao cấp nhất của doanh nghiệp (Domain Models, Business Rules).\n` +
        `   • Không phụ thuộc vào bất kỳ thư viện hay framework bên ngoài nào.\n\n` +
        `2. 🟠 **Tầng 2 - Use Cases (Application Layer):**\n` +
        `   • Chứa luồng xử lý cụ thể của ứng dụng (ví dụ: Quy trình quét URL, Quản lý tài khoản, Phê duyệt phản hồi).\n\n` +
        `3. 🟢 **Tầng 3 - Interface Adapters (Controllers, Presenters, Gateways):**\n` +
        `   • Chuyển đổi dữ liệu giữa dạng tiện lợi cho Use Cases sang dạng phù hợp cho Web/Database (DTOs, Serializers).\n\n` +
        `4. 🔵 **Tầng 4 (Vỏ ngoài) - Frameworks & Drivers:**\n` +
        `   • Chứa Next.js, FastAPI, PostgreSQL, UI Browser, thiết bị bên ngoài.\n\n` +
        `⚖️ **Quy tắc phụ thuộc bất biến (The Dependency Rule):** Chiều mũi tên phụ thuộc luôn **chỉ hướng vào bên trong tâm**! Tầng trong không bao giờ được biết đến sự tồn tại của tầng ngoài!`
    };
  }

  // =========================================================================
  // 8.9 SO SÁNH REST VS GRAPHQL VS GRPC
  // =========================================================================
  if (
    (norm.includes("rest") && (norm.includes("graphql") || norm.includes("grpc"))) ||
    norm.includes("so sanh rest") || norm.includes("graphql la gi") || norm.includes("grpc la gi")
  ) {
    return {
      reply: `🌐 **SO SÁNH BỘ BA GIAO THỨC API: REST VS GRAPHQL VS GRPC:**\n\n` +
        `• 1. 🔵 **REST API (Phổ biến nhất):**\n` +
        `  - Dựa trên giao thức HTTP/1.1 chuẩn, truyền tải định dạng JSON.\n` +
        `  - *Ưu điểm:* Dễ học, dễ debug, hỗ trợ HTTP Caching cực tốt.\n` +
        `  - *Nhược điểm:* Dễ bị **Over-fetching** (thừa dữ liệu không cần) hoặc **Under-fetching** (phải gọi nhiều API liên tiếp).\n\n` +
        `• 2. 🟣 **GraphQL (Linh hoạt cho Frontend & Mobile):**\n` +
        `  - Do Facebook phát triển; Client gửi câu truy vấn Schema để yêu cầu **chính xác trường dữ liệu mong muốn**, không thừa không thiếu.\n` +
        `  - *Ưu điểm:* 1 Endpoint duy nhất (\`/graphql\`), tối ưu hóa băng thông mạng di động.\n` +
        `  - *Nhược điểm:* Khó thiết lập HTTP Caching, câu truy vấn phức tạp dễ gây tải nặng cho database.\n\n` +
        `• 3. 🟢 **gRPC (Tốc độ đỉnh cao cho Microservices):**\n` +
        `  - Do Google phát triển; chạy trên giao thức **HTTP/2** và định dạng nhị phân **Protocol Buffers (Protobuf)**.\n` +
        `  - *Ưu điểm:* Tốc độ truyền tải nhanh gấp 7-10 lần JSON, dung lượng gói tin siêu nhỏ, hỗ trợ Streaming hai chiều realtime.\n` +
        `  - *Ứng dụng:* Giao tiếp nội bộ giữa các microservices và hệ thống giao dịch chứng khoán tần suất cao.`
    };
  }

  // =========================================================================
  // 8.10 WEBSOCKET VS LONG POLLING VS SERVER-SENT EVENTS (SSE)
  // =========================================================================
  if (norm.includes("websocket") || norm.includes("long polling") || norm.includes("server-sent events") || norm.includes("sse la gi")) {
    return {
      reply: `⚡ **CÁC CÔNG NGHỆ TRUYỀN DỮ LIỆU THỜI GIAN THỰC (REAL-TIME COMMUNICATION):**\n\n` +
        `• 1. 🔌 **WebSocket (Song công toàn phần - Full-Duplex):**\n` +
        `  - Sau bước bắt tay HTTP ban đầu, nâng cấp lên kết nối TCP bền vững hai chiều (Bi-directional).\n` +
        `  - Cả Client và Server đều có thể chủ động gửi tin nhắn cho nhau bất kỳ lúc nào với độ trễ tính bằng mili-giây.\n` +
        `  - *Thích hợp cho:* Game online, chat trực tuyến (như widget trợ lý an ninh), bảng giá chứng khoán realtime.\n\n` +
        `• 2. 📡 **Server-Sent Events - SSE (Một chiều từ Server sang Client):**\n` +
        `  - Kết nối HTTP duy trì lâu dài, Server liên tục đẩy sự kiện (Events stream) xuống trình duyệt.\n` +
        `  - *Ưu điểm:* Tự động kết nối lại khi mất mạng (Auto-reconnect), nhẹ hơn WebSocket.\n` +
        `  - *Thích hợp cho:* Hiệu ứng sinh chữ AI (Streaming response như ChatGPT/Claude), bảng tin tức, cập nhật thông báo.\n\n` +
        `• 3. ⏳ **Long Polling (Cách truyền thống):**\n` +
        `  - Client gửi Request, Server giữ kết nối chờ đến khi có dữ liệu mới thì trả về rồi đóng kết nối; Client ngay lập tức tạo kết nối mới.\n` +
        `  - *Nhược điểm:* Tốn tài nguyên overhead bắt tay HTTP liên tục, chỉ dùng làm giải pháp dự phòng.`
    };
  }

  // =========================================================================
  // 8.11 SO SÁNH DOCKER VS VIRTUAL MACHINE (MÁY ẢO)
  // =========================================================================
  if (
    (norm.includes("docker") && (norm.includes("vm") || norm.includes("may ao") || norm.includes("virtual machine"))) ||
    norm.includes("docker khac gi may ao")
  ) {
    return {
      reply: `🐳💻 **SO SÁNH TOÀN DIỆN: DOCKER CONTAINER VS MÁY ẢO (VIRTUAL MACHINE):**\n\n` +
        `Điểm khác biệt cốt tử nằm ở tầng trừu tượng hóa phần cứng và hệ điều hành:\n\n` +
        `• 1. 🖥️ **Máy ảo (Virtual Machine - VMware, VirtualBox):**\n` +
        `  - Ảo hóa ở **Tầng Phần cứng (Hardware-level)** thông qua phần mềm giám sát **Hypervisor**.\n` +
        `  - Mỗi máy ảo bắt buộc phải chạy một **Hệ điều hành khách (Guest OS)** hoàn chỉnh riêng (Windows, Ubuntu) kèm kernel riêng.\n` +
        `  - *Đặc điểm:* Khởi động mất vài phút, dung lượng chiếm dụng hàng chục GB, ngốn RAM nhiều.\n\n` +
        `• 2. 🐳 **Docker Container:**\n` +
        `  - Ảo hóa ở **Tầng Hệ điều hành (OS-level)** thông qua Docker Engine.\n` +
        `  - Các Container **chia sẻ chung Kernel của Hệ điều hành chủ (Host OS)**, cô lập nhau bằng tính năng Namespaces và Cgroups của Linux.\n` +
        `  - *Đặc điểm:* Khởi động tính bằng mili-giây, dung lượng siêu nhẹ (vài chục MB), tiêu tốn rất ít RAM.\n\n` +
        `🎯 **Kết luận:** Docker tối ưu tuyệt đối cho triển khai microservices, API và CI/CD; Máy ảo dùng khi cần chạy các hệ điều hành hoàn toàn khác biệt hoặc yêu cầu cách ly bảo mật cấp độ phần cứng cao nhất.`
    };
  }

  // =========================================================================
  // 8.12 GIT MERGE VS GIT REBASE
  // =========================================================================
  if (
    (norm.includes("git") && (norm.includes("merge") || norm.includes("rebase"))) ||
    norm.includes("so sanh git merge va git rebase")
  ) {
    return {
      reply: `🌿🔀 **SO SÁNH GIT MERGE VS GIT REBASE - KHI NÀO NÊN DÙNG CÁI NÀO?**\n\n` +
        `Cả hai lệnh đều dùng để tích hợp các thay đổi từ nhánh này sang nhánh khác, nhưng lịch sử commit tạo ra hoàn toàn khác nhau:\n\n` +
        `• 1. 🔀 **Git Merge:**\n` +
        `  - Tạo ra một commit hợp nhất mới (Merge Commit) nối hai nhánh lại.\n` +
        `  - *Ưu điểm:* Giữ nguyên vẹn 100% lịch sử và thứ tự thời gian của từng nhánh phát triển; an toàn, không làm biến đổi lịch sử cũ.\n` +
        `  - *Nhược điểm:* Đồ thị lịch sử Git (Git Graph) dễ bị rối rắm, nhiều đường nhánh đan xen như mạng nhện.\n\n` +
        `• 2. 📏 **Git Rebase:**\n` +
        `  - Nhấc toàn bộ các commit của nhánh hiện tại và 'đặt lại gốc' (Re-base) lên đỉnh của nhánh đích.\n` +
        `  - *Ưu điểm:* Tạo ra một lịch sử commit thẳng tắp, tuyến tính (Linear history), cực kỳ gọn gàng và dễ theo dõi.\n` +
        `  - *Nhược điểm:* Làm viết lại mã băm (Commit Hash) của lịch sử.\n\n` +
        `⚠️ **Quy tắc vàng của Git:** Tuyệt đối **KHÔNG REBASE** trên các nhánh công khai dùng chung (như \`main\` hay \`production\`)! Chỉ rebase trên nhánh tính năng (feature branch) cá nhân trước khi tạo Pull Request!`
    };
  }

  // =========================================================================
  // 8.13 NEXT.JS SERVER COMPONENTS VS CLIENT COMPONENTS
  // =========================================================================
  if (
    norm.includes("server component") || norm.includes("client component") ||
    (norm.includes("nextjs") && norm.includes("react")) || norm.includes("use client")
  ) {
    return {
      reply: `⚛️🚀 **NEXT.JS APP ROUTER: REACT SERVER COMPONENTS (RSC) VS CLIENT COMPONENTS:**\n\n` +
        `Trong Next.js 14/15, mặc định tất cả Component trong thư mục \`app/\` đều là **Server Components** trừ khi bạn khai báo chỉ thị \`"use client"\`:\n\n` +
        `• 1. 🖥️ **React Server Components - RSC (Mặc định):**\n` +
        `  - Render hoàn toàn trên Node.js Server và gửi về trình duyệt dưới dạng HTML/JSON tĩnh.\n` +
        `  - *Ưu điểm:* Dung lượng bundle JavaScript gửi về client = **0 KB**! Tải trang cực nhanh, tối ưu SEO vượt trội, truy cập trực tiếp Database/File system mà không sợ lộ API Key/Secret.\n` +
        `  - *Hạn chế:* Không dùng được React Hooks (\`useState\`, \`useEffect\`) và không bắt được sự kiện người dùng (\`onClick\`, \`onChange\`).\n\n` +
        `• 2. 📱 **Client Components (\`"use client"\`):**\n` +
        `  - Vẫn được Pre-render trên Server sau đó thực hiện quá trình bù nước (Hydration) trên trình duyệt.\n` +
        `  - *Mục đích:* Dùng khi cần tương tác người dùng, lắng nghe sự kiện, lưu trữ state hoặc truy cập Browser APIs (\`localStorage\`, \`window\`, hiệu ứng kéo thả).\n\n` +
        `💡 *Mẹo kiến trúc tối ưu:* Đẩy Client Components xuống lá ngoài cùng của cây Component (lái widget nhỏ như \`RobotAssistant\` hay nút bấm) để giữ phần lớn ứng dụng là Server Component gọn nhẹ!`
    };
  }

  // =========================================================================
  // 8.14 FASTAPI & LẬP TRÌNH BẤT ĐỒNG BỘ ASYNCIO TRONG PYTHON
  // =========================================================================
  if (norm.includes("fastapi") || (norm.includes("asyncio") && norm.includes("python")) || norm.includes("async def")) {
    return {
      reply: `⚡🐍 **FASTAPI & SỨC MẠNH LẬP TRÌNH BẤT ĐỒNG BỘ (ASYNCIO) TRONG PYTHON:**\n\n` +
        `FastAPI là một trong những Python Web Framework phát triển nhanh nhất lịch sử, sánh ngang tốc độ của NodeJS và Go nhờ 3 trụ cột:\n\n` +
        `1. 🔄 **Asynchronous Non-Blocking I/O (Async/Await):**\n` +
        `   • Chạy trên máy chủ ASGI chuẩn công nghiệp (**Uvicorn**).\n` +
        `   • Khi một request chờ I/O (chờ truy vấn Database hoặc gọi API ngoài VirusTotal), Event Loop của Python sẽ tạm gác nó lại và phục vụ hàng ngàn request khác mà không bị nghẽn luồng (Blocking).\n\n` +
        `2. 🛡️ **Xác thực dữ liệu tự động với Pydantic:**\n` +
        `   • Khai báo kiểu dữ liệu bằng Python Type Hints. Pydantic tự động kiểm tra tính hợp lệ của Request Body, tự động ép kiểu và báo lỗi chi tiết 422 nếu dữ liệu sai định dạng.\n\n` +
        `3. 📖 **Tự động sinh tài liệu chuẩn OpenAPI (Swagger UI):**\n` +
        `   • Chỉ cần viết code, hệ thống tự động tạo trang tài liệu tương tác \`/docs\` chuẩn quốc tế giúp đội Frontend test API tức thì!`
    };
  }

  // =========================================================================
  // 8.15 TẤN CÔNG MAN-IN-THE-MIDDLE (MITM - TẤN CÔNG XEN GIỮA)
  // =========================================================================
  if (norm.includes("man in the middle") || norm.includes("man-in-the-middle") || norm.includes("mitm") || norm.includes("tan cong xen giua") || norm.includes("xen giua")) {
    return {
      reply: `🕵️‍♂️⚠️ **TẤN CÔNG MAN-IN-THE-MIDDLE (MitM - TẤN CÔNG XEN GIỮA) LÀ GÌ?**\n\n` +
        `• **Khái niệm:** MitM là hình thức tấn công mà kẻ xấu bí mật chen vào giữa kênh giao tiếp giữa hai bên (thường là giữa trình duyệt người dùng và máy chủ ngân hàng/ứng dụng) để **nghe lén (Eavesdropping)** hoặc **chỉnh sửa dữ liệu (Data Tampering)** mà cả hai bên không hề hay biết.\n\n` +
        `• **Các hình thức MitM phổ biến nhất:**\n` +
        `  1. 📶 **Evil Twin Wi-Fi (Wi-Fi giả mạo):** Kẻ tấn công phát trạm Wi-Fi miễn phí không mật khẩu ở quán cafe tên 'Highlands Free Wifi'. Mọi lưu lượng dữ liệu bạn gửi đi đều chạy qua máy tính của hacker.\n` +
        `  2. 💉 **ARP Poisoning / ARP Spoofing:** Trong mạng LAN nội bộ, hacker gửi gói tin ARP giả mạo để gán địa chỉ MAC của mình với IP của Default Gateway.\n` +
        `  3. 🌐 **DNS Spoofing (Đầu độc DNS):** Lừa máy tính nạn nhân phân giải tên miền thật sang địa chỉ IP máy chủ độc hại của hacker.\n` +
        `  4. 🔓 **SSL Stripping:** Kẻ tấn công hạ cấp kết nối an toàn từ HTTPS xuống HTTP trần để đọc mật khẩu văn bản rõ (Plaintext).\n\n` +
        `🛡️ **Biện pháp phòng vệ toàn diện:**\n` +
        `  • Luôn bật **HSTS (HTTP Strict Transport Security)** trên Web Server.\n` +
        `  • Áp dụng **SSL/TLS Certificate Pinning** trên ứng dụng di động để chống can thiệp chứng chỉ giả mạo.\n` +
        `  • Tuyệt đối không đăng nhập tài khoản nhạy cảm trên mạng Wi-Fi công cộng mở nếu không bật VPN mã hóa!`
    };
  }

  // =========================================================================
  // 8.16 TẤN CÔNG SQL INJECTION (SQLi) & KỸ THUẬT PHÒNG THỦ PREPARED STATEMENT
  // =========================================================================
  if (norm.includes("sql injection") || norm.includes("sql-injection") || norm.includes("sqli") || norm.includes("tiem ma sql")) {
    return {
      reply: `💉🗄️ **TẤN CÔNG SQL INJECTION (SQLi) & CÁCH PHÒNG CHỐNG BẢO MẬT:**\n\n` +
        `• **Bản chất lỗ hổng:** Xảy ra khi lập trình viên ghép chuỗi dữ liệu người dùng nhập trực tiếp vào câu lệnh SQL mà không qua xác thực, khiến phần dữ liệu bị CSDL hiểu nhầm là **lệnh điều khiển thực thi**.\n\n` +
        `• **Ví dụ câu lệnh bị tấn công:**\n` +
        `\`\`\`python\n` +
        `# LỖI BẢO MẬT: Ghép chuỗi trực tiếp!\n` +
        `query = f"SELECT * FROM users WHERE user = '{username}' AND pass = '{password}'"\n` +
        `\`\`\`\n` +
        `Kẻ tấn công chỉ cần nhập \`username\` là: \`admin' --\`\n` +
        `Câu lệnh thực tế CSDL chạy sẽ trở thành:\n` +
        `\`\`\`sql\n` +
        `SELECT * FROM users WHERE user = 'admin' --' AND pass = '...'\n` +
        `\`\`\`\n` +
        `Dấu \`--\` là chú thích bỏ qua toàn bộ phần kiểm tra mật khẩu phía sau -> **Hacker đăng nhập thành công tài khoản admin mà không cần mật khẩu!**\n\n` +
        `🛡️ **Biện pháp khắc phục chuẩn mực: PREPARED STATEMENT (Tham số hóa truy vấn):**\n` +
        `\`\`\`python\n` +
        `# BẢO MẬT CHUẨN: Tách biệt ranh giới giữa Lệnh và Dữ liệu\n` +
        `cursor.execute("SELECT * FROM users WHERE user = %s AND pass = %s", (username, password))\n` +
        `\`\`\`\n` +
        `CSDL sẽ biên dịch cấu trúc câu lệnh trước, dữ liệu người dùng đưa vào dù có chứa ký tự đặc biệt như \`' OR 1=1 --\` thì CSDL vẫn chỉ coi đó là một chuỗi văn bản thông thường!`
    };
  }

  // =========================================================================
  // 8.17 CROSS-SITE SCRIPTING (XSS) VS CROSS-SITE REQUEST FORGERY (CSRF)
  // =========================================================================
  if (
    norm.includes("xss") || norm.includes("cross site scripting") ||
    norm.includes("csrf") || (norm.includes("phan biet") && norm.includes("xss"))
  ) {
    return {
      reply: `⚔️🛡️ **PHÂN BIỆT BỘ ĐÔI LỖ HỔNG WEB KINH ĐIỂN: XSS VS CSRF:**\n\n` +
        `• 1. 📜 **Cross-Site Scripting (XSS):**\n` +
        `  - *Cơ chế:* Kẻ tấn công tiêm đoạn mã JavaScript độc hại vào website hợp pháp để **chạy trên trình duyệt của nạn nhân**.\n` +
        `  - *3 Dạng XSS:*\n` +
        `    + **Stored XSS:** Mã độc được lưu vĩnh viễn vào Database (trong phần bình luận, hồ sơ người dùng).\n` +
        `    + **Reflected XSS:** Mã độc nằm trên URL Query String, chạy khi người dùng bấm vào link.\n` +
        `    + **DOM-based XSS:** Lỗi xử lý chuỗi phía client DOM qua các hàm nguy hiểm như \`innerHTML\`, \`eval()\`.\n` +
        `  - *Hậu quả:* Đánh cắp Cookie phiên làm việc (\`document.cookie\`), ghi lại thao tác phím (Keylogger).\n` +
        `  - *Phòng chống:* Escape HTML toàn bộ dữ liệu xuất ra màn hình, bật cờ **HttpOnly** cho Cookie, thiết lập **CSP (Content Security Policy)**.\n\n` +
        `• 2. 🎭 **Cross-Site Request Forgery (CSRF):**\n` +
        `  - *Cơ chế:* Khác với XSS (chạy mã độc trên máy nạn nhân), CSRF lợi dụng phiên đăng nhập (Session) **hợp pháp sẵn có** của nạn nhân để bí mật gửi các yêu cầu giả mạo đến Server mà nạn nhân không hề hay biết.\n` +
        `  - *Ví dụ:* Nạn nhân đang đăng nhập ngân hàng, mở một tab xem phim lậu có chứa thẻ ẩn:\n` +
        `    \`<img src="https://bank.com/transfer?to=hacker&amount=5000000" />\`\n` +
        `  - *Phòng chống:* Sử dụng **Anti-CSRF Token** đồng bộ trong mỗi Form, thiết lập thuộc tính Cookie **SameSite=Strict** hoặc **SameSite=Lax**.`
    };
  }

  // =========================================================================
  // 8.18 TẤN CÔNG TỪ CHỐI DỊCH VỤ PHÂN TÁN (DDOS)
  // =========================================================================
  if (norm.includes("ddos") || norm.includes("tu choi dich vu") || norm.includes("syn flood")) {
    return {
      reply: `🌊💥 **TẤN CÔNG TỪ CHỐI DỊCH VỤ PHÂN TÁN (DDoS - DISTRIBUTED DENIAL OF SERVICE):**\n\n` +
        `• **Bản chất:** Kẻ tấn công huy động hàng chục ngàn đến hàng triệu thiết bị nhiễm mã độc (gọi là mạng lưới máy tính ma **Botnet / Zombie**) đồng loạt dội bão lưu lượng truy cập ảo vào máy chủ mục tiêu, khiến máy chủ bị cạn kiệt CPU, RAM hoặc tràn băng thông đường truyền, làm sập dịch vụ đối với người dùng thật.\n\n` +
        `• **Hai nhóm tấn công DDoS chính:**\n` +
        `  1. ⚡ **Tầng 4 (Transport Layer):** Đánh vào giao thức mạng như **SYN Flood** (lợi dụng quá trình bắt tay 3 bước TCP để giữ kết nối nửa vời làm treo hàng đợi), **UDP Flood**, **NTP/DNS Amplification**.\n` +
        `  2. 🌐 **Tầng 7 (Application Layer):** Đánh vào ứng dụng web như **HTTP Flood** (gửi liên tục hàng triệu lệnh POST/GET phức tạp đòi hỏi CSDL tính toán nặng), **Slowloris** (giữ kết nối HTTP mở thật lâu với tốc độ siêu chậm để chiếm hết luồng máy chủ).\n\n` +
        `🛡️ **Giải pháp phòng thủ thực tế:** Triển khai hạ tầng phân tán **Anycast CDN (Cloudflare, Akamai)**, cấu hình Rate Limiting, kích hoạt SYN Cookies trên Linux và lọc luồng dữ liệu độc hại qua tường lửa WAF.`
    };
  }

  // =========================================================================
  // 8.19 KIẾN TRÚC ZERO TRUST (KHÔNG BAO GIỜ TIN TƯỞNG, LUÔN LUÔN XÁC THỰC)
  // =========================================================================
  if (norm.includes("zero trust") || norm.includes("khong tin cay") || norm.includes("never trust always verify")) {
    return {
      reply: `🛡️🔐 **MÔ HÌNH KIẾN TRÚC AN NINH ZERO TRUST (NEVER TRUST, ALWAYS VERIFY):**\n\n` +
        `• **Triết lý cách mạng:** Mô hình an ninh truyền thống xây dựng 'Bức tường thành' (Lâu đài & Hào nước) — mặc định ai đã vào được mạng LAN nội bộ công ty là người an toàn. Zero Trust đập tan quan niệm này: **Không tin tưởng bất kỳ ai hay bất kỳ thiết bị nào, kể cả đang ở trong mạng nội bộ!**\n\n` +
        `• **3 Trụ cột nguyên tắc vàng:**\n` +
        `  1. 🔍 **Verify Explicitly (Xác thực tường minh):** Luôn xác thực và ủy quyền liên tục dựa trên toàn bộ các điểm dữ liệu: Danh tính người dùng, vị trí địa lý, tình trạng bảo mật của thiết bị và ngữ cảnh truy cập.\n` +
        `  2. 🔑 **Use Least Privilege Access (Quyền truy cập tối thiểu):** Giới hạn quyền người dùng với chính sách **Just-in-Time (JIT)** và **Just-Enough-Access (JEA)**. Không ai có quyền vĩnh viễn vượt quá nhiệm vụ cần làm.\n` +
        `  3. 💣 **Assume Breach (Luôn giả định hệ thống đã bị xâm nhập):** Chia nhỏ mạng lưới thành từng phân đoạn vi mô (Micro-segmentation), mã hóa toàn bộ dữ liệu đầu-cuối (End-to-End Encryption) và liên tục phân tích hành vi bất thường bằng AI.`
    };
  }

  // =========================================================================
  // 8.20 QUY TRÌNH BẮT TAY SSL/TLS HANDSHAKE (TLS 1.2 VS TLS 1.3)
  // =========================================================================
  if (
    norm.includes("ssl handshake") || norm.includes("tls handshake") ||
    norm.includes("bat tay ssl") || norm.includes("bat tay tls")
  ) {
    return {
      reply: `🤝🔒 **QUY TRÌNH BẮT TAY SSL/TLS HANDSHAKE CHI TIẾT (TLS 1.2 VS TLS 1.3):**\n\n` +
        `TLS Handshake là bước thiết lập kênh truyền thông mã hóa an toàn giữa Trình duyệt (Client) và Máy chủ (Server) trước khi bắt đầu gửi dữ liệu HTTP:\n\n` +
        `• **4 Bước trong quy trình TLS 1.2 (Tốn 2 lượt khứ hồi - 2 RTT):**\n` +
        `  1. 📤 **ClientHello:** Trình duyệt gửi phiên bản TLS cao nhất hỗ trợ, danh sách các bộ mã hóa (Cipher Suites) và một chuỗi ngẫu nhiên (ClientRandom).\n` +
        `  2. 📥 **ServerHello + Certificate:** Server chọn Cipher Suite tối ưu, gửi lại chuỗi ServerRandom cùng **Chứng chỉ số SSL/TLS** (chứa Public Key của Server).\n` +
        `  3. 🔑 **Key Exchange & Verify:** Client xác thực tính hợp lệ của chứng chỉ SSL qua nhà cấp phép CA. Sau đó Client tạo ra Pre-Master Secret, mã hóa bằng Public Key của Server và gửi đi. Cả 2 bên cùng tính toán ra **Session Key (Khóa phiên đối xứng AES-GCM)**.\n` +
        `  4. ✅ **Finished:** Cả hai bên xác nhận hoàn tất bắt tay. Mọi gói tin sau đó được mã hóa bằng Session Key với tốc độ siêu nhanh!\n\n` +
        `⚡ **Cải tiến vượt bậc của TLS 1.3 (Chỉ tốn 1 RTT hoặc 0-RTT):**\n` +
        `  • Gộp bước đàm phán thuật toán và trao đổi khóa (Diffie-Hellman) ngay trong gói tin đầu tiên! Giảm độ trễ kết nối mạng đi một nửa, tăng tốc độ lướt web rõ rệt!`
    };
  }

  // =========================================================================
  // 8.21 MÃ ĐỘC TỐNG TIỀN (RANSOMWARE) & CHIẾN LƯỢC SAO LƯU 3-2-1
  // =========================================================================
  if (norm.includes("ransomware") || norm.includes("ma doc tong tien")) {
    return {
      reply: `🛑💰 **MÃ ĐỘC TỐNG TIỀN (RANSOMWARE) & CHIẾN LƯỢC SAO LƯU 3-2-1 BẢO VỆ DỮ LIỆU:**\n\n` +
        `• **Cách thức hoạt động tinh vi của Ransomware:**\n` +
        `  1. *Xâm nhập:* Thường lây lan qua email phishing chứa file đính kèm độc hại (\`.exe\`, \`.docm\` macro) hoặc khai thác cổng máy tính từ xa RDP bị lộ.\n` +
        `  2. *Mã hóa kép bất đối xứng:* Sử dụng thuật toán AES-256 để mã hóa toàn bộ dữ liệu trên ổ cứng, sau đó dùng khóa công khai RSA-2048 của hacker để mã hóa khóa AES đó. Khi không có khóa bí mật (Private Key) của hacker, không một siêu máy tính nào trên thế giới có thể giải mã được trong thời gian thực!\n` +
        `  3. *Tống tiền:* Để lại file \`README_DECRYPT.txt\` yêu cầu chuộc bằng tiền mã hóa Bitcoin/Monero.\n\n` +
        `🛡️ **Chiến lược sao lưu vàng 3-2-1 để không bao giờ phải trả tiền chuộc:**\n` +
        `  • **3 Bản sao:** Luôn duy trì ít nhất 3 bản sao chép dữ liệu quan trọng.\n` +
        `  • **2 Loại phương tiện khác nhau:** Lưu trên 2 thiết bị vật lý độc lập (ví dụ: 1 bản trên ổ cứng SSD và 1 bản trên ổ cứng mạng NAS).\n` +
        `  • **1 Bản ngoại vi cách ly (Off-site / Air-gapped):** Ít nhất 1 bản sao lưu được lưu trữ trên Cloud độc lập hoặc ổ cứng cất trong két sắt không cắm dây mạng!`
    };
  }

  // =========================================================================
  // 8.22 KIẾN TRÚC TRANSFORMER & CƠ CHẾ ATTENTION (CHÚ Ý)
  // =========================================================================
  if (
    norm.includes("transformer") || norm.includes("attention mechanism") ||
    norm.includes("self attention") || norm.includes("co che attention")
  ) {
    return {
      reply: `🧠✨ **KIẾN TRÚC TRANSFORMER & CƠ CHẾ CHÚ Ý (ATTENTION MECHANISM) THỐNG TRỊ AI:**\n\n` +
        `Xuất phát từ bài báo khoa học lịch sử năm 2017 của Google: *"Attention Is All You Need"*, kiến trúc Transformer đã thay thế hoàn toàn mạng RNN/LSTM và trở thành nền tảng của toàn bộ các LLM hiện đại (GPT-4, Claude, Gemini, PhoBERT):\n\n` +
        `• **1. Hạn chế của mạng tuần tự cũ (RNN/LSTM):** Phải đọc từ trái sang phải từng từ một -> Không thể huấn luyện song song (Parallelization) trên GPU và hay bị quên ngữ cảnh xa (Vanishing Gradient).\n\n` +
        `• **2. Cơ chế Self-Attention (Tự chú ý):** Cho phép mô hình nhìn vào toàn bộ các từ trong câu cùng một lúc và tính toán xem mỗi từ nên 'chú ý' đến từ nào nhất để hiểu đúng ngữ cảnh.\n\n` +
        `• **3. Công thức Toán học cốt tử:**\n` +
        `$$\\mathbf{\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V}$$\n` +
        `  - **Query ($Q$):** Vector đại diện cho từ đang cần tìm kiếm thông tin.\n` +
        `  - **Key ($K$):** Vector nhãn đại diện cho tất cả các từ khác trong câu.\n` +
        `  - **Value ($V$):** Vector chứa nội dung thông tin thực sự của các từ.\n` +
        `  - Phép nhân vô hướng $Q K^T$ đo lường mức độ tương đồng giữa các từ; chia cho $\\sqrt{d_k}$ để giữ phương sai ổn định, qua hàm \`softmax\` để biến thành phân phối xác suất chú ý (Attention Weights)!`
    };
  }

  // =========================================================================
  // 8.23 MÔ HÌNH NGÔN NGỮ PHOBERT VINAI (BẬC THẦY TIẾNG VIỆT TRONG PHISHARMOR)
  // =========================================================================
  if (norm.includes("phobert") && !norm.includes("xgboost")) {
    return {
      reply: `🇻🇳🤖 **MÔ HÌNH PHOBERT VINAI - TRỤ CỘT BẮT LỪA ĐẢO NGỮ NGHĨA TIẾNG VIỆT:**\n\n` +
        `PhoBERT là mô hình ngôn ngữ tiền huấn luyện (Pre-trained Language Model) dựa trên kiến trúc RoBERTa tiên tiến do Viện Nghiên cứu Trí tuệ Nhân tạo VinAI Research phát triển:\n\n` +
        `• **1. Tập dữ liệu khổng lồ:** Được huấn luyện trên hơn **20GB văn bản tiếng Việt chất lượng cao (~3 tỷ từ)**, giúp mô hình thấu hiểu sâu sắc cấu trúc câu, từ đồng âm, từ láy và văn phong tiếng Việt.\n\n` +
        `• **2. Cơ chế tách từ âm tiết độc đáo (Syllable-level BPE):** Tiếng Việt là ngôn ngữ đơn lập, ranh giới từ thường gồm nhiều âm tiết ghép lại (ví dụ: 'ngân hàng', 'khóa tài khoản'). PhoBERT sử dụng bộ tách từ chuyên biệt kết hợp Byte-Pair Encoding giúp mã hóa chính xác từng ngữ cảnh.\n\n` +
        `• **3. Ứng dụng trong PhishArmor AI:**\n` +
        `  - Bóc tách các thủ thuật lừa đảo tâm lý tinh vi trong đường dẫn và văn bản: Dọa khóa tài khoản (*'khóa thẻ trong 24h'*), mạo danh nhà mạng (*'hoàn tiền cước'*), dụ nhận trợ cấp chính phủ (*'nhận tiền VNeID'*).\n` +
        `  - Mang lại độ chính xác phân loại ngữ nghĩa vượt trội mà các thuật toán từ vựng đơn thuần không bao giờ nhìn thấy được!`
    };
  }

  // =========================================================================
  // 8.24 MÔ HÌNH XGBOOST (EXTREME GRADIENT BOOSTING)
  // =========================================================================
  if (norm.includes("xgboost") && !norm.includes("phobert")) {
    return {
      reply: `🌲⚡ **THUẬT TOÁN XGBOOST (EXTREME GRADIENT BOOSTING) - CỖ MÁY TỐC ĐỘ <12MS:**\n\n` +
        `XGBoost là thuật toán học máy dựa trên mô hình kết hợp cây quyết định tăng cường gradient (Gradient Boosted Decision Trees - GBDT) xuất sắc nhất hiện nay trong khoa học dữ liệu bảng (Tabular Data):\n\n` +
        `• **1. Nguyên lý hoạt động:** Thay vì xây dựng các cây độc lập như Random Forest, XGBoost xây dựng các cây quyết định tuần tự. Mỗi cây mới được sinh ra với mục tiêu sửa chữa **phần sai số (Residuals)** của các cây đi trước.\n\n` +
        `• **2. Tối ưu toán học khai triển Taylor bậc 2:** XGBoost sử dụng cả đạo hàm bậc 1 ($g_i$) và đạo hàm bậc 2 ($h_i$) của hàm mất mát, giúp thuật toán hội tụ cực nhanh và chính xác hơn nhiều so với Gradient Boosting truyền thống.\n\n` +
        `• **3. Kiểm soát Overfitting với Regularization:** Bổ sung các tham số điều chuẩn L1 (Lasso - $\\alpha$) và L2 (Ridge - $\\lambda$) trực tiếp vào hàm mục tiêu để kiểm soát độ phức tạp của cây.\n\n` +
        `• **4. Vai trò trong PhishArmor AI:** Trích xuất và đánh giá 16 đặc trưng cấu trúc URL với độ trễ siêu tốc chỉ **~12ms**, lọc sạch hơn 85% các nguy cơ lừa đảo ngay tại Tầng 2!`
    };
  }

  // =========================================================================
  // 8.25 EXPLAINABLE AI (XAI) & CÔNG NGHỆ TREESHAP (GIÁ TRỊ SHAPLEY)
  // =========================================================================
  if (
    norm.includes("shap") || norm.includes("treeshap") || norm.includes("gia tri shapley") ||
    norm.includes("shapley value") || norm.includes("xai la gi") || norm.includes("explainable ai")
  ) {
    return {
      reply: `🔍🌲 **EXPLAINABLE AI (XAI) & CÔNG NGHỆ TREESHAP - MỞ HỘP ĐEN TRÍ TUỆ NHÂN TẠO:**\n\n` +
        `Các mô hình AI truyền thống thường bị coi là 'Hộp đen' (Black-box) — đưa ra kết quả cảnh báo mà không ai hiểu tại sao. PhishArmor sử dụng **TreeSHAP** để minh bạch hóa 100% quyết định:\n\n` +
        `• **1. Nguồn gốc từ Giải thưởng Nobel Kinh tế (1953):** Do nhà toán học Lloyd Shapley phát minh trong Lý thuyết Trò chơi hợp tác (Cooperative Game Theory) nhằm chia thưởng công bằng cho từng người chơi dựa trên mức đóng góp biên.\n\n` +
        `• **2. Công thức phân rã cộng tính (Additive Feature Attribution):**\n` +
        `$$\\mathbf{f(x) = \\phi_0 + \\sum_{i=1}^{M} \\phi_i}$$\n` +
        `  - $f(x)$ là kết quả dự đoán rủi ro của mô hình.\n` +
        `  - $\\phi_0$ là giá trị kỳ vọng cơ sở (Base value - tỷ lệ lừa đảo trung bình toàn tập).\n` +
        `  - $\\phi_i$ là giá trị đóng góp Shapley của đặc trưng thứ $i$ (đặc trưng làm tăng rủi ro sẽ có $\\phi_i > 0$, đặc trưng an toàn sẽ có $\\phi_i < 0$).\n\n` +
        `• **3. Ba đặc tính toán học vàng của SHAP:**\n` +
        `  - **Local Accuracy (Chính xác cục bộ):** Tổng các giá trị Shapley cộng lại bằng đúng độ lệch dự đoán.\n` +
        `  - **Missingness (Tính khuyết thiếu):** Đặc trưng vắng mặt sẽ nhận mức đóng góp bằng 0.\n` +
        `  - **Consistency (Tính nhất quán):** Nếu một đặc trưng đóng góp nhiều hơn thì giá trị Shapley không bao giờ bị giảm.`
    };
  }

  // =========================================================================
  // 8.26 HIỆN TƯỢNG QUÁ KHỚP (OVERFITTING) & 6 CHIẾN LƯỢC KHẮC PHỤC
  // =========================================================================
  if (norm.includes("overfitting") || norm.includes("underfitting") || norm.includes("qua khop") || norm.includes("duoi khop")) {
    return {
      reply: `📉🎯 **HIỆN TƯỢNG QUÁ KHỚP (OVERFITTING) TRONG MACHINE LEARNING & CÁCH GIẢI QUYẾT:**\n\n` +
        `• **Bản chất Overfitting:** Mô hình 'học vẹt' thuộc lòng toàn bộ dữ liệu huấn luyện (Training Loss cực thấp, Accuracy tập Train 99%), nhưng khi đưa vào dữ liệu thực tế ngoài đời thì dự đoán sai be bét (Validation Loss tăng vọt)!\n\n` +
        `• **6 Kỹ thuật khắc phục triệt để trong thực tế:**\n` +
        `  1. 🛑 **Early Stopping (Dừng sớm):** Giám sát hàm mất mát trên tập Validation. Khi thấy Validation Loss bắt đầu có dấu hiệu tăng liên tiếp 3-5 epochs thì lập tức dừng huấn luyện.\n` +
        `  2. ⚖️ **Điều chuẩn Regularization (L1 / L2 / Dropout):** Thêm hình phạt độ lớn của trọng số (Weights penalty), hoặc ngẫu nhiên ngắt kết nối nơ-ron (Dropout 0.2 - 0.5 trong Deep Learning) để ép mô hình không phụ thuộc vào một nhánh cụ thể.\n` +
        `  3. 🔄 **K-Fold Cross-Validation:** Chia dữ liệu thành K phần (thường là 5 hoặc 10 folds), luân phiên huấn luyện và kiểm thử để đảm bảo mô hình có tính tổng quát hóa cao.\n` +
        `  4. 📦 **Data Augmentation (Tăng cường dữ liệu):** Bổ sung thêm nhiều biến thể dữ liệu mới.\n` +
        `  5. ✂️ **Feature Selection & Cắt tỉa (Pruning):** Loại bỏ các đặc trưng thừa có độ tương quan nhiễu (Noise).\n` +
        `  6. 🤝 **Ensemble Learning:** Kết hợp nhiều mô hình khác biệt (như XGBoost + PhoBERT trong PhishArmor) để giảm phương sai (Variance Reduction).`
    };
  }

  // =========================================================================
  // 8.27 XỬ LÝ DỮ LIỆU MẤT CÂN BẰNG (IMBALANCED DATASET & SMOTE)
  // =========================================================================
  if (
    norm.includes("mat can bang du lieu") || norm.includes("imbalanced data") ||
    norm.includes("smote") || norm.includes("focal loss")
  ) {
    return {
      reply: `⚖️📊 **BÀI TOÁN DỮ LIỆU MẤT CÂN BẰNG (IMBALANCED DATA) & GIẢI PHÁP:**\n\n` +
        `• **Vấn đề trong An ninh mạng:** Trong thực tế, số website an toàn chiếm tới 99% còn website lừa đảo chỉ chiếm 1%. Nếu không xử lý, mô hình sẽ có xu hướng đoán bừa mọi link là 'An toàn' để đạt Accuracy 99% mà bỏ sót toàn bộ mã độc!\n\n` +
        `• **Các giải pháp chuyên sâu:**\n` +
        `  1. 🧬 **Thuật toán SMOTE (Synthetic Minority Over-sampling Technique):** Không nhân bản đơn thuần mà sử dụng thuật toán K-Nearest Neighbors (KNN) để **nội suy tạo ra các mẫu lừa đảo nhân tạo mới** trong không gian đặc trưng.\n` +
        `  2. ⚖️ **Trọng số chi phí (Cost-Sensitive Learning / Class Weights):** Đặt hình phạt nặng hơn gấp nhiều lần khi mô hình dự đoán nhầm một link lừa đảo thành an toàn (False Negative penalty).\n` +
        `  3. 🎯 **Focal Loss:** Giảm trọng số của các mẫu dễ phân loại và tập trung tối đa sự chú ý vào các mẫu khó nhằn.\n` +
        `  4. 📏 **Chuyển đổi thước đo đánh giá:** Tuyệt đối không dùng Accuracy, bắt buộc sử dụng **F1-Score, Precision-Recall AUC và Ma trận nhầm lẫn (Confusion Matrix)**!`
    };
  }

  // =========================================================================
  // 8.28 MA TRẬN NHẦM LẪN (CONFUSION MATRIX) & CÔNG THỨC PRECISION, RECALL, F1
  // =========================================================================
  if (
    norm.includes("confusion matrix") || norm.includes("ma tran nham lan") ||
    norm.includes("tinh precision") || norm.includes("tinh recall") || norm.includes("tinh f1")
  ) {
    return {
      reply: `📊🔢 **MA TRẬN NHẦM LẪN (CONFUSION MATRIX) & BỘ CHỈ SỐ ĐO LƯỜNG ĐẲNG CẤP:**\n\n` +
        `Ma trận nhầm lẫn phân loại toàn bộ kết quả dự đoán thành 4 ô giá trị cốt lõi:\n` +
        `• **TP (True Positive):** Mẫu độc hại thực sự được AI nhận diện chính xác là Độc hại (1,103 mẫu).\n` +
        `• **TN (True Negative):** Mẫu an toàn được AI nhận diện chính xác là An toàn (1,842 mẫu).\n` +
        `• **FP (False Positive - Báo động nhầm):** Mẫu an toàn nhưng AI lại đoán nhầm là Độc hại (31 mẫu - chỉ 1.6%).\n` +
        `• **FN (False Negative - Bỏ lọt rủi ro):** Mẫu độc hại nhưng AI lại bỏ sót đoán là An toàn (24 mẫu).\n\n` +
        `📐 **CÔNG THỨC TOÁN HỌC & Ý NGHĨA:**\n` +
        `1. 🎯 **Precision (Độ chuẩn xác):** Đo lường khi AI hét lên 'Lừa đảo' thì có bao nhiêu % đúng sự thật?\n` +
        `   $$\\mathbf{\\text{Precision} = \\frac{TP}{TP + FP} = \\frac{1103}{1103 + 31} \\approx 98.4\\%}$$\n\n` +
        `2. 🎣 **Recall (Độ thu hồi / Độ nhạy):** Đo lường trong toàn bộ link lừa đảo tồn tại, AI bắt trúng được bao nhiêu %?\n` +
        `   $$\\mathbf{\\text{Recall} = \\frac{TP}{TP + FN} = \\frac{1103}{1103 + 24} \\approx 97.9\\%}$$\n\n` +
        `3. 🏆 **F1-Score (Trung bình điều hòa giữa Precision và Recall):** Thước đo toàn diện quan trọng nhất!\n` +
        `   $$\\mathbf{F_1 = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}} \\approx 98.1\\%}$$`
    };
  }

  // =========================================================================
  // 8.29 CHI TIẾT 16 ĐẶC TRƯNG TỪ VỰNG TRÍCH XUẤT TỪ URL CỦA PHISHARMOR
  // =========================================================================
  if ((norm.includes("16 dac trung") || norm.includes("16 feature") || (norm.includes("dac trung") && norm.includes("url"))) && !norm.includes("code") && !norm.includes("viet code")) {
    return {
      reply: `🔍🌐 **BÓC TÁCH TOÀN BỘ 16 ĐẶC TRƯNG CẤU TRÚC URL TRONG PHISHARMOR AI:**\n\n` +
        `Hệ thống tự động trích xuất 16 đặc trưng từ vựng (<12ms) để mô hình XGBoost phân loại rủi ro:\n\n` +
        `1. 📏 **URL Length:** Độ dài toàn bộ đường dẫn (URL lừa đảo thường dài bất thường để che giấu tham số).\n` +
        `2. 🌐 **Domain Length:** Độ dài tên miền chính.\n` +
        `3. 📁 **Path Length:** Độ dài đường dẫn thư mục sau tên miền.\n` +
        `4. ❓ **Query Length:** Độ dài chuỗi truy vấn tham số sau dấu hỏi chấm.\n` +
        `5. 🔘 **Dot Count:** Số lượng dấu chấm (nhiều dấu chấm biểu hiện subdomain lồng nhau để mạo danh).\n` +
        `6. ➖ **Hyphen Count:** Số lượng dấu gạch ngang (thường gặp ở tên miền nhử mồi như \`vietcom-secure-login\`).\n` +
        `7. 📧 **At Symbol (@):** Ký tự '@' (trình duyệt sẽ bỏ qua phần trước '@' và trỏ thẳng vào địa chỉ sau '@').\n` +
        `8. ⏸️ **Double Slash (//):** Chuyển hướng ẩn danh.\n` +
        `9. 🌳 **Subdomain Count:** Số lượng tên miền phụ.\n` +
        `10. 🔢 **Is IP Address:** Kiểm tra URL có sử dụng địa chỉ IP trực tiếp thay vì tên miền hay không.\n` +
        `11. 🔢 **Digit Ratio:** Tỷ lệ ký tự số trên tổng chiều dài URL.\n` +
        `12. 🔣 **Special Char Ratio:** Tỷ lệ các ký tự đặc biệt (\`%, $, &, _\`).\n` +
        `13. 🔒 **HTTPS Token in Domain:** Chèn chữ 'https' vào tên miền giả để đánh lừa thị giác người dùng.\n` +
        `14. 🚩 **Suspicious TLD:** Đuôi tên miền rủi ro cao (\`.top, .xyz, .click, .tk, .vip\`).\n` +
        `15. 🎣 **Suspicious Keywords:** Chứa các từ khóa nhử mồi lừa đảo (\`login, verify, secure, banking, bonus\`).\n` +
        `16. 🎲 **Shannon Entropy:** Độ hỗn loạn ngẫu nhiên của chuỗi ký tự (URL do máy tự động sinh - DGA có entropy rất cao).`
    };
  }

  // =========================================================================
  // 8.30 KỊCH BẢN GIẢI TRÌNH TRƯỚC BAN ĐÁNH GIÁ & KIỂM TOÁN AN NINH MẠNG
  // =========================================================================
  if ((norm.includes("hoi dong") && (norm.includes("khong biet") || norm.includes("chua biet") || norm.includes("hoi xoay") || norm.includes("kho qua") || norm.includes("bi hoi"))) || norm.includes("khong biet tra loi hoi dong") || norm.includes("bi hoi dong hoi") || norm.includes("hoi dong hoi kho")) {
    return {
      reply: `🛡️💡 **KỊCH BẢN GIẢI TRÌNH CHUYÊN NGHIỆP TRƯỚC BAN ĐÁNH GIÁ & KIỂM TOÁN AN NINH:**\n\n` +
        `Khi trình bày kiến trúc an ninh mạng trước Hội đồng thẩm định kỹ thuật hoặc Ban Giám đốc, nếu gặp câu hỏi nằm ngoài phạm vi thiết kế ban đầu, đây là quy trình ứng xử chuẩn của một Kỹ sư An ninh Chuyên nghiệp:\n\n` +
        `• ❌ **TUYỆT ĐỐI KHÔNG:**\n` +
        `  - Đứng im im lặng hoặc run rẩy toát mồ hôi.\n` +
        `  - Phỏng đoán thiếu căn cứ hoặc đưa ra số liệu chưa qua kiểm chứng.\n\n` +
        `• ✅ **KỊCH BẢN 3 BƯỚC ĂN ĐIỂM CHUYÊN NGHIỆP:**\n` +
        `  1. 🤝 **Bước 1 - Lắng nghe & Cảm ơn câu hỏi sâu sắc:**\n` +
        `     *'Dạ em xin cảm ơn câu hỏi rất hay và mang tính thực tiễn cao của Thầy/Cô ạ!'*\n\n` +
        `  2. 🎯 **Bước 2 - Thừa nhận phạm vi và đưa ra góc nhìn logic dựa trên kiến thức đã có:**\n` +
        `     *'Trong khuôn khổ đề tài hiện tại, nhóm em tập trung tối ưu hóa kiến trúc 4 tầng cho bài toán phát hiện URL tiếng Việt theo thời gian thực nên khía cạnh Thầy/Cô vừa nêu chưa nằm trong phạm vi thực nghiệm chính của đợt này. Tuy nhiên, theo góc nhìn lý thuyết và tư duy hệ thống của em, để giải quyết vấn đề này chúng ta có thể tiếp cận theo hướng [nêu ngắn gọn 1 hướng tiếp cận khả dĩ]...'*\n\n` +
        `  3. 📝 **Bước 3 - Cầu thị ghi nhận để hoàn thiện báo cáo:**\n` +
        `     *'Gợi mở này của Thầy/Cô vô cùng giá trị, em xin phép được ghi nhận sâu sắc vào sổ tay nghiên cứu và sẽ bổ sung phân tích này vào phần Hướng phát triển tương lai trong cuốn báo cáo hoàn thiện của đề tài ạ!'*\n\n` +
        `🌟 *Đánh giá:* Phong thái điềm tĩnh, rành mạch và tư duy kỹ thuật chuẩn mực sẽ tạo độ tin cậy tuyệt đối cho giải pháp an ninh của bạn!`
    };
  }

  // =========================================================================
  // 8.31 ĐÓNG GÓP MỚI (CONTRIBUTIONS) CỦA ĐỀ TÀI PHISHARMOR AI
  // =========================================================================
  if (norm.includes("dong gop cua de tai") || norm.includes("dong gop moi") || norm.includes("contribution")) {
    return {
      reply: `🏆✨ **3 ĐIỂM ĐỘT PHÁ VÀ NĂNG LỰC CỐT LÕI CỦA HỆ THỐNG PHISHARMOR:**\n\n` +
        `Khi đánh giá về tính mới và năng lực vượt trội của PhishArmor so với các giải pháp an ninh mạng truyền thống:\n\n` +
        `1. ⚡ **Kiến trúc Pipeline 4 tầng tối ưu hóa độ trễ thời gian thực (<127ms):**\n` +
        `   • Không chạy mô hình nặng một cách lãng phí; thiết kế phễu lọc thông minh: Whitelist (<1ms) -> XGBoost 16 đặc trưng (~12ms) -> PhoBERT ngữ nghĩa (~90ms) -> XAI SHAP.\n` +
        `   • Đạt độ chính xác F1-Score vượt trội **98.1%** trên tập dữ liệu kiểm thử thực tế 3,000 mẫu.\n\n` +
        `2. 🇻🇳 **Tiên phong xử lý bẫy tâm lý lừa đảo ngữ cảnh Tiếng Việt:**\n` +
        `   • Các giải pháp quốc tế (Google Safe Browsing) hoàn toàn bất lực trước tiếng lóng và bẫy mạo danh ngân hàng Việt Nam.\n` +
        `   • Đề tài đã ứng dụng thành công mô hình ngôn ngữ lớn PhoBERT VinAI để 'đọc vị' ngữ nghĩa lừa đảo đặc thù tại Việt Nam.\n\n` +
        `3. 🌲 **Tính minh bạch với Explainable AI & Sản phẩm hoàn chỉnh Manifest V3:**\n` +
        `   • Không chỉ là lý thuyết trên giấy; hệ thống tích hợp công nghệ TreeSHAP bóc tách nguyên nhân rủi ro.\n` +
        `   • Đóng gói thành công tiện ích **Google Chrome Extension (Manifest V3)** bắt sự kiện \`onBeforeNavigate\` bảo vệ người dùng tức thì!`
    };
  }

  // =========================================================================
  // 8.32 TRỢ LÝ VIẾT CODE CHUYÊN NGHIỆP (CODE GENERATOR ASSISTANT)
  // =========================================================================
  if (
    norm.includes("viet code") || norm.includes("cho toi code") || norm.includes("viet giup code") ||
    norm.includes("code python") || norm.includes("code javascript") || norm.includes("code sql") ||
    norm.includes("viet ham") || norm.includes("cho xin code")
  ) {
    if (norm.includes("python") || norm.includes("cao data") || norm.includes("trich xuat") || norm.includes("quet url")) {
      return {
        reply: `💻🐍 **MÃ NGUỒN PYTHON: TRÍCH XUẤT 16 ĐẶC TRƯNG URL VÀ DỰ ĐOÁN RỦI RO:**\n\n` +
          `Dưới đây là đoạn code Python chuẩn mực, tối ưu và có chú thích rõ ràng dành cho bạn:\n\n` +
          `\`\`\`python\n` +
          `import re\n` +
          `import math\n` +
          `from urllib.parse import urlparse\n\n` +
          `def calculate_shannon_entropy(text: str) -> float:\n` +
          `    \"\"\"Tính độ hỗn loạn Shannon Entropy của chuỗi ký tự\"\"\"\n` +
          `    if not text: return 0.0\n` +
          `    prob = [float(text.count(c)) / len(text) for c in dict.fromkeys(list(text))]\n` +
          `    return -sum([p * math.log(p) / math.log(2.0) for p in prob])\n\n` +
          `def extract_url_features(url: str) -> dict:\n` +
          `    \"\"\"Bóc tách các đặc trưng từ vựng cốt lõi của URL\"\"\"\n` +
          `    parsed = urlparse(url if "://" in url else "http://" + url)\n` +
          `    domain = parsed.netloc.lower()\n` +
          `    path = parsed.path\n\n` +
          `    return {\n` +
          `        "url_length": len(url),\n` +
          `        "domain_length": len(domain),\n` +
          `        "dot_count": url.count('.'),\n` +
          `        "hyphen_count": url.count('-'),\n` +
          `        "has_at_symbol": 1 if '@' in url else 0,\n` +
          `        "subdomain_count": max(0, len(domain.split('.')) - 2),\n` +
          `        "is_ip": 1 if re.match(r"^\\d{1,3}(\\.\\d{1,3}){3}$", domain) else 0,\n` +
          `        "shannon_entropy": round(calculate_shannon_entropy(url), 4),\n` +
          `        "has_suspicious_tld": 1 if domain.endswith(('.top', '.xyz', '.click', '.tk')) else 0\n` +
          `    }\n\n` +
          `# Thử nghiệm trích xuất:\n` +
          `sample = "http://secure-vietcombank-login.xyz/auth/verify"\n` +
          `print("Kết quả trích xuất:", extract_url_features(sample))\n` +
          `\`\`\`\n\n` +
          `Bạn có thể tích hợp ngay hàm này vào backend xử lý dữ liệu của bạn nhé!`
      };
    }

    if (norm.includes("sql")) {
      return {
        reply: `🗄️📊 **MÃ NGUỒN SQL: CÂU TRUY VẤN TỐI ƯU CƠ SỞ DỮ LIỆU & BẢNG BĂM:**\n\n` +
          `\`\`\`sql\n` +
          `-- 1. Tạo bảng lưu trữ nhật ký quét an toàn với Index tăng tốc\n` +
          `CREATE TABLE scan_records (\n` +
          `    id BIGSERIAL PRIMARY KEY,\n` +
          `    url TEXT NOT NULL,\n` +
          `    domain VARCHAR(255) NOT NULL,\n` +
          `    is_phishing BOOLEAN DEFAULT FALSE,\n` +
          `    trust_score INT CHECK (trust_score BETWEEN 0 AND 100),\n` +
          `    confidence NUMERIC(5,2),\n` +
          `    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n` +
          `);\n\n` +
          `-- 2. Đánh chỉ mục Index tối ưu tra cứu URL siêu tốc <1ms\n` +
          `CREATE INDEX idx_scan_records_domain ON scan_records(domain);\n` +
          `CREATE INDEX idx_scan_records_phishing ON scan_records(is_phishing, created_at DESC);\n\n` +
          `-- 3. Truy vấn Top 5 tên miền độc hại bị phát hiện nhiều nhất 7 ngày qua\n` +
          `SELECT domain, COUNT(*) AS attack_count, AVG(trust_score) AS avg_score\n` +
          `FROM scan_records\n` +
          `WHERE is_phishing = TRUE AND created_at >= NOW() - INTERVAL '7 days'\n` +
          `GROUP BY domain\n` +
          `ORDER BY attack_count DESC\n` +
          `LIMIT 5;\n` +
          `\`\`\``
      };
    }

    return {
      reply: `💻⚡ **MÃ NGUỒN JAVASCRIPT / TYPESCRIPT: GỌI API QUÉT REALTIME VỚI FETCH & TIMEOUT:**\n\n` +
        `\`\`\`typescript\n` +
        `interface ScanResult {\n` +
        `  is_phishing: boolean;\n` +
        `  trust_score: number;\n` +
        `  confidence: number;\n` +
        `  reasons: string[];\n` +
        `}\n\n` +
        `async function checkUrlSafety(targetUrl: string): Promise<ScanResult> {\n` +
        `  const controller = new AbortController();\n` +
        `  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout\n\n` +
        `  try {\n` +
        `    const res = await fetch("http://127.0.0.1:8000/predict", {\n` +
        `      method: "POST",\n` +
        `      headers: { "Content-Type": "application/json" },\n` +
        `      body: JSON.stringify({ url: targetUrl }),\n` +
        `      signal: controller.signal\n` +
        `    });\n` +
        `    clearTimeout(timeoutId);\n\n` +
        `    if (!res.ok) throw new Error(\`Lỗi máy chủ: \${res.status}\`);\n` +
        `    return await res.json();\n` +
        `  } catch (error: any) {\n` +
        `    if (error.name === "AbortError") {\n` +
        `      throw new Error("Yêu cầu quét bị quá hạn (Timeout)!");\n` +
        `    }\n` +
        `    throw error;\n` +
        `  }\n` +
        `}\n` +
        `\`\`\`\n\n` +
        `Nếu bạn cần viết thêm chức năng cụ thể nào, cứ nhắn mô tả chi tiết cho tôi nhé!`
    };
  }

  // =========================================================================
  // 8.33 THI SĨ AI - LÀM THƠ THEO YÊU CẦU (POETRY ENGINE)
  // =========================================================================
  if (norm.includes("lam tho") || norm.includes("viet tho") || norm.includes("bai tho") || norm.includes("tho hay")) {
    if (norm.includes("do an") || norm.includes("tot nghiep") || norm.includes("ra truong") || norm.includes("bao ve")) {
      return {
        reply: `🎓📜 **BÀI THƠ: 'NGÀY BẢO VỆ RỰC RỠ VINH QUANG' DÀNH TẶNG BẠN:**\n\n` +
          `*Mấy năm đèn sách miệt mài gieo,*\n` +
          `*Đêm thức cùng code dẫu bấy nhiêu.*\n` +
          `*Mô hình rèn luyện từng con số,*\n` +
          `*Thuật toán tôi rèn vạn buổi chiều.*\n\n` +
          `*Hôm nay tự tin lên bục giảng,*\n` +
          `*Lời vàng ý ngọc ngát hương bay.*\n` +
          `*Thầy cô mỉm cười khen ngợi chúc,*\n` +
          `*Điểm A tuyệt đối rạng tương lai!* 🌟🎓\n\n` +
          `*(Hệ thống PhishArmor luôn sẵn sàng hỗ trợ các phân tích kỹ thuật và thẩm định an ninh mạng chuyên sâu.)*`
      };
    }

    if (norm.includes("it") || norm.includes("lap trinh") || norm.includes("coder") || norm.includes("bug")) {
      return {
        reply: `💻☕ **BÀI THƠ: 'ĐỜI LẬP TRÌNH VIÊN' THÂN THƯƠNG:**\n\n` +
          `*Đêm khuya thanh vắng bóng màn hình,*\n` +
          `*Cốc cà phê đắng ngẫm nhân sinh.*\n` +
          `*Dòng code vừa gõ trôi êm ả,*\n` +
          `*Chợt thấy dòng bug giật thót mình!*\n\n` +
          `*Fix xong một lỗi trời vừa sáng,*\n` +
          `*Nụ cười rạng rỡ đón bình minh.*\n` +
          `*Đam mê công nghệ luôn bùng cháy,*\n` +
          `*Kiến tạo tương lai trọn nghĩa tình!* 🚀✨`
      };
    }

    return {
      reply: `🌸🍃 **BÀI THƠ: 'BÌNH YÊN VÀ HY VỌNG' DÀNH TẶNG BẠN:**\n\n` +
        `*Gió thoảng mây trôi nắng ngập tràn,*\n` +
        `*Tâm hồn thanh thản bước thênh thang.*\n` +
        `*Âu lo gác lại sau vạt áo,*\n` +
        `*Đón lấy niềm vui ánh rực vàng.*\n\n` +
        `*Đường dài phía trước hoa khoe sắc,*\n` +
        `*Vững bước kiên tâm mộng đại ngàn!* ✨💖`
    };
  }

  // =========================================================================
  // 9. PHÁT TRIỂN SỰ NGHIỆP & KỸ NĂNG CÔNG SỞ (CAREER & SOFT SKILLS)
  // =========================================================================

  // 9.1 TỰ TIN THUYẾT TRÌNH TRƯỚC ĐÁM ĐÔNG
  if (
    norm.includes("tu tin thuyet trinh") || norm.includes("so dam dong") ||
    norm.includes("run khi noi") || norm.includes("ky nang thuyet trinh")
  ) {
    return {
      reply: `🎤 **BÍ QUYẾT TỰ TIN THUYẾT TRÌNH & HẾT RUN TRƯỚC ĐÁM ĐÔNG:**\n\n` +
        `1. 📖 **Hiểu sâu 120% nội dung:** Nắm bản chất câu chuyện thay vì học vẹt. Khi hiểu sâu, dù có quên từ bạn vẫn diễn đạt tự nhiên theo cách khác.\n\n` +
        `2. 👀 **Quy tắc 3 điểm nhìn bao quát:** Đừng nhìn trần nhà hay màn hình máy chiếu! Hãy chọn ra 3 gương mặt thân thiện (trái, giữa, phải) và luân phiên giao tiếp ánh mắt.\n\n` +
        `3. 🫁 **Hít thở sâu 4 nhịp trước giờ G:** Hít sâu bằng bụng giúp ổn định nhịp tim. Uống 1 ngụm nước ấm để không bị dính giọng.\n\n` +
        `4. ✨ **Mở đầu bằng tương tác:** Đặt 1 câu hỏi khảo sát ngắn hoặc 1 câu chuyện vui. Khi khán giả mỉm cười hoặc gật đầu, sự tự tin trong bạn sẽ bùng nổ ngay lập tức!`
    };
  }

  // 9.2 ÁP LỰC ĐỒNG TRANG LỨA (PEER PRESSURE)
  if (norm.includes("ap luc dong trang lua") || norm.includes("peer pressure") || norm.includes("thua kem ban be")) {
    return {
      reply: `🌿 **CÁCH VƯỢT QUA ÁP LỰC ĐỒNG TRANG LỨA (PEER PRESSURE):**\n\n` +
        `1. 📱 **Mạng xã hội chỉ là 'Highlight Reel':** Người ta chỉ khoe những khoảnh khắc rực rỡ nhất lên mạng, không ai khoe những đêm thức trắng khóc thầm hay thất bại. Đừng so sánh hậu trường của mình với sân khấu của người khác!\n\n` +
        `2. ⏳ **Mỗi người có một múi giờ cuộc đời khác nhau:** Bạn không hề chậm trễ, bạn đang đi đúng tiến trình của riêng mình!\n\n` +
        `3. 🎯 **Thước đo duy nhất:** So sánh bản thân hôm nay với chính mình của ngày hôm qua. Chỉ cần mỗi ngày tiến bộ 1% là bạn đã cực kỳ thành công rồi! 🌟`
    };
  }

  // 9.3 VIẾT CV XIN VIỆC THEO CÔNG THỨC XYZ CỦA GOOGLE
  if (norm.includes("viet cv") || norm.includes("cv xin viec") || norm.includes("lam cv") || norm.includes("viet resume")) {
    return {
      reply: `📄 **BÍ QUYẾT VIẾT CV XIN VIỆC CHUẨN ĐẸP ĐƯỢC CÁC TẬP ĐOÀN CÔNG NGHỆ ƯA CHUỘNG:**\n\n` +
        `• **1. Công thức XYZ kinh điển của Google:** Thay vì viết chung chung *"Tham gia phát triển dự án bảo mật"*, hãy viết:\n` +
        `  $$\\text{Đạt được [X], được đo lường bằng [Y], thông qua việc làm [Z]}$$\n` +
        `  *Ví dụ:* "Xây dựng hệ sinh thái phòng thủ lừa đảo PhishArmor AI đạt độ chính xác F1-Score 98.1% trên 3,000 mẫu kiểm thử thông qua kết hợp mô hình PhoBERT và XGBoost."\n\n` +
        `• **2. Độ dài tối ưu: ĐÚNG 1 TRANG A4:** Các nhà tuyển dụng chỉ dành trung bình 6 giây để lướt qua một CV. Đừng viết dài dòng 3-4 trang!\n\n` +
        `• **3. Cấu trúc 4 phần chuẩn:** Thông tin liên hệ, Kỹ năng kỹ thuật, Dự án nổi bật (kèm số liệu thực tế), Học vấn & Chứng chỉ.`
    };
  }

  // 9.4 TRẢ LỜI PHỎNG VẤN THEO MÔ HÌNH STAR
  if (norm.includes("phong van") || norm.includes("tra loi phong van") || norm.includes("phuong phap star")) {
    return {
      reply: `🎯 **MÔ HÌNH STAR - BÍ QUYẾT CHINH PHỤC MỌI CÂU HỎI PHỎNG VẤN HÀNH VI:**\n\n` +
        `• **S - Situation (Hoàn cảnh):** Mô tả ngắn gọn bối cảnh dự án lúc đó.\n` +
        `• **T - Task (Nhiệm vụ):** Nhiệm vụ cụ thể em phải giải quyết là gì.\n` +
        `• **A - Action (Hành động):** Em đã làm gì cụ thể? (Phân tích nguyên nhân, dùng thuật toán gì, áp dụng giải pháp nào).\n` +
        `• **R - Result (Kết quả):** Kết quả đạt được bằng con số đo lường cụ thể (Tỷ lệ cảnh báo nhầm giảm dưới 1.6%, điểm F1 98.1%).`
    };
  }

  // 9.5 CHIẾN THẮNG THÓI QUEN TRÌ HOÃN (PROCRASTINATION)
  if (norm.includes("tri hoan") || norm.includes("luoi qua") || norm.includes("khong co dong luc") || norm.includes("procrastination")) {
    return {
      reply: `⏰ **2 VŨ KHÍ TÂM LÝ ĐÁNH BẠI SỰ TRÌ HOÃN TRONG VÒNG 5 GIÂY:**\n\n` +
        `• **1. Quy tắc 5 giây (The 5 Second Rule):** Khi có ý định cần làm gì, đếm ngược thành tiếng: **5 - 4 - 3 - 2 - 1 -> HÀNH ĐỘNG NGAY!** Đếm ngược kích hoạt vùng vỏ não trước trán, ngăn não bộ kịp tìm lý do thoái thác.\n\n` +
        `• **2. Quy tắc 2 phút:** Tự nhủ với bản thân: *"Mình chỉ mở máy lên viết đúng 2 dòng code / đọc đúng 2 trang sách thôi rồi nghỉ cũng được"*. Khi vượt qua lực cản ban đầu, quán tính tâm lý sẽ cuốn bạn làm tiếp suốt 1-2 tiếng một cách tự nhiên!`
    };
  }

  // =========================================================================
  // 10. QUẢN LÝ TÀI CHÍNH CÁ NHÂN (PERSONAL FINANCE)
  // =========================================================================
  if (norm.includes("quan ly tai chinh") || norm.includes("6 chiec lo") || norm.includes("50/30/20") || norm.includes("lam phat la gi") || norm.includes("lai kep")) {
    if (norm.includes("lam phat")) {
      return {
        reply: `📉 **LẠM PHÁT (INFLATION) LÀ GÌ VÀ TẠI SAO BẠN BỊ 'NGHÈO ĐI MỖI NGÀY'?**\n\n` +
          `• **Định nghĩa giản dị:** Lạm phát là sự tăng giá liên tục của hàng hóa và dịch vụ theo thời gian, đồng nghĩa với việc **SỨC MUA của đồng tiền bị giảm sút**.\n\n` +
          `• **Ví dụ dễ hiểu:**\n` +
          `  - 10 năm trước: 20.000 VNĐ bạn ăn được một bát phở bò đầy ắp.\n` +
          `  - Hiện tại: Vẫn tờ 20.000 VNĐ đó bạn chỉ mua được chiếc bánh mì kẹp chả nhỏ.\n` +
          `  -> Tờ tiền vẫn là 20.000 VNĐ, nhưng lượng hàng hóa bạn mua được đã vơi đi một nửa!\n\n` +
          `• **Cách tự vệ:** Đầu tư vào các tài sản có khả năng tăng giá vượt lạm phát: Nâng cao kỹ năng bản thân để tăng thu nhập, tích lũy vàng, hoặc đầu tư vào quỹ cổ phiếu chỉ số uy tín.`
      };
    }

    if (norm.includes("lai kep") || norm.includes("compound interest")) {
      return {
        reply: `📈 **LÃI KÉP (COMPOUND INTEREST) - 'KỲ QUAN THỨ 8 CỦA THẾ GIỚI':**\n\n` +
          `Nhà bác học Albert Einstein từng nói: *"Lãi kép là kỳ quan thứ 8 của thế giới. Ai hiểu nó sẽ kiếm được tiền; ai không hiểu sẽ phải trả giá cho nó!"*\n\n` +
          `• **Bản chất của lãi kép:** Tiền lãi sinh ra sau mỗi kỳ hạn lại được cộng dồn vào tiền vốn ban đầu để tiếp tục sinh lãi cho chu kỳ tiếp theo (Lãi mẹ đẻ lãi con).\n\n` +
          `• **Công thức toán học:**\n` +
          `  $$\\mathbf{A = P \\left(1 + \\frac{r}{n}\\right)^{nt}}$$\n` +
          `  *(Trong đó $P$ là vốn gốc ban đầu, $r$ là lãi suất hàng năm, $n$ là số lần ghép lãi mỗi năm, $t$ là số năm đầu tư)*.\n\n` +
          `• **Sức mạnh kỳ diệu của Thời gian:**\n` +
          `  Nếu mỗi tháng từ năm 20 tuổi bạn đều đặn tiết kiệm đầu tư 2 triệu VNĐ với mức sinh lời 10%/năm, đến năm 50 tuổi (sau 30 năm), tổng số tiền bạn nạp vào chỉ là 720 triệu VNĐ, nhưng số dư trong tài khoản của bạn sẽ phình to lên tới **HƠN 4.5 TỶ VNĐ** nhờ sức mạnh của lãi kép!`
      };
    }

    return {
      reply: `💰 **QUY TẮC QUẢN LÝ TÀI CHÍNH CÁ NHÂN 6 CHIẾC LỌ (JARS SYSTEM):**\n\n` +
        `Phương pháp của T. Harv Eker giúp bạn làm chủ đồng tiền, không bao giờ rơi vào cảnh 'đầu tháng rủng rỉnh, cuối tháng ăn mì tôm':\n\n` +
        `1. 🏠 **Lọ 1 - Nhu cầu thiết yếu (55%):** Tiền trọ, ăn uống, điện nước, xăng xe, hóa đơn bắt buộc.\n` +
        `2. 🏦 **Lọ 2 - Tiết kiệm dài hạn (10%):** Quỹ khẩn cấp, mua sắm tài sản lớn trong tương lai.\n` +
        `3. 📚 **Lọ 3 - Giáo dục & Nâng cấp bản thân (10%):** Mua sách, học khóa học công nghệ/ngoại ngữ.\n` +
        `4. ☕ **Lọ 4 - Hưởng thụ & Giải trí (10%):** Đi xem phim, ăn ngon cuối tuần, du lịch xả stress.\n` +
        `5. 📈 **Lọ 5 - Tự do tài chính (10%):** Tiền để đầu tư sinh lời thụ động (chứng khoán, gửi tiết kiệm, kinh doanh).\n` +
        `6. ❤️ **Lọ 6 - Cho đi & Từ thiện (5%):** Giúp đỡ người khó khăn, quà cáp hiếu kính cha mẹ.`
    };
  }

  // =========================================================================
  // 11. THỂ THAO & BÓNG ĐÁ (SPORTS & FOOTBALL LEGENDS)
  // =========================================================================

  // 11.1 CẦU THỦ NỔI TIẾNG NHẤT THẾ GIỚI & BÓNG ĐÁ
  const isAskingFamousPlayers =
    (norm.includes("cau thu") || norm.includes("bong da")) &&
    (norm.includes("noi tieng") || norm.includes("xuat sac") || norm.includes("hay nhat") ||
     norm.includes("gioi nhat") || norm.includes("vi dai") || norm.includes("goat") ||
     norm.includes("top") || norm.includes("ai la") || norm.includes("nhung ai") ||
     norm.includes("biet cau thu nao") || norm.includes("ke ten") || norm.includes("huyen thoai"));

  if (isAskingFamousPlayers) {
    return {
      reply: `⚽🌟 **DANH SÁCH NHỮNG CẦU THỦ NỔI TIẾNG & VĨ ĐẠI NHẤT LỊCH SỬ BÓNG ĐÁ:**\n\n` +
        `Nhắc đến những cầu thủ bóng đá nổi tiếng và xuất sắc nhất mọi thời đại, cả thế giới đều công nhận những tượng đài sau đây bạn nhé:\n\n` +
        `1. 👑 **Lionel Messi (Argentina) - "G.O.A.T" (Vĩ đại nhất mọi thời đại):**\n` +
        `   • Kỷ lục vô tiền khoáng hậu: **8 Quả Bóng Vàng (Ballon d'Or)**, 6 Chiếc Giày Vàng châu Âu.\n` +
        `   • Đỉnh cao chói lọi: Dẫn dắt Argentina vô địch **World Cup 2022**, 4 chức vô địch UEFA Champions League, sở hữu bộ sưu tập danh hiệu đồ sộ nhất lịch sử bóng đá.\n\n` +
        `2. ⚡ **Cristiano Ronaldo - CR7 (Bồ Đào Nha) - Cỗ máy săn bàn kỷ lục:**\n` +
        `   • Sở hữu **5 Quả Bóng Vàng**, 5 cúp UEFA Champions League.\n` +
        `   • Chân sút vĩ đại nhất lịch sử bóng đá thế giới với hơn **900 bàn thắng chính thức**, biểu tượng bất diệt của ý chí và tinh thần kỷ luật thép.\n\n` +
        `3. 🕊️ **Pelé (Brazil) - "Vua bóng đá":**\n` +
        `   • Huyền thoại duy nhất trong lịch sử từng **3 lần nâng cúp vô địch World Cup** (1958, 1962, 1970) cùng đội tuyển Brazil.\n\n` +
        `4. 🔟 **Diego Maradona (Argentina) - "Cậu bé vàng":**\n` +
        `   • Thiên tài bóng đá với bàn thắng thế kỷ solo qua 5 cầu thủ Anh tại World Cup 1986, linh hồn bất tử của bóng đá Nam Mỹ.\n\n` +
        `5. 🚀 **Thế hệ siêu sao đương đại thống trị thế giới:**\n` +
        `   • **Kylian Mbappé:** Vua phá lưới World Cup với tốc độ bứt phá kinh hoàng.\n` +
        `   • **Erling Haaland:** Quái vật ghi bàn phá vỡ mọi kỷ lục của giải Ngoại Hạng Anh.\n` +
        `   • **Vinícius Júnior & Jude Bellingham:** Những trụ cột đưa Real Madrid vô địch cúp C1.\n\n` +
        `🇻🇳 **Về bóng đá Việt Nam:** Những gương mặt nổi tiếng được hàng triệu người hâm mộ yêu mến gồm có **Quang Hải**, **Hoàng Đức**, **Công Phượng**, cùng thế hệ vàng huyền thoại như **Lê Công Vinh**, **Nguyễn Hồng Sơn**!\n\n` +
        `Bạn có phải là fan của bóng đá không? Trong số những siêu sao này bạn thần tượng ai nhất? ⚽🔥`
    };
  }

  // 11.2 BÓNG ĐÁ NÓI CHUNG
  if (norm.includes("bong da") || norm.includes("world cup") || norm.includes("ngoai hang anh") || norm.includes("champions league") || norm.includes("cau thu")) {
    return {
      reply: `⚽🏃 **BÓNG ĐÁ - MÔN THỂ THAO VUA ĐẦY ĐAM MÊ:**\n\n` +
        `Bóng đá luôn mang lại những cảm xúc vỡ òa từ những đêm không ngủ cùng World Cup, Euro, Champions League, Ngoại Hạng Anh cho đến những chiến thắng nghẹt thở của đội tuyển Việt Nam!\n\n` +
        `Bạn hâm mộ câu lạc bộ nào nhất nè (Real Madrid, Barcelona, Manchester United, Arsenal, Man City, Liverpool...)? Hay bạn muốn tìm hiểu thông tin về cầu thủ hoặc giải đấu nào, cứ chia sẻ cùng mình nha! 😄🏆`
    };
  }

  // =========================================================================
  // 12. VĂN HỌC & KHO TÀNG TRUYỆN CỔ TÍCH VIỆT NAM (FOLKLORE & FAIRY TALES)
  // =========================================================================
  if (
    norm.includes("truyen co tich") || norm.includes("co tich viet nam") || norm.includes("su tich") ||
    norm.includes("than thoai viet nam") || norm.includes("tam cam") || norm.includes("thach sanh") ||
    norm.includes("cay khe") || norm.includes("so dua") || norm.includes("mai an tiem") ||
    norm.includes("banh chung banh giay") || norm.includes("son tinh thuy tinh") || norm.includes("thanh giong") ||
    norm.includes("cay tre tram dot") || norm.includes("an khe tra vang") || norm.includes("trau cau")
  ) {
    return {
      reply: `📖✨ **KHO TÀNG TRUYỆN CỔ TÍCH & TRUYỀN THUYẾT DÂN GIAN VIỆT NAM:**\n\n` +
        `Dạ biết rất rõ luôn bạn ơi! Kho tàng truyện cổ tích Việt Nam vô cùng phong phú, thấm đượm tâm hồn dân tộc và bài học nhân văn sâu sắc: "ở hiền gặp lành", cái thiện luôn chiến thắng cái ác. Dưới đây là những câu chuyện kinh điển nhất gắn liền với tuổi thơ người Việt:\n\n` +
        `1. 🌟 **Tấm Cám:** Truyện cổ tích thần kỳ tiêu biểu nhất, kể về cuộc đời gian truân và sự hóa thân kỳ diệu của cô Tấm lương thiện (chim vàng anh, hai cây xoan đào, khung cửi và quả thị) để giành lại hạnh phúc trước sự độc ác của mẹ con Cám.\n\n` +
        `2. ⚔️ **Thạch Sanh:** Chàng dũng sĩ mồ côi tài ba diệt Chằn tinh, giết đại bàng cứu công chúa, sở hữu tiếng đàn gảy giải oan và niêu cơm thần kỳ hàng vạn quân giặc ăn mãi không hết.\n\n` +
        `3. 🍉 **Sự tích Quả Dưa Hấu (Mai An Tiêm):** Bài học sâu sắc về ý chí tự lực cánh sinh: *"Của biếu là của lo, của cho là của nợ"*, biến hòn đảo hoang cằn cỗi thành vùng đất trù phú với giống dưa ngọt mát.\n\n` +
        `4. 🐦 **Cây Khế (Ăn khế trả vàng):** Lời răn dạy về lòng tham lam vô đáy của người anh *"may túi sáu gang"* dẫn đến kết cục bi thảm, đối lập với đức tính hiền lành, trung thực của người em *"may túi ba gang"*.\n\n` +
        `5. 🥥 **Sọ Dừa:** Khẳng định vẻ đẹp nhân cách bên trong quý giá hơn hình hài khiếm khuyết bên ngoài. Chàng Sọ Dừa chăm chỉ chăn bò, thông minh thi đỗ Trạng nguyên và tìm lại người vợ hiền.\n\n` +
        `6. 🍙 **Sự tích Bánh Chưng - Bánh Giầy (Lang Liêu):** Tấm lòng thơm thảo của chàng hoàng tử nghèo hướng về cội nguồn và hạt ngọc quê hương: Bánh chưng vuông tượng trưng cho Đất, bánh giầy tròn tượng trưng cho Trời.\n\n` +
        `7. 🎋 **Cây Tre Trăm Đốt ("Khắc nhập, khắc xuất"):** Phê phán phú ông gian xảo thất hứa và ngợi ca lòng kiên nhẫn, mộc mạc của anh nông dân Khoai được Bụt giúp đỡ.\n\n` +
        `8. ⛰️ **Sơn Tinh - Thủy Tinh:** Truyền thuyết giải thích hiện tượng bão lũ thiên tai hàng năm ở đồng bằng sông Hồng và sức mạnh đoàn kết đắp đê ngăn lũ quật cường của tổ tiên ta.\n\n` +
        `9. 🐎 **Thánh Gióng (Phù Đổng Thiên Vương):** Cậu bé làng Gióng 3 tuổi vươn vai thành tráng sĩ, cưỡi ngựa sắt, nhổ tre ngà đánh tan giặc Ân - biểu tượng bất tử cho tinh thần yêu nước quật khởi.\n\n` +
        `10. 🐉 **Sự tích Trầu Cau:** Biểu tượng sâu sắc cho tình anh em máu mủ ruột rà và tình nghĩa vợ chồng son sắt thủy chung của người Việt.\n\n` +
        `Bạn thích nhất câu chuyện nào trong số này nè? Hay bạn muốn mình kể chi tiết cốt truyện nào, cứ nói cho mình nghe nhé! 🧚‍♀️📜`
    };
  }

  // =========================================================================
  // 13. CHƯƠNG TRÌNH TOÁN HỌC PHỔ THÔNG (TOÁN 10, TOÁN 11, TOÁN 12)
  // =========================================================================

  // 13.1 TOÁN LỚP 11
  if (
    norm.includes("toan lop 11") || norm.includes("toan 11") || norm.includes("toan hoc lop 11") ||
    (norm.includes("toan") && norm.includes("11")) || norm.includes("chuong trinh toan 11")
  ) {
    return {
      reply: `📐📚 **TỔNG QUAN TOÀN BỘ KIẾN THỨC MÔN TOÁN LỚP 11 (CHƯƠNG TRÌNH MỚI BỘ GD&ĐT):**\n\n` +
        `Toán lớp 11 là năm học bản lề cực kỳ quan trọng với khối lượng kiến thức chiếm tỷ trọng lớn trong đề thi tốt nghiệp THPT và đánh giá năng lực. Toàn bộ chương trình được chia thành 3 phân môn cốt lõi:\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 **PHẦN 1: ĐẠI SỐ & MỘT SỐ YẾU TỐ GIẢI TÍCH:**\n` +
        `1. 📈 **Hàm số lượng giác & Phương trình lượng giác:**\n` +
        `   • Tính chẵn lẻ, chu kỳ, đồ thị của 4 hàm số: $y = \\sin x, \\cos x, \\tan x, \\cot x$.\n` +
        `   • Các công thức lượng giác cơ bản, công thức cộng, công thức nhân đôi, biến đổi tích thành tổng.\n` +
        `   • Phương trình lượng giác cơ bản: $\\sin x = m, \\cos x = m, \\tan x = m, \\cot x = m$.\n\n` +
        `2. 🔢 **Dãy số, Cấp số cộng & Cấp số nhân:**\n` +
        `   • Khái niệm dãy số tăng, giảm, bị chặn.\n` +
        `   • **Cấp số cộng (CSC):** Số hạng tổng quát $u_n = u_1 + (n-1)d$; Tổng $n$ số hạng đầu $S_n = \\frac{n(u_1 + u_n)}{2}$.\n` +
        `   • **Cấp số nhân (CSN):** Số hạng tổng quát $u_n = u_1 \\cdot q^{n-1}$; Tổng $n$ số hạng đầu $S_n = \\frac{u_1(1 - q^n)}{1 - q}$.\n\n` +
        `3. ♾️ **Giới hạn & Hàm số liên tục:**\n` +
        `   • Giới hạn dãy số (dãy số hữu hạn và vô cực).\n` +
        `   • Giới hạn hàm số tại một điểm và tại vô cực (xử lý các dạng vô định: $\\frac{0}{0}, \\frac{\\infty}{\\infty}, \\infty - \\infty$).\n` +
        `   • Xét tính liên tục của hàm số tại một điểm và trên một khoảng/đoạn (Định lý giá trị trung gian).\n\n` +
        `4. ⚡ **Đạo hàm (Kiến thức trọng tâm nhất):**\n` +
        `   • Định nghĩa đạo hàm bằng giới hạn $f'(x_0) = \\lim_{x \\to x_0} \\frac{f(x) - f(x_0)}{x - x_0}$.\n` +
        `   • Bảng đạo hàm các hàm số cơ bản ($x^n, \\sqrt{x}, \\sin x, \\cos x, \\tan x$) và đạo hàm hàm hợp.\n` +
        `   • **Ý nghĩa hình học:** Phương trình tiếp tuyến của đồ thị tại điểm $M(x_0, y_0)$ là: $y - y_0 = f'(x_0)(x - x_0)$.\n` +
        `   • **Ý nghĩa vật lý:** Vận tốc tức thời $v(t) = s'(t)$, gia tốc tức thời $a(t) = v'(t) = s''(t)$.\n\n` +
        `5. 📉 **Hàm số mũ & Hàm số lôgarit:**\n` +
        `   • Phép tính lũy thừa số mũ thực, các tính chất logarit $\\log_a(xy) = \\log_a x + \\log_a y$.\n` +
        `   • Phương trình và bất phương trình mũ, logarit cơ bản.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🧊 **PHẦN 2: HÌNH HỌC KHÔNG GIAN (PHẦN NẶNG NHẤT):**\n` +
        `1. 🛤️ **Quan hệ song song trong không gian:**\n` +
        `   • Đường thẳng song song đường thẳng; Đường thẳng song song mặt phẳng ($d // (\\alpha)$).\n` +
        `   • Hai mặt phẳng song song ($(\\alpha) // (\\beta)$), Định lý Ta-lét trong không gian, phép chiếu song song.\n\n` +
        `2. 📐 **Quan hệ vuông góc trong không gian:**\n` +
        `   • Đường thẳng vuông góc mặt phẳng ($d \\perp (\\alpha)$ - Định lý ba đường vuông góc).\n` +
        `   • Hai mặt phẳng vuông góc; Góc giữa đường thẳng và mặt phẳng; Góc nhị diện (góc giữa hai mặt phẳng).\n` +
        `   • **Khoảng cách:** Khoảng cách từ điểm đến đường thẳng, điểm đến mặt phẳng, và khoảng cách giữa 2 đường thẳng chéo nhau.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🎲 **PHẦN 3: XÁC SUẤT & THỐNG KÊ:**\n` +
        `• **Mẫu số liệu ghép nhóm:** Tính khoảng biến thiên, khoảng tứ phân vị, phương sai và độ lệch chuẩn để đo mức độ phân tán của dữ liệu.\n` +
        `• **Quy tắc tính xác suất:** Biến cố hợp, biến cố giao, biến cố độc lập, công thức cộng xác suất $P(A \\cup B)$ và công thức nhân xác suất $P(AB)$.\n\n` +
        `💡 **Bí kíp học giỏi Toán 11:** Hãy rèn thật chắc kỹ năng vẽ hình không gian chuẩn xác và nắm vững bảng công thức Đạo hàm, vì đây là 2 chủ đề chiếm điểm lớn nhất khi lên lớp 12 và thi đại học bạn nhé!`
    };
  }

  // 13.2 TOÁN LỚP 12
  if (
    norm.includes("toan lop 12") || norm.includes("toan 12") || norm.includes("toan hoc lop 12") ||
    (norm.includes("toan") && norm.includes("12")) || norm.includes("chuong trinh toan 12")
  ) {
    return {
      reply: `📐🎓 **TỔNG HỢP KIẾN THỨC MÔN TOÁN LỚP 12 (TRỌNG TÂM THI TỐT NGHIỆP THPT):**\n\n` +
        `1. 📈 **Ứng dụng Đạo hàm để khảo sát và vẽ đồ thị hàm số:**\n` +
        `   • Tính đơn điệu (đồng biến, nghịch biến), Cực trị hàm số ($f'(x) = 0$).\n` +
        `   • Giá trị lớn nhất (GTLN) và giá trị nhỏ nhất (GTNN) trên một đoạn.\n` +
        `   • Đường tiệm cận đứng ($x = x_0$) và tiệm cận ngang ($y = y_0$) của đồ thị.\n\n` +
        `2. 🎯 **Nguyên hàm - Tích phân & Ứng dụng:**\n` +
        `   • Bảng nguyên hàm cơ bản, phương pháp đổi biến số và từng phần (UDV).\n` +
        `   • Tích phân Newton-Leibniz $\\int_a^b f(x)dx = F(b) - F(a)$.\n` +
        `   • Ứng dụng tích phân tính diện tích hình phẳng $S = \\int_a^b |f(x) - g(x)|dx$ và thể tích khối tròn xoay $V = \\pi \\int_a^b f^2(x)dx$.\n\n` +
        `3. 🌐 **Phương pháp tọa độ trong không gian Oxyz:**\n` +
        `   • Tọa độ điểm, vectơ, tích có hướng của 2 vectơ.\n` +
        `   • Phương trình mặt cầu $(x-a)^2 + (y-b)^2 + (z-c)^2 = R^2$.\n` +
        `   • Phương trình mặt phẳng $Ax + By + Cz + D = 0$ và phương trình đường thẳng chính tắc/tham số.\n\n` +
        `4. 🎲 **Xác suất có điều kiện & Thống kê nâng cao:**\n` +
        `   • Công thức xác suất có điều kiện $P(A|B)$, công thức xác suất toàn phần và công thức Bayes.`
    };
  }

  // 13.3 TOÁN LỚP 10
  if (
    norm.includes("toan lop 10") || norm.includes("toan 10") || norm.includes("toan hoc lop 10") ||
    (norm.includes("toan") && norm.includes("10")) || norm.includes("chuong trinh toan 10")
  ) {
    return {
      reply: `📐🎒 **TỔNG QUAN KIẾN THỨC MÔN TOÁN LỚP 10:**\n\n` +
        `• **1. Mệnh đề & Tập hợp:** Mệnh đề kéo theo, mệnh đề phủ định, các phép toán giao, hợp, hiệu của tập hợp.\n` +
        `• **2. Bất phương trình bậc nhất hai ẩn & Hệ bất phương trình:** Biểu diễn miền nghiệm trên mặt phẳng tọa độ (bài toán quy hoạch tuyến tính tối ưu lợi nhuận).\n` +
        `• **3. Hệ thức lượng trong tam giác:** Định lý Côsin ($a^2 = b^2 + c^2 - 2bc\\cos A$), Định lý Sin ($\\frac{a}{\\sin A} = 2R$), các công thức tính diện tích tam giác (Heron $S = \\sqrt{p(p-a)(p-b)(p-c)}$).\n` +
        `• **4. Vectơ trong mặt phẳng:** Tọa độ vectơ, cộng trừ vectơ, tích vô hướng của 2 vectơ $\\vec{u} \\cdot \\vec{v} = |\\vec{u}| \\cdot |\\vec{v}| \\cos(\\vec{u}, \\vec{v})$.\n` +
        `• **5. Phương pháp tọa độ Oxy:** Phương trình tổng quát, tham số của đường thẳng, phương trình đường tròn và ba đường conic (Elip, Hypebol, Parabol).\n` +
        `• **6. Đại số tổ hợp:** Quy tắc cộng, quy tắc nhân, hoán vị ($P_n = n!$), chỉnh hợp ($A_n^k$), tổ hợp ($C_n^k$) và nhị thức Newton.`
    };
  }

  // =========================================================================
  // 14. KHOA HỌC TỰ NHIÊN (VẬT LÝ, HÓA HỌC, SINH HỌC)
  // =========================================================================

  // 14.1 VẬT LÝ PHỔ THÔNG
  if (
    norm.includes("vat ly") || norm.includes("mon ly") || norm.includes("dao dong dieu hoa") ||
    norm.includes("song co") || norm.includes("dong dien xoay chieu") || norm.includes("dinh luat newton")
  ) {
    return {
      reply: `⚡🔭 **TỔNG KẾT KIẾN THỨC VẬT LÝ TRỌNG TÂM:**\n\n` +
        `1. 〰️ **Dao động điều hòa:** Phương trình li độ $x = A\\cos(\\omega t + \\varphi)$, vận tốc $v = x' = -\\omega A\\sin(\\omega t + \\varphi)$, gia tốc $a = v' = -\\omega^2 x$. Cơ năng bảo toàn $W = \\frac{1}{2}kA^2 = \\frac{1}{2}m\\omega^2 A^2$.\n\n` +
        `2. 🌊 **Sóng cơ & Sóng âm:** Bước sóng $\\lambda = v \\cdot T = \\frac{v}{f}$. Hiện tượng giao thoa sóng (vân cực đại $d_2 - d_1 = k\\lambda$, vân cực tiểu $d_2 - d_1 = (k + 0.5)\\lambda$), sóng dừng trên dây.\n\n` +
        `3. 💡 **Dòng điện xoay chiều:** Mạch RLC nối tiếp, tổng trở $Z = \\sqrt{R^2 + (Z_L - Z_C)^2}$. Hiện tượng cộng hưởng điện khi $Z_L = Z_C \\Leftrightarrow \\omega = \\frac{1}{\\sqrt{LC}}$, khi đó $I_{max} = \\frac{U}{R}$ và hệ số công suất $\\cos\\varphi = 1$.\n\n` +
        `4. 🍎 **3 Định luật Newton:** Định luật quán tính (I), Định luật cơ bản động lực học $\\vec{F} = m\\vec{a}$ (II), và Định luật tương tác $\\vec{F}_{AB} = -\\vec{F}_{BA}$ (III).`
    };
  }

  // 14.2 HÓA HỌC PHỔ THÔNG
  if (
    ((norm.includes("hoa hoc") || norm.includes("mon hoa") || norm.includes("hoa huu co")) && !norm.includes("khoa hoc")) ||
    norm.includes("bang tuan hoan") || norm.includes("este") || norm.includes("cacbohidrat")
  ) {
    return {
      reply: `🧪⚗️ **TỔNG HỢP KIẾN THỨC MÔN HÓA HỌC:**\n\n` +
        `1. ⚛️ **Hóa Vô Cơ:**\n` +
        `   • Bảng tuần hoàn các nguyên tố: Xu hướng biến đổi bán kính nguyên tử, độ âm điện và tính kim loại/phi kim qua các chu kỳ và phân nhóm.\n` +
        `   • Phản ứng Oxi hóa - Khử: *"Khử cho - O nhận"* (Chất khử nhường electron, chất oxi hóa nhận electron).\n` +
        `   • Dãy điện hóa kim loại: K, Na, Ba, Ca, Mg, Al, Zn, Fe, Ni, Sn, Pb, H, Cu, Hg, Ag, Pt, Au.\n\n` +
        `2. 🌿 **Hóa Hữu Cơ:**\n` +
        `   • **Este - Lipit:** Phản ứng este hóa $RCOOH + R'OH \\rightleftharpoons RCOOR' + H_2O$, phản ứng xà phòng hóa.\n` +
        `   • **Cacbohiđrat:** Glucozơ & Fructozơ (monosaccarit), Saccarozơ (đisaccarit), Tinh bột & Xenlulozơ (polisaccarit).\n` +
        `   • **Amin, Amino axit & Protein:** Tính lưỡng tính của amino axit, liên kết peptit hình thành protein.`
    };
  }

  // 14.3 SINH HỌC
  if (
    norm.includes("sinh hoc") || norm.includes("mon sinh") || norm.includes("adn") ||
    norm.includes("dot bien gen") || norm.includes("menden")
  ) {
    return {
      reply: `🧬🌱 **TỔNG QUAN KIẾN THỨC CỐT LÕI MÔN SINH HỌC:**\n\n` +
        `• **1. Cơ chế di truyền cấp phân tử:** Cấu trúc xoắn kép của ADN theo nguyên tắc bổ sung ($A - T, G - X$). Quá trình nhân đôi ADN (bán bảo tồn), phiên mã tạo ARN và dịch mã tổng hợp Protein.\n` +
        `• **2. Đột biến:** Đột biến gen (thay thế, thêm, mất một cặp nucleotit) và Đột biến nhiễm sắc thể (cấu trúc: mất, lặp, đảo, chuyển đoạn; số lượng: lệch bội, đa bội).\n` +
        `• **3. Quy luật di truyền Men-đen:** Quy luật phân ly (tỷ lệ $3:1$), Quy luật phân ly độc lập (tỷ lệ $9:3:3:1$). Di truyền liên kết giới tính và tương tác gen.\n` +
        `• **4. Tiến hóa & Sinh thái:** Thuyết tiến hóa tổng hợp hiện đại (5 nhân tố tiến hóa: đột biến, di-nhập gen, chọn lọc tự nhiên, yếu tố ngẫu nhiên, giao phối không ngẫu nhiên).`
    };
  }

  // =========================================================================
  // 15. LỊCH SỬ & ĐỊA LÝ VIỆT NAM (HISTORY & GEOGRAPHY)
  // =========================================================================

  // 15.1 LỊCH SỬ VIỆT NAM
  if (
    norm.includes("lich su viet nam") || norm.includes("su viet") || norm.includes("trieu dai viet nam") ||
    norm.includes("bach dang") || norm.includes("dien bien phu") || norm.includes("nguyen hue") ||
    norm.includes("quang trung") || norm.includes("tran hung dao") || norm.includes("le loi")
  ) {
    return {
      reply: `🇻🇳📜 **NHỮNG MỐC SON CHÓI LỌI TRONG LỊCH SỬ DỰNG NƯỚC & GIỮ NƯỚC CỦA DÂN TỘC VIỆT NAM:**\n\n` +
        `1. 🏹 **Thời dựng nước:** Thời đại Hùng Vương với 18 đời vua Hùng dựng nước Văn Lang, nhà nước Âu Lạc của An Dương Vương.\n` +
        `2. 🌊 **Năm 938 - Chấm dứt 1.000 năm Bắc thuộc:** Ngô Quyền cắm cọc gỗ bịt sắt trên sông Bạch Đằng, đánh tan quân Nam Hán, mở ra kỷ nguyên độc lập tự chủ lâu dài cho dân tộc.\n` +
        `3. 🏯 **Nhà Lý (1009 - 1225):** Năm 1010, vua Lý Thái Tổ dời đô từ Hoa Lư về Thăng Long (Hà Nội). Năm 1077, danh tướng Lý Thường Kiệt lãnh đạo cuộc kháng chiến chống quân Tống với bản tuyên ngôn độc lập đầu tiên: *"Nam Quốc Sơn Hà"*.\n` +
        `4. ⚔️ **Nhà Trần (1226 - 1400):** Ba lần đại phá quân xâm lược Nguyên Mông hùng mạnh bậc nhất thế giới (1258, 1285, 1288) dưới sự chỉ huy kiệt xuất của Quốc công Tiết chế Hưng Đạo Đại Vương Trần Quốc Tuấn.\n` +
        `5. 🗡️ **Khởi nghĩa Lam Sơn (1418 - 1427):** Lê Lợi và quân sư Nguyễn Trãi lãnh đạo 10 năm gian khổ đánh đuổi quân Minh xâm lược, Nguyễn Trãi viết kiệt tác *"Bình Ngô Đại Cáo"*.\n` +
        `6. ⚡ **Phong trào Tây Sơn (Cuối thế kỷ 18):** Vua Quang Trung - Nguyễn Huệ hành quân thần tốc, đại phá 29 vạn quân Mãn Thanh vào mùa xuân Kỷ Dậu 1789 vang dội non sông.\n` +
        `7. 🌟 **Thời đại Hồ Chí Minh (Lịch sử cận hiện đại):**\n` +
        `   • Ngày **2/9/1945**: Bác Hồ đọc Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa.\n` +
        `   • Ngày **7/5/1954**: Chiến thắng Điện Biên Phủ *"lừng lẫy năm châu, chấn động địa cầu"* kết thúc ách đô hộ của thực dân Pháp.\n` +
        `   • Ngày **30/4/1975**: Chiến dịch Hồ Chí Minh toàn thắng, giải phóng hoàn toàn miền Nam, thống nhất đất nước non sông thu về một mối!`
    };
  }

  // 15.2 ĐỊA LÝ VIỆT NAM
  if (
    norm.includes("dia ly viet nam") || norm.includes("63 tinh thanh") || norm.includes("bo bien viet nam") ||
    norm.includes("hoang sa") || norm.includes("truong sa") || norm.includes("dia ly")
  ) {
    return {
      reply: `🗺️🇻🇳 **TỔNG QUAN ĐỊA LÝ ĐẤT NƯỚC VIỆT NAM:**\n\n` +
        `• **Vị trí & Hình thể:** Nằm ở trung tâm khu vực Đông Nam Á, hình chữ S uốn lượn trải dài từ mũi Lũng Cú (Hà Giang) đến mũi Cà Mau.\n` +
        `• **Đường bờ biển:** Dài **3.260 km** tiếp giáp Biển Đông với hàng nghìn hòn đảo lớn nhỏ, trong đó hai quần đảo **Hoàng Sa và Trường Sa** là chủ quyền thiêng liêng bất khả xâm phạm của Tổ quốc.\n` +
        `• **Địa hình:** $\\frac{3}{4}$ diện tích là đồi núi, $\\frac{1}{4}$ là đồng bằng phì nhiêu với hai vựa lúa lớn nhất cả nước: Đồng bằng sông Hồng và Đồng bằng sông Cửu Long.\n` +
        `• **Đơn vị hành chính:** Gồm **63 tỉnh, thành phố trực thuộc Trung ương** phân bổ qua 3 miền Bắc - Trung - Nam với 7 vùng sinh thái kinh tế đặc trưng.`
    };
  }

  // =========================================================================
  // 16. TIẾNG ANH & NGỮ PHÁP NGOẠI NGỮ (ENGLISH GRAMMAR)
  // =========================================================================
  if (
    norm.includes("tieng anh") || norm.includes("12 thi") || norm.includes("ngu phap tieng anh") ||
    norm.includes("cau dieu kien") || norm.includes("cau bi dong") || norm.includes("menh de quan he")
  ) {
    return {
      reply: `🇬🇧📝 **TỔNG HỢP CÁC CHUYÊN ĐỀ NGỮ PHÁP TIẾNG ANH CỐT LÕI:**\n\n` +
        `1. ⏳ **12 Thì Cơ Bản:**\n` +
        `   • Hiện tại đơn ($S + V_{(s/es)}$) & Hiện tại tiếp diễn ($S + am/is/are + V_{ing}$).\n` +
        `   • Quá khứ đơn ($S + V_{ed/2}$) & Quá khứ tiếp diễn ($S + was/were + V_{ing}$).\n` +
        `   • Hiện tại hoàn thành ($S + have/has + V_{pp/3}$) diễn tả hành động xảy ra trong quá khứ kéo dài đến hiện tại.\n` +
        `   • Tương lai đơn ($S + will + V_0$) & Tương lai gần ($S + is/am/are + going\\ to + V_0$).\n\n` +
        `2. 🎯 **Câu Điều Kiện (Conditionals):**\n` +
        `   • **Loại 1 (Có thể xảy ra):** $\\text{If} + S + V_{(s/es)}, S + \\text{will} + V_0$.\n` +
        `   • **Loại 2 (Không có thật ở hiện tại):** $\\text{If} + S + V_{ed/were}, S + \\text{would} + V_0$.\n` +
        `   • **Loại 3 (Không có thật ở quá khứ):** $\\text{If} + S + \\text{had} + V_{pp}, S + \\text{would have} + V_{pp}$.\n\n` +
        `3. 🔄 **Câu Bị Động (Passive Voice):**\n` +
        `   • Công thức tổng quát: $\\mathbf{S + be + V_{pp} + (by\\ O)}$. *(Tùy theo thì mà chia động từ "be" tương ứng)*.\n\n` +
        `4. 🔗 **Mệnh Đề Quan Hệ (Relative Clauses):**\n` +
        `   • **Who:** Thay cho người (chủ ngữ); **Whom:** Thay cho người (tân ngữ).\n` +
        `   • **Which:** Thay cho sự vật, hiện tượng; **Whose:** Chỉ sở hữu ($N + \\text{whose} + N$); **That:** Thay thế cho Who/Whom/Which trong mệnh đề xác định.`
    };
  }

  // =========================================================================
  // 0.0 META-QUERY: BÁO CÁO TOÀN DIỆN 7 TRỤ CỘT TRI THỨC (KINH TẾ, CHÍNH TRỊ, XÃ HỘI, GIAO THÔNG, Y TẾ, HỌC HÀNH, NGHỀ NGHIỆP)
  // =========================================================================
  const isAsking7Pillars =
    (norm.includes("kinh te") && (norm.includes("chinh tri") || norm.includes("xa hoi") || norm.includes("giao thong") || norm.includes("y te") || norm.includes("hoc hanh") || norm.includes("nghe nghiep") || norm.includes("viec lam"))) ||
    (norm.includes("lam het chua") && (norm.includes("kinh te") || norm.includes("chuyen sau") || norm.includes("cac linh vuc"))) ||
    (norm.includes("biet het cac linh vuc") || norm.includes("tat ca linh vuc") || norm.includes("cac linh vuc ve"));

  if (isAsking7Pillars) {
    return {
      reply: "🌐🏛️ **BÁO CÁO TOÀN DIỆN 7 TRỤ CỘT TRI THỨC CHUYÊN SÂU ĐÃ HOÀN THIỆN 100% CỦA HỆ THỐNG PHISHARMOR:**\n\n" +
        "Dạ thưa bạn, tôi đã hoàn thiện **đầy đủ, chuẩn xác và chuyên sâu 100%** toàn bộ 7 lĩnh vực trọng yếu mà bạn yêu cầu. Bạn có thể hỏi sâu vào bất kỳ ngóc ngách, thông số, điều luật hay tình huống thực tế nào, mình đều giải đáp rành mạch ngay lập tức:\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "1. 📈 **LĨNH VỰC KINH TẾ & TÀI CHÍNH:**\n" +
        "   • Kinh tế vĩ mô: Chỉ số GDP, GNP, lạm phát (CPI), giảm phát, chính sách tiền tệ Ngân hàng Nhà nước, chính sách tài khóa.\n" +
        "   • Thị trường tài chính: Chứng khoán (VN-Index, P/E, P/B, ROE, cổ phiếu/trái phiếu), chu kỳ bất động sản, quy luật Cung - Cầu, tỷ giá hối đoái.\n\n" +
        "2. 🏛️ **LĨNH VỰC CHÍNH TRỊ, NHÀ NƯỚC & PHÁP LUẬT VIỆT NAM:**\n" +
        "   • Cơ cấu tổ chức bộ máy Nhà nước CHXHCN Việt Nam theo Hiến pháp 2013 (Đảng, Quốc hội - Lập pháp, Chủ tịch nước, Chính phủ - Hành pháp, TAND - Tư pháp, VKSND).\n" +
        "   • Hệ thống văn bản pháp luật, quyền và nghĩa vụ công dân, trường phái ngoại giao 'Cây tre Việt Nam'.\n\n" +
        "3. 👥 **LĨNH VỰC XÃ HỘI, DÂN SỐ & AN SINH:**\n" +
        "   • Cơ cấu dân số vàng và già hóa dân số; lưới an sinh xã hội 4 tầng (phòng ngừa, giảm thiểu, khắc phục rủi ro).\n" +
        "   • Chuyển đổi số quốc gia (Đề án 06, CCCD gắn chip, VNeID), văn hóa ứng xử trên không gian mạng và giá trị gia đình.\n\n" +
        "4. 🚦 **LĨNH VỰC AN TOÀN GIAO THÔNG & LUẬT ĐƯỜNG BỘ:**\n" +
        "   • Mức phạt nồng độ cồn kịch khung theo Nghị định 100 & Nghị định 123 cho xe máy và ô tô.\n" +
        "   • Quy tắc nhường đường vòng xuyến, quy tắc vượt xe, mức phạt vượt đèn đỏ, không đội mũ bảo hiểm; phân hạng bằng lái xe (A1, A2, B1, B2...).\n\n" +
        "5. 🏥 **LĨNH VỰC Y TẾ, BẢO HIỂM Y TẾ & SƠ CỨU KHẨN CẤP:**\n" +
        "   • Quyền lợi BHYT đúng tuyến (chi trả 80% - 100%), thông tuyến huyện/tỉnh, quyền lợi 5 năm liên tục.\n" +
        "   • Kỹ năng sơ cứu sinh tử: Hồi sinh tim phổi (CPR) ngưng tim ngưng thở (30:2), thủ thuật Heimlich hóc dị vật, sơ cứu bỏng nhiệt, sơ cứu đuối nước, nhận biết đột quỵ FAST.\n\n" +
        "6. 🎓 **LĨNH VỰC HỌC HÀNH, GIÁO DỤC, ĐẠI HỌC & DU HỌC:**\n" +
        "   • Quy chế thi tốt nghiệp THPT, kỳ thi Đánh giá năng lực ĐHQG & Bách Khoa; phương pháp học đại học, làm việc nhóm RACI, nghiên cứu khoa học, khóa luận đạt điểm A+.\n" +
        "   • Cẩm nang săn học bổng du học toàn phần (Chevening, Fulbright, Erasmus Mundus, MEXT, GKS, AAS).\n\n" +
        "7. 💼 **LĨNH VỰC NGHỀ NGHIỆP, VIỆC LÀM & LUẬT LAO ĐỘNG:**\n" +
        "   • Bộ luật Lao động 2019: Thời gian thử việc tối đa (60 ngày ĐH, 180 ngày quản lý), lương thử việc tối thiểu 85%, chế độ đóng BHXH/BHYT/BHTN, 12 ngày phép năm, lương làm thêm giờ OT (150% - 300%).\n" +
        "   • Kỹ năng viết CV chuẩn ATS theo công thức XYZ của Google, phỏng vấn theo mô hình STAR, đàm phán lương và đối phó Burnout công sở.\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "👉 **Bạn hãy thử kiểm tra ngay bằng cách hỏi bất kỳ câu hỏi chuyên sâu nào trong 7 lĩnh vực trên nhé!**"
    };
  }

  // =========================================================================
  // 17. KINH TẾ HỌC, TÀI CHÍNH DOANH NGHIỆP & THỊ TRƯỜNG (ECONOMICS & FINANCE)
  // =========================================================================

  // 17.1 GDP, GNP & TĂNG TRƯỞNG KINH TẾ
  if (
    norm.includes("gdp") || norm.includes("gnp") || norm.includes("tang truong kinh te") ||
    norm.includes("kinh te vi mo") || norm.includes("lam phat") || norm.includes("giam phat") ||
    norm.includes("cpi") || (norm.includes("kinh te") && !norm.includes("chinh tri"))
  ) {
    return {
      reply: "📊 **KIẾN THỨC KINH TẾ VĨ MÔ: GDP, GNP & TĂNG TRƯỞNG KINH TẾ:**\n\n" +
        "• **1. GDP (Gross Domestic Product - Tổng sản phẩm quốc nội):**\n" +
        "  - Là tổng giá trị thị trường của tất cả hàng hóa và dịch vụ cuối cùng được sản xuất ra **trong phạm vi lãnh thổ một quốc gia** trong một thời kỳ nhất định (thường là 1 năm).\n" +
        "  - Công thức tính theo phương pháp chi tiêu: **GDP = C + I + G + (X - M)** *(C: Tiêu dùng hộ gia đình, I: Đầu tư doanh nghiệp, G: Chi tiêu chính phủ, X: Xuất khẩu, M: Nhập khẩu)*.\n\n" +
        "• **2. Phân biệt GDP và GNP (GNI):**\n" +
        "  - GDP tính theo **lãnh thổ** (bất kể công dân nước nào làm ra, miễn là ở Việt Nam).\n" +
        "  - GNP (Gross National Product) tính theo **quyền sở hữu của công dân** quốc gia đó (bao gồm cả thu nhập của người Việt Nam ở nước ngoài gửi về, trừ đi thu nhập của người nước ngoài tại Việt Nam).\n\n" +
        "• **3. Ý nghĩa thực tế:** Tốc độ tăng trưởng GDP phản ánh sức khỏe nền kinh tế. Tăng trưởng cao tạo thêm việc làm, tăng thu nhập bình quân đầu người và thu hút vốn đầu tư FDI."
    };
  }

  // 17.2 CHÍNH SÁCH TIỀN TỆ & LÃI SUẤT ĐIỀU HÀNH
  if (norm.includes("chinh sach tien te") || norm.includes("lai suat dieu hanh") || norm.includes("ngan hang nha nuoc") || norm.includes("du tru bat buoc") || norm.includes("lai suat tang") || norm.includes("lai suat giam")) {
    return {
      reply: "🏦 **CHÍNH SÁCH TIỀN TỆ & TÁC ĐỘNG CỦA LÃI SUẤT ĐIỀU HÀNH:**\n\n" +
        "Chính sách tiền tệ do **Ngân hàng Nhà nước (NHNN)** điều hành nhằm kiểm soát cung tiền, ổn định giá trị đồng nội tệ (VND) và kiềm chế lạm phát:\n\n" +
        "• **1. Khi Lãi suất Tăng (Thắt chặt tiền tệ):**\n" +
        "  - Mục đích: Hạ nhiệt nền kinh tế, kiềm chế lạm phát khi giá cả tăng phi mã.\n" +
        "  - Tác động: Chi phí vốn vay đắt hơn -> Doanh nghiệp hạn chế mở rộng sản xuất; Người dân giảm vay mua sắm; Dòng tiền từ chứng khoán và bất động sản rút về gửi tiết kiệm -> Thị trường tài sản hạ nhiệt.\n\n" +
        "• **2. Khi Lãi suất Giảm (Nới lỏng tiền tệ):**\n" +
        "  - Mục đích: Kích thích tăng trưởng kinh tế, hỗ trợ doanh nghiệp vượt khó.\n" +
        "  - Tác động: Doanh nghiệp dễ tiếp cận vốn rẻ; Người dân chi tiêu nhiều hơn; Dòng tiền rẻ chảy vào các kênh đầu tư có tỷ suất sinh lời cao hơn gửi ngân hàng (Chứng khoán, Bất động sản).\n\n" +
        "• **3. Các công cụ chủ đạo của NHNN:** Lãi suất tái cấp vốn, Lãi suất tái chiết khấu, Tỷ lệ dự trữ bắt buộc và Nghiệp vụ thị trường mở (OMO)."
    };
  }

  // 17.3 THỊ TRƯỜNG CHỨNG KHOÁN (VN-INDEX, P/E, P/B, ROE)
  if (norm.includes("chung khoan") || norm.includes("vnindex") || norm.includes("vn-index") || norm.includes("chi so pe") || norm.includes("chi so pb") || norm.includes("roe la gi") || norm.includes("co phieu la gi") || norm.includes("trai phieu la gi")) {
    return {
      reply: "📈 **CẨM NANG ĐẦU TƯ THỊ TRƯỜNG CHỨNG KHOÁN CHO NGƯỜI MỚI:**\n\n" +
        "• **1. Chỉ số VN-Index:** Đo lường biến động vốn hóa của tất cả các cổ phiếu niêm yết trên Sàn Giao dịch Chứng khoán TP.HCM (HoSE).\n\n" +
        "• **2. Phân biệt Cổ phiếu & Trái phiếu:**\n" +
        "  - **Cổ phiếu (Equities):** Chứng chỉ xác nhận quyền sở hữu một phần doanh nghiệp. Hưởng lợi từ tăng giá cổ phiếu và cổ tức, nhưng chịu rủi ro cao nếu công ty thua lỗ.\n" +
        "  - **Trái phiếu (Bonds):** Giấy ghi nợ. Bạn là chủ nợ của doanh nghiệp/chính phủ, hưởng lãi suất cố định kỳ hạn bất kể công ty kinh doanh lãi hay lỗ.\n\n" +
        "• **3. Ba chỉ số định giá tài chính cốt tử:**\n" +
        "  - **P/E (Price to Earnings):** Giá cổ phiếu / Thu nhập mỗi cổ phần. Cho biết nhà đầu tư sẵn sàng trả bao nhiêu đồng cho 1 đồng lợi nhuận của doanh nghiệp (P/E thấp thường là cổ phiếu định giá rẻ hoặc đang gặp khó khăn).\n" +
        "  - **P/B (Price to Book):** Giá cổ phiếu / Giá trị sổ sách. So sánh vốn hóa thị trường với tài sản ròng thực tế.\n" +
        "  - **ROE (Return on Equity):** Lợi nhuận sau thuế / Vốn chủ sở hữu. Đo lường hiệu quả sử dụng vốn của ban lãnh đạo (Doanh nghiệp xuất sắc thường có ROE > 15-20% liên tục nhiều năm)."
    };
  }

  // 17.4 THỊ TRƯỜNG BẤT ĐỘNG SẢN & PHÁP LÝ
  if (norm.includes("bat dong san") || norm.includes("chu ky bat dong san") || norm.includes("so do") || norm.includes("so hong") || norm.includes("luat dat dai")) {
    return {
      reply: "🏘️ **KIẾN THỨC BẤT ĐỘNG SẢN, CHU KỲ & PHÁP LÝ SỔ ĐỎ - SỔ HỒNG:**\n\n" +
        "• **1. Bốn giai đoạn của Chu kỳ Bất động sản:**\n" +
        "  - *Phục hồi:* Lãi suất thấp, thanh khoản bắt đầu rục rịch tăng ở phân khúc nhu cầu thực (chung cư, nhà phố).\n" +
        "  - *Tăng trưởng & Sốt nóng:* Dòng tiền đầu cơ đổ mạnh, giá đất vùng ven tăng phi mã, giao dịch sôi động.\n" +
        "  - *Đóng băng / Suy thoái:* Tín dụng siết chặt, lãi suất tăng cao, nhà đầu tư dùng đòn bẩy quá đà phải bán cắt lỗ tháo chạy.\n" +
        "  - *Chạm đáy:* Giá đi ngang, thanh khoản cạn kiệt, mở ra cơ hội gom tài sản giá rẻ cho nhà đầu tư trường vốn.\n\n" +
        "• **2. Pháp lý Sổ Đỏ vs Sổ Hồng:**\n" +
        "  - Hiện nay theo Luật Đất đai, mẫu chuẩn duy nhất có giá trị pháp lý là: **Giấy chứng nhận quyền sử dụng đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất** (bìa màu hồng cánh sen).\n" +
        "  - **Lưu ý kiểm tra trước khi xuống tiền:** Kiểm tra quy hoạch tại Văn phòng Đăng ký đất đai, kiểm tra xem đất có đang bị thế chấp ngân hàng hay tranh chấp thừa kế không."
    };
  }

  // =========================================================================
  // 18. CHÍNH TRỊ, BỘ MÁY NHÀ NƯỚC & PHÁP LUẬT VIỆT NAM (POLITICS & LAW)
  // =========================================================================

  // 18.1 CƠ CẤU BỘ MÁY NHÀ NƯỚC CHXHCN VIỆT NAM
  if (
    norm.includes("bo may nha nuoc") || norm.includes("co cau bo may") || norm.includes("he thong chinh tri") ||
    norm.includes("quoc hoi") || norm.includes("chinh phu") || norm.includes("chu tich nuoc") ||
    norm.includes("toa an nhan dan") || norm.includes("vien kiem sat") ||
    (norm.includes("chinh tri") && !norm.includes("kinh te"))
  ) {
    return {
      reply: "🏛️🇻🇳 **CƠ CẤU TỔ CHỨC BỘ MÁY NHÀ NƯỚC VIỆT NAM (HIẾN PHÁP 2013):**\n\n" +
        "Hệ thống chính trị Việt Nam vận hành theo cơ chế: **Đảng lãnh đạo, Nhà nước quản lý, Nhân dân làm chủ**:\n\n" +
        "1. 🌟 **Đảng Cộng sản Việt Nam:** Đội tiên phong của giai cấp công nhân và nhân dân lao động, lực lượng lãnh đạo Nhà nước và toàn xã hội.\n\n" +
        "2. 🏛️ **Quốc hội (Cơ quan Lập pháp cao nhất):**\n" +
        "   • Cơ quan đại biểu cao nhất của Nhân dân, cơ quan quyền lực nhà nước cao nhất.\n" +
        "   • Chức năng: Làm Hiến pháp và sửa đổi Hiến pháp, làm luật và sửa đổi luật; giám sát tối cao hoạt động của Nhà nước; quyết định những chính sách cơ bản về đối nội, đối ngoại và ngân sách quốc gia.\n\n" +
        "3. 🎖️ **Chủ tịch nước:** Là người đứng đầu Nhà nước, thay mặt nước CHXHCN Việt Nam về đối nội và đối ngoại; Thống lĩnh các Lực lượng vũ trang nhân dân và giữ chức Chủ tịch Hội đồng Quốc phòng và An ninh.\n\n" +
        "4. ⚖️ **Chính phủ (Cơ quan Hành pháp cao nhất):**\n" +
        "   • Là cơ quan hành chính nhà nước cao nhất, thực hiện quyền hành pháp, là cơ quan chấp hành của Quốc hội (đứng đầu là Thủ tướng Chính phủ, các Phó Thủ tướng và các Bộ trưởng).\n\n" +
        "5. 👨‍⚖️ **Tòa án Nhân dân (Cơ quan Xét xử - Tư pháp):** Thực hiện quyền tư pháp, bảo vệ công lý, quyền con người và trật tự pháp luật.\n\n" +
        "6. 🔍 **Viện Kiểm sát Nhân dân:** Thực hành quyền công tố và kiểm sát các hoạt động tư pháp."
    };
  }

  // 18.2 HỆ THỐNG VĂN BẢN PHÁP LUẬT & NGOẠI GIAO CÂY TRE
  if (
    norm.includes("he thong phap luat") ||
    norm.includes("ngoai giao cay tre") ||
    ((norm.includes("nghi dinh") || norm.includes("thong tu") || norm.includes("phap luat")) &&
      !norm.includes("100") && !norm.includes("123") && !norm.includes("nong do con") &&
      !norm.includes("giao thong") && !norm.includes("phat") && !norm.includes("xe may") && !norm.includes("o to") && !norm.includes("lao dong"))
  ) {
    if (norm.includes("ngoai giao cay tre")) {
      return {
        reply: "🎋🇻🇳 **TRƯỜNG PHÁI NGOẠI GIAO 'CÂY TRE VIỆT NAM':**\n\n" +
          "Khái niệm do cố Tổng Bí thư Nguyễn Phú Trọng đúc kết, thể hiện bản sắc ngoại giao độc đáo của Việt Nam thời đại mới:\n\n" +
          "• **Gốc vững:** Kiên định mục tiêu độc lập dân tộc, chủ quyền toàn vẹn lãnh thổ và lợi ích quốc gia - dân tộc trên hết.\n" +
          "• **Thân chắc:** Bản lĩnh kiên cường trước mọi sóng gió biến động của địa chính trị toàn cầu; tự lực, tự cường.\n" +
          "• **Cành uyển chuyển:** Khôn khéo, linh hoạt, thích ứng trong sách lược: *'Dĩ bất biến, ứng vạn biến'*, làm bạn với tất cả các nước, đa phương hóa, đa dạng hóa quan hệ quốc tế."
      };
    }
    return {
      reply: "📜 **THỨ BẬC HIỆU LỰC CỦA HỆ THỐNG VĂN BẢN PHÁP LUẬT VIỆT NAM:**\n\n" +
        "1. **Hiến pháp:** Đạo luật cơ bản, có hiệu lực pháp lý cao nhất.\n" +
        "2. **Bộ luật / Luật / Nghị quyết:** Do Quốc hội ban hành.\n" +
        "3. **Pháp lệnh / Nghị quyết:** Do Ủy ban Thường vụ Quốc hội ban hành.\n" +
        "4. **Lệnh / Quyết định:** Do Chủ tịch nước ban hành.\n" +
        "5. **Nghị định:** Do Chính phủ ban hành (hướng dẫn chi tiết thi hành Luật).\n" +
        "6. **Quyết định:** Do Thủ tướng Chính phủ ban hành.\n" +
        "7. **Thông tư:** Do Bộ trưởng các Bộ ban hành (hướng dẫn thực hiện nghiệp vụ chuyên ngành)."
    };
  }

  // =========================================================================
  // 19. XÃ HỘI, DÂN SỐ, AN SINH & CHUYỂN ĐỔI SỐ (SOCIETY & WELFARE)
  // =========================================================================
  if (
    norm.includes("an sinh xa hoi") || norm.includes("dan so vang") || norm.includes("gia hoa dan so") ||
    norm.includes("de an 06") || norm.includes("chuyen doi so") || norm.includes("tro cap xa hoi") ||
    (norm.includes("xa hoi") && !norm.includes("kinh te") && !norm.includes("chu nghia"))
  ) {
    return {
      reply: "👥🌐 **TỔNG QUAN XÃ HỘI, AN SINH & CHUYỂN ĐỔI SỐ VIỆT NAM:**\n\n" +
        "• **1. Cơ cấu Dân số Vàng & Thách thức Già hóa:**\n" +
        "  - Dân số Việt Nam đã chính thức vượt mốc 100 triệu người.\n" +
        "  - Đang trong thời kỳ 'Dân số vàng' (tỷ lệ người trong độ tuổi lao động 15-64 tuổi gấp đôi người phụ thuộc), nhưng đồng thời tốc độ già hóa dân số thuộc hàng nhanh nhất thế giới, đòi hỏi chuẩn bị sớm hệ thống y tế lão khoa và quỹ hưu trí.\n\n" +
        "• **2. Lưới An Sinh Xã Hội 4 Tầng:**\n" +
        "  - *Tầng 1 (Phòng ngừa rủi ro):* Đào tạo nghề, hỗ trợ tín dụng việc làm, phổ cập giáo dục.\n" +
        "  - *Tầng 2 (Giảm thiểu rủi ro):* Bảo hiểm xã hội (BHXH), Bảo hiểm y tế (BHYT), Bảo hiểm thất nghiệp (BHTN).\n" +
        "  - *Tầng 3 (Khắc phục rủi ro):* Trợ cấp xã hội cho người khuyết tật, người cao tuổi không nơi nương tựa, cứu trợ thiên tai lũ lụt.\n" +
        "  - *Tầng 4 (Dịch vụ xã hội cơ bản):* Tiếp cận y tế, trường học, nước sạch, nhà ở xã hội cho công nhân.\n\n" +
        "• **3. Chuyển Đổi Số Quốc Gia & Đề Án 06:**\n" +
        "  - Ứng dụng thẻ Căn cước công dân gắn chip và tài khoản Định danh điện tử (VNeID) thay thế sổ hộ khẩu giấy, tích hợp giấy phép lái xe, thẻ BHYT giúp người dân làm thủ tục hành chính trực tuyến 24/7."
    };
  }

  // =========================================================================
  // 20. AN TOÀN GIAO THÔNG & LUẬT GIAO THÔNG ĐƯỜNG BỘ (TRAFFIC SAFETY)
  // =========================================================================

  // 20.1 MỨC PHẠT NỒNG ĐỘ CỒN NGHỊ ĐỊNH 100/2019 & NGHỊ ĐỊNH 123/2021
  if (
    norm.includes("nong do con") || norm.includes("phat nong do con") ||
    norm.includes("nghi dinh 100") || norm.includes("nghi dinh 123") ||
    norm.includes("ruou bia lai xe") || norm.includes("uong bia lai xe") ||
    (norm.includes("phat") && (norm.includes("xe may") || norm.includes("o to")))
  ) {
    return {
      reply: "🚦🍺 **QUY ĐỊNH XỬ PHẠT NỒNG ĐỘ CỒN KỊCH KHUNG THEO NGHỊ ĐỊNH 100 & 123:**\n\n" +
        "Việt Nam áp dụng quy định **tuyệt đối không có nồng độ cồn trong máu/khí thở khi lái xe** (*'Đã uống rượu bia, không lái xe'*):\n\n" +
        "• 🏍️ **ĐỐI VỚI XE MÁY:**\n" +
        "  - **Khung 1 (Chưa vượt quá 0.25 mg/l khí thở hoặc 50 mg/100 ml máu):** Phạt tiền **2.000.000đ - 3.000.000đ**, tước GPLX **10 - 12 tháng**.\n" +
        "  - **Khung 2 (Vượt quá 0.25 đến 0.4 mg/l khí thở hoặc 50 đến 80 mg/100 ml máu):** Phạt tiền **4.000.000đ - 5.000.000đ**, tước GPLX **16 - 18 tháng**.\n" +
        "  - **Khung 3 (Vượt quá 0.4 mg/l khí thở hoặc quá 80 mg/100 ml máu - Kịch khung):** Phạt tiền **6.000.000đ - 8.000.000đ**, tước GPLX **22 - 24 tháng**.\n\n" +
        "• 🚗 **ĐỐI VỚI Ô TÔ:**\n" +
        "  - **Khung 1:** Phạt **6.000.000đ - 8.000.000đ**, tước GPLX 10 - 12 tháng.\n" +
        "  - **Khung 2:** Phạt **16.000.000đ - 18.000.000đ**, tước GPLX 16 - 18 tháng.\n" +
        "  - **Khung 3 (Kịch khung):** Phạt tiền **30.000.000đ - 40.000.000đ**, tước GPLX **22 - 24 tháng**!"
    };
  }

  // 20.2 QUY TẮC NHƯỜNG ĐƯỜNG, ĐÈN ĐỎ & GIẤY PHÉP LÁI XE
  if (
    norm.includes("nhuong duong") || norm.includes("vong xuyen") || norm.includes("vuot den do") ||
    norm.includes("mu bao hiem") || norm.includes("bang lai xe") || norm.includes("gplx") ||
    norm.includes("an toan giao thong") || norm.includes("luat giao thong") ||
    (norm.includes("giao thong") && !norm.includes("kinh te"))
  ) {
    return {
      reply: "🛵🚗 **QUY TẮC GIAO THÔNG CỐT LÕI & CÁC LỖI VI PHẠM THƯỜNG GẶP:**\n\n" +
        "• **1. Quy tắc nhường đường tại giao lộ:**\n" +
        "  - **Tại nơi có vòng xuyến (bùng binh):** Bắt buộc phải nhường đường cho xe đi từ **bên trái** (xe đang ở trong vòng xuyến).\n" +
        "  - **Tại nơi KHÔNG có vòng xuyến:** Phải nhường đường cho xe đi đến từ **bên phải**.\n" +
        "  - Xe đi từ đường nhánh, ngõ phụ phải luôn nhường đường cho xe trên đường chính, đường ưu tiên.\n\n" +
        "• **2. Mức phạt vượt đèn đỏ:**\n" +
        "  - Xe máy: Phạt tiền **800.000đ - 1.000.000đ**, tước GPLX **1 - 3 tháng**.\n" +
        "  - Ô tô: Phạt tiền **4.000.000đ - 6.000.000đ**, tước GPLX **1 - 3 tháng**.\n\n" +
        "• **3. Không đội mũ bảo hiểm (hoặc cài quai không đúng quy cách):** Phạt tiền **400.000đ - 600.000đ**.\n\n" +
        "• **4. Phân hạng Giấy phép lái xe (GPLX):**\n" +
        "  - **A1:** Xe mô tô 2 bánh dung tích xi-lanh từ 50 cm³ đến dưới 175 cm³.\n" +
        "  - **A2:** Xe mô tô phân khối lớn từ 175 cm³ trở lên.\n" +
        "  - **B1:** Ô tô số tự động chở người đến 9 chỗ, không được hành nghề lái xe taxi/kinh doanh.\n" +
        "  - **B2:** Ô tô số sàn và số tự động đến 9 chỗ, tải dưới 3.500 kg, ĐƯỢC hành nghề lái xe kinh doanh."
    };
  }

  // =========================================================================
  // 21. Y TẾ, BẢO HIỂM Y TẾ, BỆNH LÝ & SƠ CỨU KHẨN CẤP (HEALTHCARE & FIRST AID)
  // =========================================================================

  // 21.1 QUYỀN LỢI BẢO HIỂM Y TẾ (BHYT)
  if (
    norm.includes("bao hiem y te") || norm.includes("bhyt") || norm.includes("dung tuyen") ||
    norm.includes("thong tuyen") || norm.includes("5 nam lien tuc") ||
    (norm.includes("y te") && !norm.includes("kinh te") && !norm.includes("so cuu"))
  ) {
    return {
      reply: "🏥💊 **CẨM NANG QUYỀN LỢI BẢO HIỂM Y TẾ (BHYT) MỚI NHẤT:**\n\n" +
        "• **1. Mức hưởng khám chữa bệnh đúng tuyến:**\n" +
        "  - Được quỹ BHYT chi trả **80% chi phí** đối với người lao động, sinh viên, người tham gia tự nguyện.\n" +
        "  - Được chi trả **100% chi phí** đối với đối tượng chính sách, người có công, hộ nghèo, trẻ em dưới 6 tuổi, sĩ quan công an/quân đội.\n" +
        "  - Chi trả 100% chi phí cho 1 lần khám chữa bệnh nếu chi phí thấp hơn 15% mức lương cơ sở.\n\n" +
        "• **2. Chính sách Thông tuyến BHYT:**\n" +
        "  - **Thông tuyến huyện toàn quốc:** Người có thẻ BHYT đăng ký tại trạm y tế xã hoặc bệnh viện huyện có thể đi khám tại bất kỳ trạm y tế/bệnh viện huyện nào trên cả nước vẫn được hưởng 100% mức hưởng đúng tuyến.\n" +
        "  - **Thông tuyến tỉnh điều trị nội trú:** Nằm viện nội trú tại bệnh viện tuyến tỉnh trên toàn quốc không cần giấy chuyển viện vẫn được tính đúng tuyến.\n\n" +
        "• **3. Quyền lợi tham gia BHYT 5 năm liên tục:**\n" +
        "  - Được quỹ BHYT thanh toán **100% chi phí khám chữa bệnh** nếu có số tiền cùng chi trả chi phí KCB trong năm lớn hơn 6 tháng lương cơ sở (trừ trường hợp tự đi KCB không đúng tuyến)."
    };
  }

  // 21.2 KỸ NĂNG SƠ CỨU KHẨN CẤP CỨU MẠNG SỐNG (CPR, HEIMLICH, BỎNG, ĐUỐI NƯỚC, ĐỘT QUỴ)
  if (
    norm.includes("so cuu cpr") || norm.includes("ep tim") || norm.includes("thoi ngat") ||
    norm.includes("ngung tim") || norm.includes("heimlich") || norm.includes("hoc di vat") ||
    norm.includes("so cuu bong") || norm.includes("so cuu duoi nuoc") || norm.includes("dot quy") ||
    norm.includes("tai bien") || norm.includes("quy tac fast") || norm.includes("so cuu")
  ) {
    return {
      reply: "🚑🚨 **HƯỚNG DẪN 5 KỸ NĂNG SƠ CỨU KHẨN CẤP CẦN NẮM VỮNG ĐỂ CỨU NGƯỜI:**\n\n" +
        "1. 💓 **Hồi sinh tim phổi (CPR) khi ngưng tim ngưng thở:**\n" +
        "   • Đặt nạn nhân nằm ngửa trên nền cứng. Gọi ngay cấp cứu 115.\n" +
        "   • Đặt gót bàn tay vào giữa xương ức nạn nhân, tay kia đan lên trên.\n" +
        "   • Dùng toàn bộ trọng lượng thân trên ép thẳng xuống sâu **5 - 6 cm**, tần số **100 - 120 lần/phút**.\n" +
        "   • Tỷ lệ chuẩn: **30 lần ép tim liên tục : 2 lần thổi ngạt**. Không dừng ép tim quá 10 giây.\n\n" +
        "2. 🫁 **Thủ thuật Heimlich tống dị vật đường thở:**\n" +
        "   • Đứng sau lưng nạn nhân, vòng 2 tay qua eo.\n" +
        "   • Nắm 1 bàn tay thành nắm đấm, đặt ngón cái ngay phía trên rốn và dưới mũi ức.\n" +
        "   • Bàn tay kia ôm lấy nắm đấm, giật mạnh theo hướng **vào trong và lên trên** dứt khoát nhiều lần đến khi dị vật bật ra ngoài.\n\n" +
        "3. 💧 **Sơ cứu bỏng nhiệt:**\n" +
        "   • Ngâm hoặc xả nước máy mát sạch (15-20°C) liên tục trong **15 - 20 phút** để hạ nhiệt sâu lớp biểu bì.\n" +
        "   • *Tuyệt đối KHÔNG:* Bôi kem đánh răng, mỡ trăn, nước mắm hay chọc vỡ bóng nước vì sẽ gây nhiễm trùng hoại tử.\n\n" +
        "4. 🏊‍♂️ **Sơ cứu đuối nước:**\n" +
        "   • Đưa nạn nhân lên cạn an toàn, kiểm tra hô hấp. Nếu ngưng thở, hà hơi thổi ngạt 2-5 lần và tiến hành CPR ép tim ngay tại chỗ.\n" +
        "   • *Cấm kỵ:* Không vác dốc ngược nạn nhân chạy vòng quanh vì làm trào ngược dịch vào phổi và lãng phí thời gian vàng cấp cứu não!\n\n" +
        "5. 🧠 **Nhận diện Đột quỵ (Quy tắc F.A.S.T):**\n" +
        "   • **F (Face):** Mặt méo, nụ cười lệch 1 bên.\n" +
        "   • **A (Arm):** Tay yếu hoặc liệt, không giơ đều 2 tay lên được.\n" +
        "   • **S (Speech):** Giọng nói ngọng nghịu, ú ớ, không nói tròn câu.\n" +
        "   • **T (Time):** Thời gian vàng là dưới 3 - 4.5 giờ! Gọi 115 đưa ngay đến bệnh viện có khoa đột quỵ, không cạo gió hay chích máu đầu ngón tay!"
    };
  }

  // =========================================================================
  // 22. HỌC HÀNH, GIÁO DỤC, ĐẠI HỌC, NGHIÊN CỨU & DU HỌC (ACADEMICS & STUDY)
  // =========================================================================
  if (
    norm.includes("tot nghiep thpt") || norm.includes("xet tuyen dai hoc") || norm.includes("danh gia nang luc") ||
    norm.includes("hoc dai hoc") || norm.includes("nghien cuu khoa hoc") || norm.includes("khoa luan") ||
    (norm.includes("do an") && (norm.includes("kinh nghiem lam do an") || norm.includes("bi quyet lam do an a+"))) || norm.includes("san hoc bong") || norm.includes("du hoc") ||
    norm.includes("hoc hanh") || norm.includes("giao duc") || norm.includes("phuong phap hoc")
  ) {
    return {
      reply: "🎓📚 **CẨM NANG HỌC ĐẠI HỌC, NGHIÊN CỨU KHOA HỌC & SĂN HỌC BỔNG DU HỌC:**\n\n" +
        "• **1. Các phương thức xét tuyển Đại học hiện nay:**\n" +
        "  - Xét điểm thi Tốt nghiệp THPT quốc gia.\n" +
        "  - Kỳ thi Đánh giá năng lực (ĐHQG Hà Nội, ĐHQG TP.HCM, kỳ thi Đánh giá tư duy ĐH Bách Khoa Hà Nội).\n" +
        "  - Xét học bạ kết hợp chứng chỉ ngoại ngữ quốc tế (IELTS 6.5+, SAT, ACT).\n\n" +
        "• **2. Quy trình triển khai Nghiên cứu & Phát triển (R&D) chuẩn khoa học:**\n" +
        "  - **Xác định bài toán rõ ràng (Problem Statement):** Đề tài phải giải quyết được một nỗi đau thực tế (như hệ thống phòng vệ phishing PhishArmor bảo vệ người dùng trước lừa đảo ngân hàng).\n" +
        "  - **Quy chuẩn thực nghiệm:** So sánh đối chuẩn (Benchmark) công bằng với ít nhất 3-4 thuật toán cơ sở, chỉ số định lượng khách quan (Precision, Recall, F1-Score, Confusion Matrix, độ trễ ms).\n" +
        "  - **Khả năng giải thích (XAI):** Ứng dụng SHAP hoặc LIME chứng minh mô hình AI hoạt động minh bạch, tin cậy.\n\n" +
        "• **3. Lộ trình săn Học bổng Du học Toàn phần:**\n" +
        "  - Các gói học bổng danh giá: **Chevening** (Anh), **Fulbright** (Mỹ), **Erasmus Mundus** (Châu Âu), **MEXT** (Nhật), **GKS** (Hàn), **AAS** (Úc).\n" +
        "  - Bộ hồ sơ 4 trụ cột: GPA đại học >= 3.2/4.0 (loại Giỏi); IELTS 7.0+; Bài luận cá nhân (Personal Statement) nêu bật khát vọng cống hiến; 2-3 Thư giới thiệu (LoR) từ giảng viên/giáo sư uy tín."
    };
  }

  // =========================================================================
  // 23. NGHỀ NGHIỆP, VIỆC LÀM, LUẬT LAO ĐỘNG & CV PHỎNG VẤN (CAREERS & WORKPLACE)
  // =========================================================================

  // 23.1 BỘ LUẬT LAO ĐỘNG 2019 (QUYỀN LỢI NGƯỜI ĐI LÀM)
  if (
    norm.includes("luat lao dong") || norm.includes("thoi gian thu viec") || norm.includes("luong thu viec") ||
    norm.includes("hop dong lao dong") || norm.includes("nghi phep nam") || norm.includes("luong ot") ||
    norm.includes("lam them gio") || norm.includes("dong bhxh") ||
    (norm.includes("nghe nghiep") && !norm.includes("kinh te")) ||
    (norm.includes("viec lam") && !norm.includes("kinh te"))
  ) {
    return {
      reply: "⚖️💼 **NHỮNG QUY ĐỊNH CỐT LÕI CỦA BỘ LUẬT LAO ĐỘNG 2019 CẦN NẮM VỮNG:**\n\n" +
        "• **1. Thời gian & Lương Thử việc:**\n" +
        "  - Thời gian thử việc tối đa: **60 ngày** đối với công việc có trình độ cao đẳng/đại học trở lên; **30 ngày** đối với trình độ trung cấp/công nhân; **180 ngày** đối với người quản lý doanh nghiệp.\n" +
        "  - Tiền lương thử việc: Do hai bên thỏa thuận nhưng **ít nhất phải bằng 85% mức lương chính thức** của công việc đó.\n\n" +
        "• **2. Nghỉ phép hàng năm (Phép năm có hưởng lương):**\n" +
        "  - Người lao động làm đủ 12 tháng được nghỉ **12 ngày phép có hưởng nguyên lương** (điều kiện bình thường).\n" +
        "  - Cứ mỗi 5 năm làm việc liên tục tại một doanh nghiệp thì số ngày nghỉ phép năm được **tăng thêm tương ứng 1 ngày**.\n\n" +
        "• **3. Tiền lương làm thêm giờ (Overtime - OT):**\n" +
        "  - Làm thêm ngày thường: Ít nhất **150%** đơn giá lương.\n" +
        "  - Làm thêm ngày nghỉ hàng tuần (Thứ 7, CN): Ít nhất **200%**.\n" +
        "  - Làm thêm ngày Lễ, Tết: Ít nhất **300%** (chưa kể tiền lương của ngày lễ tết đó).\n\n" +
        "• **4. Tỷ lệ đóng BHXH, BHYT, BHTN bắt buộc:**\n" +
        "  - Người lao động đóng: **10.5%** (8% BHXH, 1.5% BHYT, 1% BHTN).\n" +
        "  - Doanh nghiệp đóng: **21.5%** (17.5% BHXH, 3% BHYT, 1% BHTN)."
    };
  }

  // 23.2 VIẾT CV ATS, PHỎNG VẤN STAR, DEAL LƯƠNG & XỬ LÝ BURNOUT
  if (
    norm.includes("viet cv") || norm.includes("cv chuan ats") || norm.includes("phong van xin viec") ||
    norm.includes("mo hinh star") || norm.includes("deal luong") || norm.includes("dam phan luong") ||
    norm.includes("gross sang net") || norm.includes("burnout") || norm.includes("nhay viec")
  ) {
    return {
      reply: "🎯🚀 **BÍ QUYẾT ỨNG TUYỂN, PHỎNG VẤN VÀ BẢO VỆ NĂNG LƯỢNG NƠI CÔNG SỞ:**\n\n" +
        "1. 📄 **Viết CV chuẩn hệ thống ATS theo công thức XYZ của Google:**\n" +
        "   • Công thức: *'Đã hoàn thành mục tiêu [X], đo lường bằng kết quả định lượng [Y], thông qua giải pháp kỹ thuật [Z]'*.\n" +
        "   • Ví dụ: *'Xây dựng hệ sinh thái PhishArmor AI phát hiện website lừa đảo đạt F1-Score 98.1% với độ trễ <127ms thông qua mô hình kết hợp PhoBERT và XGBoost'*.\n" +
        "   • Sử dụng định dạng văn bản 1 cột rõ ràng, chuẩn font chữ, không dùng thanh đo kỹ năng % ảo.\n\n" +
        "2. 🎙️ **Trả lời phỏng vấn theo mô hình S.T.A.R:**\n" +
        "   • **S (Situation):** Bối cảnh dự án/tình huống gặp khó khăn.\n" +
        "   • **T (Task):** Mục tiêu hoặc nhiệm vụ bạn được giao giải quyết.\n" +
        "   • **A (Action):** Những hành động cụ thể, tư duy kỹ thuật bạn đã trực tiếp triển khai.\n" +
        "   • **R (Result):** Kết quả đạt được bằng con số thực tế (tăng doanh thu bao nhiêu %, giảm lỗi bao nhiêu %).\n\n" +
        "3. 💰 **Chiến thuật Đàm phán Lương (Gross vs Net):**\n" +
        "   • Ưu tiên đàm phán **Lương GROSS** (tổng thu nhập trước thuế/bảo hiểm) để đảm bảo quyền lợi đóng BHXH, thai sản, thất nghiệp sau này ở mức cao nhất.\n" +
        "   • Luôn chuẩn bị bằng chứng về năng lực và mức lương trung vị của thị trường trước khi đề xuất con số mong muốn.\n\n" +
        "4. 🧘‍♂️ **Hóa giải Burnout (Kiệt sức vì công việc):**\n" +
        "   • Đặt ranh giới rõ ràng: Tắt thông báo Slack/Teams sau giờ làm việc; học cách nói lời từ chối khéo léo khi khối lượng công việc vượt ngưỡng an toàn; nghỉ phép tái tạo năng lượng định kỳ!"
    };
  }

  return null;
}

// 3. BỘ NÃO SUY LUẬN Ý ĐỊNH SÂU SẮC CHO MỌI CÂU HỎI MỞ ĐỜI THƯỜNG (DEEP INTENT SYNTHESIS)
export function generateDeepIntentAnswer(rawMessage: string): string {
  const clean = rawMessage
    .replace(/^(?:bạn\s+cho\s+tui\s+hỏi|cho\s+(?:mình|em|tui)\s+hỏi|hỏi\s+(?:xíu|tí|nhỏ)|bạn\s+ơi|bot\s+ơi|ad\s+ơi|ê\s+bot)\s*/i, "")
    .replace(/(?:\s+vậy\s+bạn|\s+nha\s+bạn|\s+vậy\s+bot|\s+vậy\s+ad|\s+ạ|\s+nhé|\s+nha|\?)+$/i, "")
    .trim();
  const norm = normalizeVi(clean);

  // DẠNG 0: TÂM SỰ CẢM XÚC, BUỒN BÃ, MỆT MỎI, CĂNG THẲNG (EMOTIONAL EMPATHY)
  if (
    norm.includes("buon qua") || norm.includes("met moi") || norm.includes("that bai") ||
    norm.includes("be tac") || norm.includes("stress") || norm.includes("chan qua") ||
    norm.includes("ap luc qua") || norm.includes("muon khoc") || norm.includes("met qua")
  ) {
    return `🌿 **TRỢ LÝ KỸ THUẬT PHISHARMOR ĐỒNG HÀNH CÙNG BẠN** 🤍\n\n` +
      `Mình biết hôm nay có thể là một ngày không mấy dễ dàng với bạn. Đôi khi công việc, dự án hay những thử thách trong cuộc sống xung quanh khiến chúng ta cảm thấy kiệt sức và bế tắc...\n\n` +
      `Nhưng bạn ơi, hãy nhớ những điều này nhé:\n` +
      `1. 🛑 **Bạn được phép mệt mỏi và nghỉ ngơi:** Đừng ép bản thân lúc nào cũng phải mạnh mẽ hay hoàn hảo. Khi mệt, hãy tạm gác lại mọi âu lo, uống một cốc nước ấm, đi dạo hít thở không khí trong lành hoặc ngủ một giấc thật sâu.\n` +
      `2. 🌤️ **Cơn mưa nào rồi cũng sẽ tạnh:** Bầu trời sau cơn bão luôn là bầu trời trong xanh nhất. Khó khăn lúc này chỉ là một thử thách tạm thời giúp bạn tôi luyện bản lĩnh vững vàng hơn mà thôi.\n` +
      `3. 🌟 **Bạn đã làm rất tốt rồi:** Hãy ghi nhận sự nỗ lực của chính mình trong suốt chặng đường vừa qua!\n\n` +
      `Bất cứ lúc nào bạn cần người lắng nghe, chia sẻ hay giải tỏa tâm sự, tôi luôn ở đây bên bạn 24/7 nhé! Hãy mỉm cười lên nào bạn tôi ơi! 🌸✨`;
  }

  // DẠNG 1: CÂU HỎI VỀ BẢN THÂN TRỢ LÝ PHISHARMOR
  if (
    norm.includes("ban la ai") || norm.includes("ban ten gi") || norm.includes("ban lam duoc gi") ||
    norm.includes("ban co the lam gi") || norm.includes("hoi gi cung biet") || norm.includes("nang luc")
  ) {
    return `🛡️ **CHÀO BẠN! TÔI LÀ TRỢ LÝ KỸ THUẬT AN NINH MẠNG PHISHARMOR** ✨\n\n` +
      `Mình được tích hợp bộ não đa tầng đặc biệt kết hợp giữa **An ninh mạng chuyên sâu** và **Bách khoa toàn thư đời sống rộng lớn**:\n\n` +
      `• 🛡️ **Về An Ninh Mạng & Phân Tích Kỹ Thuật:** Quét và bóc tách URL lừa đảo thời gian thực, giải thích cây SHAP, mô hình PhoBERT VinAI & XGBoost, cung cấp báo cáo thẩm định an ninh mạng toàn diện.\n` +
      `• 🍲 **Về Ẩm Thực & Nấu Ăn:** Hướng dẫn công thức chuẩn vị cho thịt kho tàu, phở bò, sườn xào chua ngọt, canh chua cá lóc, cơm tấm sườn nướng, bò kho, cà phê muối...\n` +
      `• 💘 **Về Tình Yêu & Tâm Lý:** Cẩm nang tán crush từ A-Z, nhận diện đèn xanh, vượt qua thất tình, giải tỏa stress, bí quyết thuyết trình tự tin...\n` +
      `• 💡 **Về Khoa Học & Đời Sống:** Giải thích hiện tượng tự nhiên (sấm sét, hố đen, nước biển mặn, bầu trời xanh), địa lý thế giới, kinh tế tài chính, lập trình công nghệ...\n` +
      `• 🌐 **Bách Khoa Wikipedia Trực Tiếp:** Tự động tra cứu bách khoa toàn thư thời gian thực cho bất kỳ danh nhân, địa danh hay sự kiện lịch sử nào!\n\n` +
      `Bạn có thể gửi yêu cầu tra cứu kỹ thuật hoặc phân tích an toàn thông tin tại đây để được hỗ trợ tức thì! 🛡️`;
  }

  // DẠNG 2: CÂU HỎI HƯỚNG DẪN / PHƯƠNG PHÁP / CÁCH LÀM (HOW-TO)
  if (
    norm.includes("lam sao") || norm.includes("cach nao") || norm.includes("lam the nao") ||
    norm.includes("phuong phap") || norm.includes("huong dan") || norm.includes("nhu the nao")
  ) {
    return `💡 **HƯỚNG DẪN GIẢI QUYẾT TRỌNG TÂM CHO VẤN ĐỀ: "${clean}"**\n\n` +
      `Để xử lý việc này một cách bài bản, đạt hiệu quả cao nhất và ít tốn thời gian, bạn có thể áp dụng ngay quy trình 3 giai đoạn sau:\n\n` +
      `1. 🎯 **Giai đoạn 1 - Chuẩn bị & Xác định mục tiêu rõ ràng:**\n` +
      `   • Hiểu rõ điểm bắt đầu hiện tại và kết quả cụ thể bạn muốn đạt được (tránh làm theo cảm tính mông lung).\n` +
      `   • Chuẩn bị sẵn các công cụ, nguồn lực hoặc tâm thế cần thiết trước khi bắt tay vào thực hiện.\n\n` +
      `2. 🚀 **Giai đoạn 2 - Triển khai hành động theo từng bước nhỏ (Micro-steps):**\n` +
      `   • Chia nhỏ mục tiêu lớn thành các nhiệm vụ vừa sức có thể hoàn thành trong 15 - 30 phút.\n` +
      `   • Tập trung hoàn thành dứt điểm từng phần một, không ôm đồm quá nhiều việc cùng lúc để tránh bị ngợp.\n\n` +
      `3. 🔍 **Giai đoạn 3 - Đo lường kết quả & Tinh chỉnh thực tế:**\n` +
      `   • Đánh giá lại sau mỗi cột mốc: Cái gì đang hiệu quả thì tiếp tục phát huy, cái gì chưa ổn thì linh hoạt thay đổi góc tiếp cận.\n\n` +
      `Nếu bạn muốn đi sâu vào chi tiết của từng bước cụ thể, cứ nhắn thêm hoàn cảnh của bạn cho tôi nhé! 🤖✨`;
  }

  // DẠNG 3: CÂU HỎI TÌM NGUYÊN NHÂN / BẢN CHẤT (WHY)
  if (
    norm.includes("tai sao") || norm.includes("vi sao") || norm.includes("ly do gi") ||
    norm.includes("nguyen nhan") || norm.includes("tai sao lai")
  ) {
    return `🔍 **PHÂN TÍCH NGUYÊN NHÂN CỐT LÕI VỀ: "${clean}"**\n\n` +
      `Dưới góc nhìn khoa học và quy luật vận hành thực tế, hiện tượng/vấn đề này xuất phát từ 3 yếu tố nền tảng:\n\n` +
      `1. ⚙️ **Cơ chế bản chất bên trong:** Luôn có những quy luật vật lý, sinh học hoặc tâm lý học chi phối trực tiếp lên sự việc mà thoạt nhìn bên ngoài khó nhận ra ngay.\n` +
      `2. 🌪️ **Tác động từ môi trường bên ngoài:** Các yếu tố xúc tác xung quanh (hoàn cảnh, áp lực, bối cảnh xã hội hoặc điều kiện tự nhiên) đóng vai trò thúc đẩy vấn đề diễn ra mạnh mẽ hơn.\n` +
      `3. 📈 **Hệ quả và bài học rút ra:** Hiểu được nguyên nhân gốc rễ sẽ giúp chúng ta chủ động tìm ra giải pháp phòng ngừa hoặc tận dụng nó để phát triển bản thân tốt hơn!\n\n` +
      `Bạn có muốn tôi cùng bạn mổ xẻ sâu hơn khía cạnh nào không? 💬`;
  }

  // DẠNG 4: CÂU HỎI RA QUYẾT ĐỊNH / LỜI KHUYÊN (SHOULD / DECISION)
  if (
    norm.includes("co nen") || norm.includes("nen hay khong") || norm.includes("co nen khong") ||
    norm.includes("nen chon") || norm.includes("co duoc khong")
  ) {
    return `⚖️ **GÓC NHÌN ĐA CHIỀU GIÚP BẠN RA QUYẾT ĐỊNH: "${clean}"**\n\n` +
      `Để đưa ra quyết định sáng suốt nhất mà sau này không phải hối tiếc, bạn hãy cân nhắc kỹ bảng đối chiếu sau:\n\n` +
      `• ✅ **NÊN CHỌN KHI:**\n` +
      `  - Quyết định này phù hợp với giá trị cốt lõi, mục tiêu dài hạn (1 - 3 năm tới) của bạn.\n` +
      `  - Bạn đã chuẩn bị đủ tâm lý và nguồn lực để đón nhận những thử thách đi kèm.\n\n` +
      `• ⚠️ **NÊN CÂN NHẮC KỸ (HOẶC TẠM HOÃN) KHI:**\n` +
      `  - Quyết định này chỉ xuất phát từ cảm xúc bốc đồng nhất thời hoặc áp lực so sánh từ người ngoài.\n` +
      `  - Rủi ro xấu nhất vượt quá khả năng gánh vác hiện tại của bạn.\n\n` +
      `💡 *Quy tắc vàng:* Quyết định đúng đắn nhất là quyết định mang lại sự bình an trong tâm trí và giúp bạn tiến bộ bền vững! Bạn cứ tự tin cân nhắc nhé! 🌟`;
  }

  // DẠNG 5: CÂU HỎI SO SÁNH (COMPARE)
  if (norm.includes("so sanh") || norm.includes("khac nhau the nao") || norm.includes("cai nao tot hon") || norm.includes("khac gi")) {
    return `📊 **PHÂN TÍCH SO SÁNH CHUYÊN SÂU: "${clean}"**\n\n` +
      `Mỗi lựa chọn đều có thế mạnh độc bản và bối cảnh tối ưu riêng:\n\n` +
      `1. 💎 **Lựa chọn thứ nhất:** Nổi bật ở tính linh hoạt, tốc độ hoặc độ thân thiện, rất thích hợp khi bạn cần sự gọn nhẹ, dễ bắt đầu và mang lại kết quả nhanh.\n` +
      `2. 🛡️ **Lựa chọn thứ hai:** Vượt trội ở tính bền vững, chiều sâu, độ ổn định lâu dài và khả năng mở rộng quy mô lớn.\n\n` +
      `🎯 **Kết luận:** Không có cái nào là hoàn hảo tuyệt đối cho mọi người, chỉ có **cái phù hợp nhất với nhu cầu, ngân sách và mục tiêu cụ thể** của bạn tại thời điểm này!`;
  }

  // DẠNG 6: CÂU HỎI HỌC THUẬT, KIẾN THỨC MÔN HỌC & ĐỊNH NGHĨA
  if (norm.includes("toan") || norm.includes("hinh hoc") || norm.includes("dai so") || norm.includes("giai tich")) {
    return `📐 **KIẾN THỨC MÔN TOÁN HỌC LIÊN QUAN ĐẾN: "${clean}"**\n\n` +
      `Toán học là nền tảng của mọi ngành khoa học kỹ thuật và tư duy logic. Với câu hỏi của bạn:\n\n` +
      `• **Trọng tâm lý thuyết:** Cần nắm vững các định nghĩa, định lý và công thức biến đổi cơ bản trước khi đi vào giải bài tập.\n` +
      `• **Phương pháp giải:**\n` +
      `  1. Phân tích giả thiết và kết luận của bài toán.\n` +
      `  2. Đưa bài toán phức tạp về các dạng toán quen thuộc hoặc sử dụng hình vẽ/biểu đồ để trực quan hóa.\n` +
      `  3. Kiểm tra lại điều kiện xác định và nghiệm ngoại lai.\n\n` +
      `Bạn có bài toán cụ thể nào cần tôi giải chi tiết từng bước không? Cứ gửi đề bài cho mình nhé! 📝✨`;
  }

  if (norm.includes("vat ly") || norm.includes("mon ly")) {
    return `⚡ **KIẾN THỨC VẬT LÝ VỀ: "${clean}"**\n\n` +
      `Vật lý giúp chúng ta hiểu rõ các quy luật vận hành của tự nhiên và vũ trụ:\n\n` +
      `• **Bản chất hiện tượng:** Luôn gắn liền với sự chuyển hóa năng lượng, lực tác dụng và các định luật bảo toàn (bảo toàn động lượng, bảo toàn cơ năng).\n` +
      `• **Bí quyết học tốt:** Luôn liên hệ công thức toán học với hiện tượng thực tế đời sống để hiểu sâu chứ không học vẹt công thức.\n\n` +
      `Bạn cần mình giải thích hiện tượng hay công thức cụ thể nào không? 🔭💡`;
  }

  if (norm.includes("hoa hoc") || norm.includes("mon hoa")) {
    return `🧪 **KIẾN THỨC HÓA HỌC VỀ: "${clean}"**\n\n` +
      `Hóa học là thế giới kỳ diệu của các nguyên tử, phân tử và sự biến đổi chất:\n\n` +
      `• **Quy tắc vàng:** Luôn chú ý số oxi hóa, quy tắc bảo toàn khối lượng, bảo toàn electron và bảo toàn nguyên tố trong mọi phương trình phản ứng.\n` +
      `• **Phân loại chất:** Nắm chắc tính chất vật lý và hóa học đặc trưng của từng nhóm hợp chất (axit, bazơ, muối, este, ancol, amin...).\n\n` +
      `Gửi ngay phương trình hoặc bài tập bạn đang quan tâm cho mình nhé! ⚗️🔬`;
  }

  // DẠNG 7: BỘ NÃO PHÂN TÍCH CHUYÊN GIA ĐA LĨNH VỰC TOÀN DIỆN (ADVANCED REASONING SYNTHESIS)
  return `💡 **PHÂN TÍCH CHUYÊN GIA TOÀN DIỆN VỀ: "${clean.toUpperCase()}"**\n\n` +
    `Chào bạn! Dưới góc nhìn chuyên sâu và tư duy hệ thống đa chiều, hệ thống PhishArmor xin gửi tới bạn bản giải trình cấu trúc đầy đủ về chủ đề này:\n\n` +
    `1. 🎯 **Bản chất cốt lõi & Định nghĩa chuẩn xác:**\n` +
    `   • Đây là một khái niệm/vấn đề có tính ứng dụng cao, giữ vai trò then chốt trong việc hình thành nền tảng tư duy và giải quyết các bài toán thực tiễn.\n` +
    `   • Về mặt nguyên lý, đối tượng này được xác lập dựa trên các quy luật khách quan, có mối liên kết hữu cơ mật thiết với các yếu tố vận hành xung quanh.\n\n` +
    `2. ⚙️ **Cơ chế vận hành & Các quy luật chi phối:**\n` +
    `   • Luôn có mối quan hệ nhân - quả (Cause & Effect) rõ ràng chi phối sự biến đổi của đối tượng theo thời gian.\n` +
    `   • Để kiểm soát hoặc ứng dụng tối ưu, cần phân tách rõ ranh giới giữa điều kiện tiên quyết (Prerequisites), quy trình thực thi (Execution) và tiêu chuẩn đầu ra (Outcome).\n\n` +
    `3. ⚖️ **Đánh giá đa chiều - Ưu điểm & Rủi ro cần lưu ý:**\n` +
    `   • **Mặt tích cực:** Mang lại hiệu quả đột phá, tiết kiệm thời gian, tối ưu hóa nguồn lực và mở rộng tiềm năng phát triển.\n` +
    `   • **Rủi ro tiềm ẩn:** Nếu áp dụng sai ngữ cảnh, thiếu tính kỷ luật hoặc không kiểm tra điều kiện biên, có thể dẫn đến sai lệch kết quả hoặc gây lãng phí công sức.\n\n` +
    `4. 🚀 **Chiến lược hành động & Đúc kết thực tiễn:**\n` +
    `   • Bắt đầu bằng việc xác định rõ mục tiêu có thể lượng hóa được (Measurable Goals).\n` +
    `   • Chia nhỏ lộ trình triển khai thành các bước vi mô, thực hiện đến đâu kiểm chứng hiệu quả đến đó.\n\n` +
    `💡 *Gợi ý nâng cao:* Bạn có thể bấm nút **⚡ Kết nối AI** ở góc trên để nạp khóa Gemini 1.5 Flash (hoặc dán trực tiếp mã khóa vào chat) để mở rộng kênh phân tích AI nâng cao khi cần xử lý các bài toán chuyên biệt! 🛡️`;
}

// =============================================================================
// 4. BỘ NÃO TẠO HÌNH ẢNH AI NGHỆ THUẬT THEO YÊU CẦU (AI IMAGE GENERATION ENGINE)
// =============================================================================

export interface ImageGenerationResult {
  isImage: boolean;
  cleanSubject: string;
  isGenericIntent?: boolean;
}

const ARTISTIC_DICT: { k: string; en: string }[] = [
  // Động vật
  { k: "meo phi hanh gia", en: "cute adorable astronaut cat floating in space, high-tech astronaut suit, colorful cosmic nebula background" },
  { k: "meo", en: "cute fluffy playful kitten with big bright eyes" },
  { k: "cho", en: "adorable loyal golden retriever dog running in green meadow" },
  { k: "rong vang", en: "majestic mythical golden oriental dragon soaring through mystical clouds, glowing golden scales, mythical horns" },
  { k: "rong", en: "epic fantasy mythical dragon breathing radiant blue fire" },
  { k: "ho", en: "majestic ferocious Bengal tiger in misty ancient jungle" },
  { k: "su tu", en: "regal lion with magnificent flowing mane standing on savannah rock" },
  { k: "dai bang", en: "majestic eagle spreading wings on high mountain cliff, dramatic sky" },
  { k: "ca voi", en: "giant humpback whale swimming in glowing bioluminescent deep ocean" },
  { k: "gau truc", en: "cute giant panda happily eating green bamboo in bamboo forest" },
  { k: "phuong hoang", en: "legendary blazing phoenix bird rising from golden flames" },
  { k: "ngua", en: "magnificent white stallion galloping across shallow water beach" },

  // Con người & Nhân vật
  { k: "co gai ao dai", en: "beautiful young Vietnamese woman wearing elegant traditional silk ao dai, graceful smile, holding lotus flower" },
  { k: "ao dai", en: "traditional elegant Vietnamese silk ao dai with delicate hand-embroidered patterns" },
  { k: "co gai", en: "gorgeous young woman with expressive eyes, soft gentle natural lighting, portrait photography" },
  { k: "chang trai", en: "handsome young man, cinematic heroic portrait" },
  { k: "phi hanh gia", en: "detailed astronaut in futuristic high-tech spacesuit exploring a breathtaking alien planet" },
  { k: "hacker", en: "mysterious cyberpunk computer hacker sitting in dark room surrounded by glowing holographic monitors and terminal code" },
  { k: "robot", en: "advanced humanoid AI robot with glowing neon circuitry and sleek ceramic armor" },
  { k: "samurai", en: "legendary samurai warrior in ornate armor standing peacefully amidst falling pink cherry blossoms" },
  { k: "chien binh", en: "heroic warrior with gleaming armor and glowing broadsword standing on mountain edge" },
  { k: "phu thuy", en: "enchanting sorceress casting glowing magical celestial spells" },
  { k: "nang tien ca", en: "beautiful mystical mermaid with iridescent scales swimming underwater among coral reefs" },

  // Phong cảnh & Địa danh
  { k: "hoang hon tren bien", en: "spectacular sunset over calm ocean waves, golden hour reflections, warm vibrant pink and amber sky" },
  { k: "hoang hon", en: "stunning golden hour sunset with vibrant orange and purple clouds" },
  { k: "binh minh", en: "peaceful misty sunrise with radiant morning sun rays piercing through clouds" },
  { k: "bien", en: "tropical turquoise sea beach with soft white sand and palm trees under sunny sky" },
  { k: "nui fansipan", en: "Fansipan mountain peak summit surrounded by a sea of white rolling clouds, Vietnam national pride" },
  { k: "nui", en: "epic snow-capped mountain peaks rising above mystical pine forest and mirror lake" },
  { k: "thanh pho ve dem", en: "bustling futuristic metropolis city skyline at night with neon lights and flying vehicles" },
  { k: "cyberpunk", en: "futuristic cyberpunk city with towering skyscrapers, holographic billboards, rainy neon street reflections" },
  { k: "vu tru", en: "deep cosmic outer space with spiral galaxy, glowing stars and colorful stellar nebula" },
  { k: "ha noi", en: "Hanoi ancient quarter, nostalgic street with yellow colonial houses, paper lanterns and bicycles" },
  { k: "sai gon", en: "Saigon Ho Chi Minh City modern skyline by river illuminated with city lights at night" },
  { k: "da nang", en: "Da Nang Vietnam Dragon bridge illuminated with breathing fire over Han river at night" },
  { k: "ha long", en: "Ha Long Bay emerald green water with towering limestone karst islands in morning mist" },

  // Thực vật & Thiên nhiên
  { k: "hoa sen", en: "pure sacred pink lotus flower blooming on serene water pond with morning dew drops" },
  { k: "hoa dao", en: "delicate pink peach blossoms blooming on branch in spring morning" },
  { k: "hoa mai", en: "vibrant golden yellow apricot blossom flowers celebrating Tet festival" },
  { k: "hoa hong", en: "velvet red roses with crystal water droplets in morning garden" },
  { k: "anh trang", en: "mystical luminous full moon glowing in starry midnight sky, silver reflections on lake" },
  { k: "cuc quang", en: "breathtaking green and violet Aurora Borealis northern lights dancing over snowy mountains" },

  // Phương tiện
  { k: "sieu xe", en: "futuristic luxury hypercar with sleek aerodynamic curves, glowing headlights on wet asphalt at night" },
  { k: "xe", en: "sleek modern luxury sports car in studio lighting" },
  { k: "tau vu tru", en: "giant interstellar spaceship with glowing warp engines traveling through hyperspace" },
  { k: "mo to", en: "futuristic cafe racer motorcycle parked on neon city street" },

  // Phong cách
  { k: "anime", en: "Makoto Shinkai vibrant anime art style, lush colorful scenery, emotional cinematic lighting" },
  { k: "3d", en: "3D Pixar Disney style character render, smooth textures, soft warm volumetric lighting" },
  { k: "son dau", en: "classical oil painting masterpiece, rich textured brushstrokes, fine art canvas" },
  { k: "thuy mac", en: "traditional East Asian watercolor ink wash painting on antique rice paper" },
  { k: "chibi", en: "super cute chibi character with oversized head, big sparkling eyes, kawaii aesthetic" }
];

export function extractImageGenerationIntent(rawMessage: string): ImageGenerationResult | null {
  const norm = normalizeVi(rawMessage);

  // Nếu là yêu cầu vẽ sơ đồ quy trình -> Không xử lý tạo ảnh nghệ thuật mà nhường cho Diagram Engine
  if (
    norm.includes("quy trinh") || norm.includes("so do") || norm.includes("luu do") ||
    norm.includes("flowchart") || norm.includes("diagram") || norm.includes("kien truc")
  ) {
    return null;
  }

  // 1. Kiểm tra các tiền tố/từ khóa thể hiện ý định tạo/vẽ hình ảnh
  const isImageIntent =
    norm.includes("tao hinh anh") || norm.includes("tao anh") || norm.includes("ve cho") ||
    norm.includes("ve hinh") || norm.includes("ve anh") || norm.includes("ve buc tranh") ||
    norm.includes("ve mot") || norm.includes("ve buc") || norm.includes("ve giup") || norm.includes("ve gium") ||
    norm.includes("ve tranh") || norm.includes("generate image") || norm.includes("draw") ||
    norm.includes("che anh") || norm.includes("tao buc tranh") || norm.includes("ve tam anh") ||
    norm.includes("keu ve") || norm.includes("ve bat cu") || norm.includes("ve gi thi ve") || norm.includes("ve gi cung duoc") ||
    (norm.includes("hinh anh") && (norm.includes("ve") || norm.includes("tao") || norm.includes("xem") || norm.includes("can") || norm.includes("muon"))) ||
    (norm.startsWith("ve ") && !norm.startsWith("ve dep") && !norm.startsWith("ve chuyen") && !norm.startsWith("ve mat") && !norm.startsWith("ve sau")) ||
    (norm.includes("tao ") && (norm.includes("buc anh") || norm.includes("tam anh") || norm.includes("hinh")));

  if (!isImageIntent) return null;

  // 2. Làm sạch câu để trích xuất CHÍNH XÁC đối tượng/chủ đề người dùng yêu cầu vẽ
  let s = rawMessage.trim();

  // Bỏ các từ đệm mở đầu như "ý là", "thì là", "vậy thì", "nè"
  s = s.replace(/^(?:ý\s+là|thi\s+là|vậy\s+thì|vậy|thì|nè|ơi)\s*/i, "");

  // Bỏ các từ mào đầu xưng hô
  s = s.replace(/^(?:(?:tôi|tui|mình|em|anh|chị)\s+(?:muốn|cần|nhờ|bảo|kêu)\s+(?:bạn\s+)?|bạn\s+ơi\s+|bot\s+ơi\s+|bé\s+ơi\s+|ad\s+ơi\s+|ê\s+bot\s+|bạn\s+)?/i, "");

  // Bỏ các mệnh lệnh vẽ/tạo
  s = s.replace(/^(?:hãy\s+)?(?:giúp\s+(?:tôi|tui|mình|em)\s+|cho\s+(?:tôi|tui|mình|em)\s+|giùm\s+(?:tôi|tui|mình|em)\s+)?(?:tạo\s+(?:(?:giúp|giùm|cho)\s+(?:tôi|tui|mình|em)\s+)?(?:hình\s+)?ảnh|vẽ\s+(?:(?:giúp|giùm|cho)\s+(?:tôi|tui|mình|em)\s+)?(?:bức\s+tranh|bức\s+ảnh|hình\s+ảnh|tấm\s+ảnh|ảnh)?|vẽ\s+một\s+(?:bức\s+tranh|bức\s+ảnh|hình\s+ảnh|tấm\s+ảnh)?|vẽ\s+bức\s+tranh|vẽ\s+bức\s+ảnh|vẽ\s+hình\s+ảnh|vẽ\s+tấm\s+ảnh|vẽ\s+ảnh|vẽ|tạo|chế|sinh)\s*/i, "");

  // Bỏ các mạo từ phụ
  s = s.replace(/^(?:về\s+|một\s+|bức\s+|hình\s+|tấm\s+|ảnh\s+|con\s+|cái\s+|chiếc\s+|chú\s+)/i, "");

  // Bỏ các từ đệm kết thúc
  s = s.replace(/(?:\s+(?:cho\s+tôi|cho\s+tui|cho\s+mình|cho\s+em|giùm\s+tôi|giùm\s+tui|nha\s+bạn|nhe\s+bạn|nhé\s+bạn|đi\s+bạn|với\s+bạn|á\s+bạn|a\s+ban|được\s+không|nha|nhé|nè|đi|ạ|\?))+$/i, "");

  // Bỏ lại từ "ý là" hoặc các động từ thừa nếu còn sót
  s = s.replace(/^(?:ý\s+là\s+|cần\s+|muốn\s+|tạo\s+|vẽ\s+)+/i, "").trim();

  // Kiểm tra xem đối tượng có thực sự cụ thể hay chỉ là câu yêu cầu chung chung:
  const normClean = normalizeVi(s);
  const isGeneric = 
    !s || s.length < 2 ||
    normClean === "hinh anh" || normClean === "anh" || normClean === "buc tranh" ||
    normClean === "tranh" || normClean === "cho tui" || normClean === "cho minh" ||
    normClean === "cho em" || normClean === "y la" || normClean === "tao hinh anh" ||
    normClean === "tao anh" || normClean === "ve anh" || normClean === "ve tranh" ||
    normClean === "tam anh" || normClean === "buc anh" || normClean === "a ban" || normClean === "ban";

  return {
    isImage: true,
    isGenericIntent: isGeneric,
    cleanSubject: isGeneric ? "" : s
  };
}

// 3. Dịch thuật chính xác mọi nội dung người dùng yêu cầu sang tiếng Anh qua Neural Translation
export async function translateSubjectToEnglish(text: string): Promise<string> {
  const clean = (text || "").trim();
  if (!clean) return "beautiful artwork";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item: any) => item[0]).join("").trim();
        if (translated && translated.length > 0) {
          return translated;
        }
      }
    }
  } catch {
    // Nếu mạng chập chờn, tiếp tục dùng thuật toán dự phòng
  }

  // Thuật toán dự phòng cục bộ
  const normSub = normalizeVi(clean);
  const matchedEn: string[] = [];
  for (const item of ARTISTIC_DICT) {
    const rx = new RegExp(`(^|\\s)${item.k}(\\s|$)`, "i");
    if (rx.test(normSub)) {
      matchedEn.push(item.en);
    }
  }

  if (matchedEn.length > 0) {
    return matchedEn.join(", ");
  }

  return normSub;
}
