# AN NHIÊN TEMPLE V3.1 — NỀN CHÁNH ĐIỆN VÀNG SON

## Mục tiêu

Chuyển bố cục không gian chánh điện hiện có sang phong cách vàng son / đỏ trầm lấy cảm hứng từ bố cục **Chùa Linh Ứng Online — TikTok Live Temple RPC** (https://github.com/zane-tv/tiktok-live-temple-rpc), nhưng **tiếp tục chạy Vite + Three.js + Supabase trên repository GitHub riêng**.

Không chuyển sang Bun, TikTok Live, ZeroTTS, JSON-RPC hay OBS. Không sử dụng ảnh nền, mã nguồn, sprite, âm thanh hoặc nội dung có bản quyền từ repository tham khảo. Các chi tiết 3D mới do module `src/sanctuary.js` dựng bằng hình học Three.js.

## Thay đổi từ V3 gốc

- `src/sanctuary.js`: **file mới** dựng sàn thảm hoa sen, chánh điện đỏ–vàng, vách trang trí, hào quang nhiều vòng, đèn bên bàn thờ và hạt sáng.
- `src/main.js`: import, gắn thêm 3D layer và đổi camera mặc định để nhìn rõ bố cục phía trước.
- Menu bên trái có `Chánh điện` với hai lựa chọn: **Vàng son · Hoa sen** (mặc định) và **An Nhiên V3** (tắt lớp nền mới). Như vậy có thể so sánh mà không mất nền cũ.
- **Giữ nguyên**: nhân vật 3D, 4 hoạt động, 15 đệm, chọn giới tính, số lạy / số biến, thời điểm trong ngày, nhãn tên, thanh trạng thái, nhật ký, kết nối Supabase Realtime.

## Cập nhật lên repo GitHub đang dùng (không dùng repo zane-tv)

1. **Sao lưu nhánh hiện tại:** tạo branch `backup/an-nhien-v3` hoặc tải ZIP repo của bé.
2. Tải ZIP phiên bản mới, giải nén và mở thư mục `sansa-temple-3d`.
3. Nếu repo của bé đã cùng cấu trúc V3 trong file ZIP gốc, chỉ cần copy 2 file sau:
   - `src/sanctuary.js` (mới)
   - `src/main.js` (đã chỉnh)
   Còn lại giữ nguyên. Nếu muốn thay toàn bộ bằng phiên bản mới thì copy toàn bộ nội dung thư mục `sansa-temple-3d`, **không copy thêm một tầng thư mục**.
4. Tại thư mục chứa `package.json` chạy:

   ```bash
   npm install
   npm run dev
   ```

5. Thử chọn **Chánh điện → Vàng son · Hoa sen**, quay cảnh, thử đủ bốn hoạt động, kiểm tra giao diện điện thoại.
6. Push thay đổi lên **repo của bé**:

   ```bash
   git add .
   git commit -m "Revamp sanctuary backdrop in golden lotus style"
   git push
   ```

7. Vercel liên kết repo bé sẽ tự động build nếu đã bật deployment. Build command `npm run build`, output directory `dist`.

## Cấu hình Realtime

Giữ nguyên 2 biến môi trường Vercel đang có:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Nếu chưa cấu hình, chạy ở chế độ một người. Không upload file `.env` chứa khóa thật, không dùng Supabase `service_role` hoặc `secret key` phía client.

## Chỉnh chi tiết không gian

- **Tượng Phật, lư hương, đệm, cây và động tác nhân vật:** tiếp tục ở `src/main.js`.
- **Nền vách điện, hào quang, thảm, đèn, trang trí:** chỉnh ở `src/sanctuary.js`.
- **Menu hoạt động, giao diện điện thoại:** `src/style.css`.
- **Nút chọn kiểu chánh điện:** cấu hình `#scenestyle` trong `src/main.js`.

## Những phần chưa thay

- Tượng Phật vẫn là model hình học đơn giản V3, **chưa phải model GLB chi tiết** hay tượng photorealistic.
- Không dùng ảnh gốc `amitabha_stage.png`: ảnh của repo tham khảo là **một hình 2D**, không thể dùng làm toàn bộ nền Three.js rồi tự động khớp tọa độ nhân vật.
- Tương tác nhiều người giữ giới hạn hiện tại của Presence: không có khóa giao dịch đệm ngồi hay đồng bộ skeleton hoàn chỉnh.
- Hiệu ứng chuông, mõ, ánh sáng hào quang mới chỉ ở phần trang trí. Không thêm bộ máy TikTok RPC.

## Kiểm thử

- `node --check src/main.js` và `node --check src/sanctuary.js` đã chạy thành công khi đóng gói.
- Chưa chạy được `npm install` / kiểm thử trực quan trong môi trường đóng gói vì không có Internet để tải dependencies. Cần thử `npm run dev` trên máy bé trước khi push Production.
