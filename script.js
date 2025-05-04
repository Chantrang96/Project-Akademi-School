let currentRole = "admin"; // khai báo biến hiện tại
// 1. Hàm xử lý Dropdown
function toggleDropdown() {
  document.getElementById("roleSelector").classList.toggle("hidden");
}

// Khi chọn role mới từ dropdown
function changeCurrentRole(selectEl) {
  currentRole = selectEl.value; // cập nhật biến role hiện tại = giá trị vừa chọn từ dropdown
  document.getElementById("roleLabel").textContent = currentRole; // cập nhật lại chữ hiển thị bên dưới tên
  document.getElementById("roleSelector").classList.add("hidden"); // ẩn lại dropdown sau khi chọn
  // Gọi lại các hàm xử lý phân quyền dựa theo vai trò mới
  checkPermissions(); // kiểm tra và ẩn/hiện các phần tử HTML theo quyền của role mới
  restrictedClick(); // gắn lại sự kiện click cho các phần tử có kiểm soát quyền
}

// 2a. Khai báo phân quyền
const rolePermissions = {
  //danh sách quyền tương ứng với vai trò
  admin: [
    "AD-SCH01", //Quản lý học sinh
    "AD-SCH02", //Quản lý giáo viên
    "AD-SCH05", // Quản lý hoạt động ngoại khóa
    "AD-SCH07", //Quản lý báo cáo
    "AD-SCH12", //Quản lý Quản lý học phí
  ],
  teacher: [
    "TCH-SCH01", //Quản lý thông tin cá nhân GV
    "TCH-SCH02", //Quản lý học sinh
    "TCH-SCH07", //Quản lý hoạt động ngoại khóa
  ],
  student: [
    "STU-SCH03", //Xem ttin cá nhân SV
    "STU-SCH10", // quản lý học phí
  ],
};
// 2b.Tìm vai trò được phép dùng mã quyền đó
function allowedRole(roleCode) {
  // roleCode là mã quyền muốn kiểm tra (RolePermissions)
  const roles = Object.keys(rolePermissions); // lấy danh sách các vai trò trong rolePermissions
  for (let i = 0; i < roles.length; i++) {
    const roleName = roles[i];
    if (rolePermissions[roleName].includes(roleCode)) {
      return roleName; // trả về vai trò người có quyền
    }
  }
  return "người có quyền";
}

//2c. Hàm kiểm tra xem quyền có ứng với ds đã cung cấp hay không
function checkPermissions() {
  let role; // khai 1 biến để gán với ds quyền tương ứng với role
  // kiểm tra xem role hiện tại có trong rolepermisson hay không
  if (rolePermissions[currentRole]) {
    role = rolePermissions[currentRole]; // nếu có gán ds vào biến role
  } else {
    role = []; // nếu không, gán mảng rỗng
  }
  // tìm tất cả các phần tử trong file html có gán role-code
  const allElements = document.querySelectorAll("[data-role-code]");
  let alertShown = false; // 🚨 Khai báo ban đầu là false

  // duyệt từng phần tử kiểm tra xem có ứng với quyền không
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i]; // lấy phần tử hiện tại
    const elementRoleCode = element.getAttribute("data-role-code"); // lấy mã quyền từ phần tử
    // tách ra nếu có nhiều mã quyền
    const roleSplit = elementRoleCode.split(" ");
    // kiểm tra xem có ứng 1 quyền phù hợp hay không
    let hasPermission = false; // khai báo false ngay từ đầu để mỗi lần check vòng lặp reset lại sẽ là false - tức chưa có quyền
    for (let j = 0; j < roleSplit.length; j++) {
      if (role.indexOf(roleSplit[j]) !== -1) {
        hasPermission = true;
        break; // có quyền thì thoát vòng lặp
      }
    }
    // Chỉ ẩn nếu phần tử có thêm data-hide="true"
    if (!hasPermission && element.getAttribute("data-hide") === "true") {
      element.style.display = "none"; //ẩn phần tử
      if (!alertShown) {
        const requiredRole = allowedRole(roleSplit[0]);
        alert(
          `Bạn không phải là ${requiredRole} và không có quyền truy cập tính năng này.`
        );
        alertShown = true; // 🚨 Sau khi alert xong, đánh dấu đã hiện rồi
      }
    }
  }
}

// chặn bấm nút khi không phải là admin
function restrictedClick() {
  // Lấy tất cả phần tử có data-role-code và data-action (dành cho kiểm soát click)
  const clickableElements = document.querySelectorAll(
    "[data-role-code][data-action]"
  );

  // Duyệt từng phần tử để gắn sự kiện click
  for (let i = 0; i < clickableElements.length; i++) {
    const el = clickableElements[i];
    const codeAttr = el.getAttribute("data-role-code"); // lấy chuỗi mã quyền từ phần tử
    const codeList = codeAttr.split(" "); // tách thành mảng nếu có nhiều quyền

    // Gắn sự kiện click
    el.addEventListener("click", function (event) {
      const userPermission = rolePermissions[currentRole] || [];

      // Kiểm tra xem người dùng có ít nhất 1 quyền hợp lệ
      let hasPermission = false;
      for (let j = 0; j < codeList.length; j++) {
        if (userPermission.includes(codeList[j])) {
          hasPermission = true;
          break;
        }
      }

      // Nếu không có quyền thì ngăn hành động và cảnh báo
      if (!hasPermission) {
        event.preventDefault(); // chặn thao tác mặc định
        alert("Bạn không có quyền thực hiện hành động này.");
      }
    });
  }
}

// 3. Gọi cách hàm khi trang load
window.onload = function () {
  checkPermissions();
  restrictedClick();
};
