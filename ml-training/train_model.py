import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

# Thiết lập đường dẫn thư mục
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'Data', 'dataset_features.csv')
BACKEND_DIR = os.path.join(BASE_DIR, '..', 'backend')
MODEL_OUTPUT = os.path.join(BACKEND_DIR, 'phishing_model.pkl')

print("1. Đang nạp dữ liệu đặc trưng...")
df = pd.read_csv(DATA_FILE)

# Tách biến đầu vào X (các đặc trưng) và nhãn mục tiêu y (0 hoặc 1)
X = df.drop(columns=['label'])
y = df['label']

# Chia tập dữ liệu: 80% để học (Train), 20% để kiểm tra độc lập (Test)
print("2. Đang phân chia tập Train / Test (80/20)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"-> Số mẫu huấn luyện (Train): {len(X_train)}")
print(f"-> Số mẫu kiểm thử (Test): {len(X_test)}")

# Khởi tạo mô hình Random Forest
print("\n3. Đang huấn luyện mô hình Random Forest (mất khoảng 10 - 20 giây)...")
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1  # Tận dụng toàn bộ nhân CPU của máy tính
)
model.fit(X_train, y_train)

# Đánh giá chất lượng mô hình trên tập Test
print("\n4. Kết quả đánh giá mô hình trên tập Test:")
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"==> ĐỘ CHÍNH XÁC (ACCURACY): {acc * 100:.2f}%\n")

print("Báo cáo chi tiết (Classification Report):")
print(classification_report(y_test, y_pred, target_names=['An toàn (0)', 'Lừa đảo (1)'], digits=4))

print("Ma trận nhầm lẫn (Confusion Matrix):")
print(confusion_matrix(y_test, y_pred))

# Xuất mô hình đã huấn luyện sang thư mục backend
os.makedirs(BACKEND_DIR, exist_ok=True)
joblib.dump(model, MODEL_OUTPUT)
print(f"\n ĐÃ XUẤT THÀNH CÔNG FILE MODEL: {MODEL_OUTPUT}")