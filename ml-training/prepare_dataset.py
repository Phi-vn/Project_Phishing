import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'Data')

print("=== BẮT ĐẦU GỘP TOÀN BỘ DỮ LIỆU ĐANG CÓ ===")

bad_urls = set()

# 1. Quét sạch toàn bộ PhishTank
pt_path = os.path.join(DATA_DIR, 'phishing_raw.csv')
if os.path.exists(pt_path):
    print("1. Đang vét sạch PhishTank...")
    df_pt = pd.read_csv(pt_path)
    df_pt = df_pt[(df_pt['verified'] == 'yes') & (df_pt['online'] == 'yes')]
    pt_links = df_pt['url'].dropna().unique()
    bad_urls.update(pt_links)
    print(f"   -> Thu được {len(pt_links)} URL từ PhishTank.")

# 2. Quét sạch toàn bộ link độc hại từ Kaggle (phishing, malware, defacement)
kg_path = os.path.join(DATA_DIR, 'malicious_phish.csv')
if os.path.exists(kg_path):
    print("2. Đang vét sạch Kaggle (phishing, malware, defacement)...")
    df_kg = pd.read_csv(kg_path)
    kg_bad = df_kg[df_kg['type'].isin(['phishing', 'malware', 'defacement'])]['url'].dropna().unique()
    bad_urls.update(kg_bad)
    print(f"   -> Tổng số link độc hại thu thập được: {len(bad_urls)}")

# Chuyển thành DataFrame Nhãn 1
df_bad = pd.DataFrame({'url': list(bad_urls), 'label': 1})
total_bad = len(df_bad)
print(f"=> ĐÃ LẤY HẾT: {total_bad} URL ĐỘC HẠI (Nhãn 1).")

# 3. Lấy số lượng link an toàn bằng đúng số link độc hại để cân bằng 1:1
print("\n3. Đang lấy link an toàn tương ứng từ Kaggle...")
kg_benign = df_kg[df_kg['type'] == 'benign']['url'].dropna().unique()
benign_urls = list(kg_benign)[:total_bad]
df_benign = pd.DataFrame({'url': benign_urls, 'label': 0})
print(f"=> ĐÃ LẤY ĐỦ: {len(df_benign)} URL AN TOÀN (Nhãn 0).")

# 4. Ghép nối và xáo trộn toàn bộ
print("\n4. Đang ghép và xáo trộn toàn bộ...")
final_df = pd.concat([df_bad, df_benign], ignore_index=True)
final_df = final_df.sample(frac=1, random_state=42).reset_index(drop=True)

out_file = os.path.join(DATA_DIR, 'dataset_full_580k.csv')
final_df.to_csv(out_file, index=False)
print(f"\n HOÀN TẤT VÉT SẠCH DỮ LIỆU!")
print(f"File lưu tại: {out_file} (Tổng cộng: {len(final_df)} dòng)")