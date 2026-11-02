// Original contemplative content, not predictions about health, finances or relationships.
const TITLES = ['An', 'Tĩnh', 'Duyên', 'Hòa', 'Sáng', 'Nhẫn', 'Thiện', 'Tâm', 'Sen', 'Mây', 'Từ', 'Phúc'];
const VERSES = [
  ['Tâm như mặt nước hồ thu', 'Đừng vội bước, hãy lắng nghe điều mình cần.'],
  ['Một lời chân thật nở hoa', 'Điều bền lâu bắt đầu từ sự thấu hiểu.'],
  ['Nhân lành gieo giữa ban mai', 'Hãy chăm sóc những mối quan hệ gần gũi.'],
  ['Qua cơn mưa, lá lại xanh', 'Bình tĩnh có thể mở ra lựa chọn mới.'],
  ['Ngọn đèn sáng ở trong tâm', 'Câu trả lời có thể nằm ở giá trị mình trân trọng.'],
  ['Đường dài cần một bước chân', 'Việc nhỏ làm đều có sức mạnh riêng.'],
  ['Gió đưa cành lá nhẹ nhàng', 'Dịu dàng với người khác và cả bản thân.'],
  ['Mây trôi, trời vẫn trong xanh', 'Có những việc nên buông để lòng nhẹ hơn.'],
  ['Hoa sen nở giữa bùn sâu', 'Vẻ đẹp vẫn có thể hình thành từ khó khăn.'],
  ['Hữu duyên gặp gỡ bình an', 'Tôn trọng lựa chọn của nhau nuôi dưỡng tình thân.'],
  ['Gieo thương chẳng đợi ngày mai', 'Một hành động tử tế có thể bắt đầu hôm nay.'],
  ['Trăng tròn soi bóng hiên chùa', 'Dành ít thời gian để biết ơn điều đang có.']
];
export function drawFortune() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  const number = bytes[0] % 100 + 1;
  const index = (number - 1) % TITLES.length;
  return { number, title: `Quẻ ${TITLES[index]}`, verse: VERSES[index][0], guidance: VERSES[index][1] };
}
