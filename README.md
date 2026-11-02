# Thiền Viện An Nhiên 3D — V3.1 (Nền Chánh Điện Vàng Son)

**Đã bổ sung bối cảnh chánh điện đỏ–vàng, hào quang và thảm hoa sen bằng Three.js, có nút chuyển về nền V3 gốc.** Xem hướng dẫn `HUONG_DAN_NEN_CHANH_DIEN.md` để nâng cấp repo đang dùng.

# Thiền Viện An Nhiên 3D — V3

V3 phát triển từ chính source V2. Vite + Three.js; Supabase Realtime **tùy chọn**.

## Chạy local

```bash
npm install
npm run dev
```

Mở địa chỉ Vite thông báo (thường `http://localhost:5173`).

## Deploy từ GitHub lên Vercel

1. Sao lưu source V2 nếu cần. Giải nén ZIP V3.
2. **Copy nội dung của thư mục `sansa-temple-3d/` vào thư mục gốc repository hiện có**, ghi đè file trùng tên, giữ đúng thư mục `src/`.
3. Commit & push. Vercel tự deploy nếu kết nối branch Production.
4. Vercel Project > Deployments > kiểm tra build `Ready`.

Vite: Build `npm run build`; Output `dist`; Root `./` nếu `package.json` nằm ở root.

## Cho người khác vào *cùng một gian* (Supabase Realtime)

**Bắt buộc cấu hình** nếu cần hai trình duyệt nhìn thấy nhau. Không cần database SQL cho bản presence demo.

1. Tạo Supabase project riêng, vào **Project Settings > API / Data API** (tên mục có thể thay đổi).
2. Lấy **Project URL** và **anon / publishable key** (key dùng trên browser). **TUYỆT ĐỐI không dùng `service_role` / secret key**.
3. Vercel > Project > Settings > Environment Variables, tạo:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Redeploy để Vite nhúng cấu hình lúc build.
5. Mở cùng URL web trên hai máy / trình duyệt. Mọi người chọn tên, avatar rồi bấm **Vào chánh điện**.
6. `?room=main-hall` là gian mặc định. Có thể dùng `?room=other-room` để tách gian, tuy nhiên demo hiện chia sẻ cảnh y hệt nhau.
7. Nếu WebSocket báo lỗi, kiểm tra Supabase Realtime đang được bật cho project và kiểm tra DevTools Console / Network.

## Giới hạn kỹ thuật V3

- Model chibi **dựng bằng primitive**, không phải rig GLB/skinned mesh chuyên nghiệp. Tư thế xếp bằng và quỳ hiện là giải pháp chuyển hình học, chưa đạt mocap tự nhiên.
- Nhân vật khách khác được hiển thị dưới dạng **avatar 3D nhẹ**, có vị trí, tên và hoạt động; không đồng bộ đầy đủ skeleton động tác. Realtime đồng bộ ~4 lần/giây bằng Presence, không tối ưu khi phòng rất đông.
- Chiếm đệm: phát hiện đệm đã dùng bằng Presence, **không phải khóa giao dịch tập trung**. Hai người bấm cùng lúc có thể trùng chỗ. Cần backend RPC/DB hoặc server phòng có quyền điều phối trước khi chạy production.
- Âm thanh cần thao tác người dùng để bật; browser có thể chặn autoplay.
- Tự động sáng / trưa / chiều / tối theo **giờ thiết bị của từng người**, các thiết bị khác múi giờ có thể nhìn ánh sáng khác.
- V3 chưa có hệ thống tài khoản, chống spam, phân quyền, kiểm duyệt tên người dùng hay lưu lịch sử phòng. Không phù hợp vận hành công khai diện rộng ngay.

## Tính năng
- 15 bồ đoàn oval bo tròn, 3 hàng × 5.
- Chọn chibi nữ tóc búi hoặc chibi nam tóc ngắn; cả hai mặc đồ lam.
- Tên trên đầu, màn hình nhập tên.
- Tư thế xếp bằng / quỳ phân biệt, lễ hương và sen ở vị trí giữa hai tay (chuyển động procedural).
- Sáng / trưa / chiều / tối tự động theo giờ hoặc chỉnh thủ công.
- Phòng Realtime Presence tùy chọn: người dùng khác nhìn thấy tên, vị trí, trạng thái cơ bản.
