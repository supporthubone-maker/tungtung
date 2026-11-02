# An Nhiên Temple V4 – hướng dẫn cập nhật từ V3.1

## 1. Những gì được bổ sung

- Supabase Realtime Presence: đếm người có kết nối cùng phòng; một tab vào phòng tính là một phiên.
- Supabase Realtime Broadcast: vị trí/hoạt động của avatar, tin nhắn và hành động treo dây đỏ theo thời gian thực; có giới hạn tần suất gửi.
- Mỗi avatar khách có mô hình chibi đơn giản, tên/cấp độ và dáng ngồi/quỳ gần đúng; **chưa đồng bộ trọn bộ skeleton/mocap** như chibi chính.
- Menu hoạt động: thắp hương, lễ Phật, dâng hoa, niệm Phật (ngồi xếp bằng và chuỗi 108 hạt), lắc quẻ xin xăm, buộc dây đỏ cầu duyên.
- Cây đa hai bên chánh điện bằng mô hình 3D, sẵn dây đỏ. Khi khách treo dây, người đang có mặt cùng phòng sẽ thấy dây mới; dây của khách không được lưu vĩnh viễn qua lần tải lại.
- Cấp 0 khi mới vào. 1 lượt được cộng khi **đã thực hiện và trở về sau một hoạt động**, không tính hủy. Lượt tính theo hoạt động chứ không theo số lần lạy/niệm. Cấp 1: 5 lượt; cấp 2: 15; cấp 3: 30; cấp 4: 50; cấp 5: 80; cấp 6: 120; cấp 7: 170; cấp 8: 230; cấp 9: 300; sau đó +1 cấp/100 lượt.
- Cấp 3: tặng tên gọi "pháp danh ảo" trong game, **không phải pháp danh do chùa hoặc tăng ni ban**.
- Quẻ xăm là lời chiêm nghiệm/ngẫu nhiên, không phải công cụ dự báo vận mệnh.
- Chat theo phòng: **không lưu lịch sử**, dữ liệu được phát tới người đang có mặt; hạn chế gửi trên giao diện 1,5 giây/tin.

## 2. Cập nhật GitHub riêng của bạn

1. Sao lưu commit/branch hiện tại của dự án V3.1.
2. Giải nén ZIP này, **mở thư mục con `sansa-temple-3d`** rồi đưa nội dung vào thư mục gốc của repo GitHub hiện tại. Không copy nguyên thư mục lồng thêm nếu gốc repo đã có `package.json`.
3. Ghi đè `src/main.js`, `src/style.css`, `src/room.js` và thêm `src/progress.js`, `src/grove.js`, `src/fortune.js`, `supabase_v4.sql`.
4. Giữ nguyên URL repo, project Vercel, tên miền, `VITE_SUPABASE_URL` và key Supabase đang dùng.
5. `npm install`, `npm run dev`; sau khi kiểm thử `npm run build`. Commit/push GitHub để Vercel deploy.

## 3. Bắt buộc: Supabase để nhiều người thấy nhau

- Trong **cùng một Supabase project**, lấy `Project URL` và **publishable key** (hoặc legacy `anon key`).
- Trên Vercel > Project > Settings > Environment Variables:
  - `VITE_SUPABASE_URL` = Project URL.
  - `VITE_SUPABASE_ANON_KEY` = publishable/anon key. Code cũng hỗ trợ tên `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Chọn các environments Production, Preview nếu muốn kiểm thử Preview, rồi **Redeploy** (biến môi trường Vite được nhúng khi build).
- Supabase Realtime phải được bật và **public channels** được cho phép. Project riêng/chế độ private cần RLS/policies realtime bổ sung (chưa được triển khai trong bản demo này).
- Trên hai thiết bị riêng, mở **CHÍNH XÁC CÙNG link đã deploy và cùng room**: `https://ten-mien-cua-ban.vercel.app/?room=main-hall`.
- Cả hai **phải bấm “Vào chánh điện”**. Chỉ mở trang nhưng chưa bấm vào không tính là người đang tham gia. Quan sát phía trên `👥 2 người`, avatar và tên phía trên đầu.
- Người mở trang từ **deployment V3.1** sẽ không xuất hiện cùng V4 do dùng channel name khác; cho mọi người tải lại V4.
- Không cấu hình Supabase: web vẫn xem cảnh/hoạt động, **chỉ một người**, không thể chat đa thiết bị; sẽ có cảnh báo trạng thái.

