import re

with open('app/history/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make it use useEffect to fetch
if "useEffect" not in content:
    content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';")

state_code = """export default function HistoryPage() {

  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("Tất cả");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8000/history');
        const data = await res.json();
        
        const formattedLogs = data.map(item => {
          const date = new Date(item.timestamp);
          const timeStr = date.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'}) + ' - ' + date.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
          
          let level = "An toàn";
          if (item.label === "Lừa đảo" || item.is_phishing) level = "Độc hại";
          else if (item.confidence > 50 && item.confidence < 80) level = "Đáng ngờ";
          
          return {
            domain: item.domain,
            ip: "—", 
            type: item.note || "—",
            level: level,
            time: timeStr
          };
        });
        setLogs(formattedLogs);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => {"""

content = re.sub(r'export default function HistoryPage\(\) \{.*?const filteredLogs = initialLogs\.filter\(log => \{', state_code, content, flags=re.DOTALL)

with open('app/history/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
