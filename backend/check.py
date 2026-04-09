import google.generativeai as genai

# Dán API Key của Linh vào đây
genai.configure(api_key="AIzaSyCkNE_KPI23vJrTuAshMFcaeSbvBPN6QgA")

print("--- DANH SÁCH MODEL BẠN ĐƯỢC DÙNG ---")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"Tên chuẩn: {m.name}")