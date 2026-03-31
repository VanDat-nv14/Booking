const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let c = fs.readFileSync(filePath, 'utf8');

// Replace /approve endpoint with /review {approved:true}
c = c.replace(
  /await axiosClient\.put\(`\/promotions\/\$\{p\.id\}\/approve`\)/g,
  "await axiosClient.put(`/promotions/${p.id}/review`, { approved: true })"
);

// Replace /reject endpoint with /review {approved:false, lyDoTuChoi}
c = c.replace(
  /await axiosClient\.put\(`\/promotions\/\$\{p\.id\}\/reject`\s*,\s*\{[^}]*\}\)/g,
  "await axiosClient.put(`/promotions/${p.id}/review`, { approved: false, lyDoTuChoi: lyDo })"
);

// Replace /activate with /cancel (no activate endpoint exists)
c = c.replace(
  /await axiosClient\.put\(`\/promotions\/\$\{p\.id\}\/activate`\)/g,
  "await axiosClient.put(`/promotions/${p.id}/cancel`)"
);

// Replace /deactivate with /cancel
c = c.replace(
  /await axiosClient\.put\(`\/promotions\/\$\{p\.id\}\/deactivate`\)/g,
  "await axiosClient.put(`/promotions/${p.id}/cancel`)"
);

// Fix escaped Unicode sequences like Duy\u1ec7t -> Duyệt
c = c.replace(/Duy\\u1ec7t th\\u00e0nh c\\u00f4ng!/g, 'Duyệt thành công!');
c = c.replace(/T\\u1eeb ch\\u1ed1i!/g, 'Từ chối!');
c = c.replace(/L\\u1ed7i duy\\u1ec7t/g, 'Lỗi duyệt');
c = c.replace(/L\\u1ed7i t\\u1eeb ch\\u1ed1i/g, 'Lỗi từ chối');
c = c.replace(/L\\u1ed7i k\\u00edch ho\\u1ea1t/g, 'Lỗi kích hoạt');
c = c.replace(/K\\u00edch ho\\u1ea1t th\\u00e0nh c\\u00f4ng!/g, 'Kích hoạt thành công!');
c = c.replace(/T\\u1eaft th\\u00e0nh c\\u00f4ng!/g, 'Tắt thành công!');
c = c.replace(/Duy\\u1ec7t\b/g, 'Duyệt');
c = c.replace(/T\\u1eeb Ch\\u1ed1i/g, 'Từ Chối');
c = c.replace(/K\\u00edch Ho\\u1ea1t/g, 'Kích Hoạt');
c = c.replace(/T\\u1eaft\b/g, 'Tắt');
c = c.replace(/L\\u1ed7i\b/g, 'Lỗi');
c = c.replace(/H\\u1ee7y/g, 'Hủy');
c = c.replace(/Ph\\u1ea3i nh\\u1eadp/g, 'Phải nhập');
c = c.replace(/l\\u00fd do t\\u1eeb ch\\u1ed1i/g, 'lý do từ chối');
c = c.replace(/L\\u00fd do t\\u1eeb ch\\u1ed1i/g, 'Lý do từ chối');
c = c.replace(/b\\u1eaft bu\\u1ed9c/g, 'bắt buộc');
c = c.replace(/T\\u1eeb ch\\u1ed1i th\\u00e0nh c\\u00f4ng!/g, 'Từ chối thành công!');
c = c.replace(/H\\u1ee7y khuy\\u1ebfn m\\u00e3i n\\u00e0y\?/g, 'Hủy khuyến mãi này?');
c = c.replace(/H\\u1ee7y th\\u00e0nh c\\u00f4ng!/g, 'Hủy thành công!');
c = c.replace(/L\\u1ed7i h\\u1ee7y/g, 'Lỗi hủy');

fs.writeFileSync(filePath, c, 'utf8');
console.log('AdminDashboard.jsx patched successfully!');
console.log('Has /review endpoint:', c.includes('/review'));
console.log('Has /approve endpoint (bad):', c.includes('/approve'));
console.log('Has /reject endpoint (bad):', c.includes('/reject'));
