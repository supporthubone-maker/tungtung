# Thiền Viện An Nhiên – Three.js 3D

Prototype 3D độc lập, viết bằng Vite + Three.js. Không sử dụng mã nguồn hoặc tài sản 3D của Sansa.

## Chạy local

```bash
npm install
npm run dev
```

Mở URL Vite in ra (thường http://localhost:5173).

## Deploy Vercel

Push toàn bộ thư mục lên repo GitHub, chọn **Add New → Project** trên Vercel, import repo, chọn Framework **Vite**, chạy **Deploy**. Build command `npm run build`, output `dist` (đã khai báo sẵn trong `vercel.json`).

## Bản prototype có

- Chánh điện 3D dựng từ geometry, vật liệu, đèn, đổ bóng; tượng Phật kiểu stylized 3D.
- Chibi nam/nữ dựng bằng primitive với hierarchical joints (không phải GLB rig chuẩn).
- Đi đến mục tiêu, thắp hương, dâng sen, quỳ lạy 3/108 nhịp, ngồi niệm 9/27/108 biến.
- Camera xoay/zoom, giao diện responsive, nhật ký hoạt động, hủy thao tác.
- Âm thanh tổng hợp Web Audio sau khi nhấn bật (trình duyệt thường chặn autoplay có tiếng).

## Giới hạn & hướng nâng cấp

- Đây là prototype chức năng. Các cử động được lập trình theo khớp phân cấp, chưa dùng skinning, IK, GLB hoặc motion capture.
- Cảnh chưa có multiplayer/WebSocket và không có backend/lưu trạng thái lâu dài.
- Điểm đặt đồ lễ là vị trí staging; muốn hoa/nhang tồn tại sau khi cúng cần bổ sung state vật phẩm và animations tay chính xác.
- Bản sản xuất nên dùng GLB riêng có skeleton chuẩn + AnimationMixer/clip, navmesh, collision, LOD, asset compression, và server-side room state.
- Không có MP3 tụng kinh bản quyền được đóng gói. Âm nền hiện là tone tổng hợp, bật thủ công do chính sách autoplay của browser.
