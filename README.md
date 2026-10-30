# Thiền Viện An Nhiên 3D — V2

Prototype Three.js + Vite chạy độc lập. V2 tăng chi tiết chibi và chuyển động theo state machine: đi vào, xoay về Phật, chuẩn bị, thực hiện, đứng lên và đi ra. Không sử dụng GLB có rig hoặc multiplayer.

## Chạy local

```bash
npm install
npm run dev
```

## Build và triển khai Vercel

```bash
npm run build
```

- Framework: Vite
- Root directory: `./`
- Build command: `npm run build`
- Output directory: `dist`

Cập nhật GitHub repository đã gắn Vercel: thay các file trong repo bằng nội dung zip này, commit. Vercel sẽ tự deploy nếu bật auto-deployment.

## Những điểm mới V2

- Hướng mặt và di chuyển đúng chiều; quỳ/ngồi hướng bàn thờ.
- Chuyển động tư thế mượt hơn, có chuẩn bị/quỳ/cúi/đứng lại.
- Mặt chibi có thêm tóc mái, chân mày, điểm sáng mắt và nụ cười.
- Nhang/hoa được biểu diễn trong cảnh sau khi dâng.

## Giới hạn

Mô hình và chuyển động vẫn là mesh + joint dựng procedural bằng code, không phải file GLB rig chuyên nghiệp. Chưa có điều khiển bằng animation clip hoặc đồng bộ nhiều người. Không thể đảm bảo mọi thiết bị chạy mượt khi chưa kiểm thử trình duyệt thực tế.