## 4. Cấp độ và pháp danh lưu xuyên lần truy cập

- Demo không có SQL / không bật xác thực ẩn danh: điểm/lượt chỉ trong `localStorage` của **trình duyệt hiện tại**, không tự chuyển giữa điện thoại và máy tính. Không cần email khi chơi.
- Để đồng bộ bền vững trong cùng trình duyệt: trong Supabase bật **Authentication > Providers > Anonymous Sign-Ins** (tên mục có thể đổi theo giao diện), rồi vào **SQL Editor** chạy toàn bộ `supabase_v4.sql` đi kèm.
- Hệ thống tự tạo anonymous user khi vào phòng; gọi RPC để cập nhật tên và cộng 1 lượt sau khi hoàn thành; trường `merits` không cho client ghi trực tiếp. Client hiển thị `☁ Đã lưu vào Supabase` khi kết nối thành công.
- Anonymous account bị mất khi xóa dữ liệu trình duyệt, logout hoặc đổi thiết bị. Muốn chuyển cấp độ qua thiết bị cần bổ sung login/liên kết tài khoản ở phiên bản tiếp theo.
- RPC demo áp giới hạn 8 giây giữa hai lần nhận thưởng, tối đa 100 lượt/ngày (UTC); API vẫn không chứng minh được người dùng thực sự hoàn tất hành động. Muốn làm bảng xếp hạng/phần thưởng có giá trị cần xác minh hoạt động phía server.

## 5. Kiểm thử 2 người

1. Ở hai cửa sổ khác nhau, mở cùng đường dẫn `?room=main-hall`, nhập tên khác nhau, nhấn **Vào chánh điện**.
2. Trong khung chat, trạng thái phải là `● Đã kết nối · main-hall`. Nếu thấy `◌ Chưa cấu hình Supabase` hoặc `⚠ Mất kết nối`, kiểm tra biến Vercel, public Realtime và Console (F12).
3. Kiểm tra cả hai màn hình thấy `👥 2 người`, avatar và tên của người còn lại.
4. Chọn Thắp hương / Lễ Phật / Ngồi niệm: người khác quan sát chuyển động, trạng thái tương ứng và avatar ngồi/quỳ gần đúng.
5. Gửi chat: hai phía thấy tin mới, bubble xuất hiện trên nhân vật người gửi; reload chat cũ biến mất (thiết kế).
6. Lắc quẻ: quẻ hiện khi kết thúc lắc. Buộc dây đỏ: người trong cùng phòng sẽ thấy dây tăng.
7. Dừng hoạt động trước lúc kết thúc: **không cộng lượt**; hoàn thành xong mới cộng. Thử đạt 5 và 30 lượt khi cần kiểm tra cấp/pháp danh.

## 6. Giới hạn trước khi công khai rộng rãi

- Phòng `?room=` là một **phòng công khai**, không phải mật khẩu/bảo mật riêng. Chưa có đăng nhập định danh/kiểm duyệt tin nhắn, chống spam server, chặn người dùng hoặc phân quyền. Không nên mở cho cộng đồng lớn trước khi bổ sung lớp quản trị/kiểm duyệt và chống lạm dụng.
- Chat realtime nhất thời; **không lưu DB** và không cam kết giao hàng tin khi mất kết nối.
- Chọn đệm theo Presence là dạng best-effort; hai người bắt đầu cùng mili-giây có thể ngồi trùng. Phòng đông cần server điều phối chỗ ngồi.
- Đồng bộ remote avatar theo vị trí và hoạt động; không phát toàn bộ hệ xương/108 beads riêng tới mọi avatar để giữ hiệu năng.
- 108 hạt hiển thị trên chibi chính. 108 biến mặc định khoảng hơn 3 phút, chọn 9 biến để test nhanh.
- Website chỉ dùng code dựng hình gốc Three.js của dự án này; không sao chép ảnh, âm thanh hay asset từ repo TikTok Live Temple RPC.
