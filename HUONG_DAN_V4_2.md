# An Nhiên Temple V4.2 — sửa avatar và giao diện live

## Điểm đã sửa
- Số người và tin nhắn hoạt động từ bản V4: giữ nguyên Supabase Realtime.
- Sửa lỗi chồng nhân vật: mỗi người trong phòng có một vị trí đứng riêng được tính theo danh sách Presence, kể cả khi 2 người cùng đứng yên.
- Nhân vật người khác có vòng chân xanh nhạt và nhãn tên để phân biệt.
- Chat chuyển từ khung riêng bên phải sang cột hoạt động bên trái; hội thoại ngắn gọn như live.
- 6 hoạt động chuyển thành thanh icon dưới giữa, giữ nguyên các thao tác và trạng thái.
- Các thông báo kỹ thuật có chữ Supabase được thay bằng thông điệp dễ hiểu cho người chơi.
- Nhật ký vẫn có thể mở bằng nút “Nhật ký hoạt động”.

## Cách cập nhật không mất dữ liệu
1. Tạo nhánh backup trên GitHub trước khi thay đổi.
2. Copy đè duy nhất 3 file từ ZIP bản cập nhật: `src/main.js`, `src/style.css`, `src/room.js`, `src/progress.js`.
3. Commit vào repo `supporthubone-maker/tungtung`, chờ Vercel deploy trạng thái Ready.
4. Không cần chạy lại SQL, không thêm biến Vercel, không sửa bảng Supabase.

## Kiểm thử
- Mở cùng URL `?room=main-hall` trên 2 thiết bị, nhập hai tên **khác nhau**, cùng bấm “Vào chánh điện”.
- Số người phải là 2; quan sát **hai nhân vật đứng hai vị trí khác nhau** phía trước thảm.
- Mỗi máy thực hiện một hoạt động khác nhau, kiểm tra di chuyển của đối phương.
- Chat hai chiều trong cột bên trái; kiểm tra trên điện thoại.
- Trường hợp số 2 nhưng avatar vẫn không thấy: mở F12 Console, xem lỗi WebGL/JavaScript; chụp ảnh và gửi cùng URL deployment đang chạy.

## Lưu ý
- Khi người chơi mới vào/ra phòng, vị trí chờ của người đang đứng yên có thể được sắp lại.
- Chưa kiểm thử live trên Supabase của người dùng; đây là bản sửa dựa trên source V4 đã gửi.
- Không chỉnh khóa Secret, service_role, hay các quyền dữ liệu ở frontend.
