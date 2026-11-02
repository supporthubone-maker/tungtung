# 🪷 An Nhiên Temple V4 – Web chùa 3D có nhiều người

**Three.js + Vite + Supabase Realtime**, phát triển từ **An Nhiên Temple V3.1 (nền chánh điện vàng son)**.

## Chạy thử

```bash
npm install
npm run dev
```

Mở địa chỉ Vite (thường `http://localhost:5173`). Nếu chưa có cấu hình Supabase, các hoạt động vẫn chạy trên **một trình duyệt**, còn online/chat chỉ hiển thị chế độ offline.

## Triển khai lên Vercel / GitHub riêng

- Chép các file trong thư mục `sansa-temple-3d` vào **root repo GitHub hiện tại**; nên sao lưu commit cũ trước.
- Cấu hình Vercel: Framework **Vite**, Build `npm run build`, Output `dist`.
- Environment Variables: `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (hoặc `VITE_SUPABASE_PUBLISHABLE_KEY`). **Chỉ dùng publishable / anon key**, không dùng service_role / secret key.
- Redeploy sau khi thêm env. Mở cùng URL `?room=main-hall` trên hai máy và **bấm Vào chánh điện ở cả hai**.
- Nếu cần lưu cấp độ/pháp danh lên Supabase: bật Anonymous Sign-Ins rồi chạy `supabase_v4.sql` bằng SQL Editor.

**[Xem hướng dẫn đầy đủ](HUONG_DAN_V4.md)**: quy tắc cấp độ, các bước SQL, kiểm thử 2 người, lưu ý an toàn.

## Tính năng

- Hiện online theo phòng + avatar/tên/hoạt động người khác; gửi chuyển động bằng Broadcast và thành viên bằng Presence.
- Chat realtime trong phòng, tin mới hiện trên nhân vật, **không lưu tin cũ**.
- Cấp 0 khi bắt đầu; mỗi hoạt động hoàn thành cộng 1 lượt. Lên cấp tại 5, 15, 30, 50...; tặng pháp danh *ảo trong game* ở 30 lượt.
- 6 hoạt động: thắp hương, quỳ lễ Phật, dâng hoa sen, ngồi xếp bằng niệm Phật với chuỗi 108 hạt, lắc xin xăm, treo dây đỏ tại 2 cây đa.
- Ánh sáng tự động sáng/trưa/chiều/tối, chọn chibi nam/nữ mặc đồ lam, 15 bồ đoàn, camera xoay, giao diện responsive.
- Nền chánh điện V3.1 có nút trở lại nền V3 gốc.

### Giới hạn bản demo

Đây là **source code prototype**, không phải hệ thống multiplayer đã kiểm định tải thực tế. Đồng bộ giữa máy chỉ vận hành sau khi Supabase được kết nối và kiểm thử. Remote avatar dùng dáng chuyển động gần đúng, chưa đồng bộ toàn bộ skeleton. Điểm thưởng có hạn mức server nhưng chưa có xác minh hoạt động thật chống gian lận tuyệt đối. Chat công khai chưa có kiểm duyệt và giới hạn chống spam phía server. **Không nên triển khai cho cộng đồng lớn khi chưa bổ sung lớp quản trị, bảo mật và giám sát.**
