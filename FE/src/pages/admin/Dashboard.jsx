import React from 'react';
import { Download, Plus, Users as UsersIcon, Library, UserPlus, MessageSquareWarning } from 'lucide-react';

export default function Dashboard() {
  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Chào mừng trở lại, Admin
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Tổng quan số liệu và báo cáo hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-[#1C252E] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2">
            <Download size={18} />
            <span>Xuất báo cáo</span>
          </button>
          <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <Plus size={18} />
            <span>Thêm sách mới</span>
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            iconBg: 'bg-blue-50 dark:bg-blue-500/10',
            iconColor: 'text-primary',
            icon: <UsersIcon className="text-primary" size={20} />,
            title: 'Tổng thành viên',
            value: '12,340',
            note: 'Tổng số tài khoản đang hoạt động',
            badge: '+5%\u2191',
            badgeColor: 'text-green-500 bg-green-50 dark:bg-green-500/10'
          },
          {
            iconBg: 'bg-purple-50 dark:bg-purple-500/10',
            iconColor: 'text-purple-500',
            icon: <Library className="text-purple-500" size={20} />,
            title: 'Tổng đầu sách',
            value: '4,500',
            note: 'Đã thêm trong tháng này',
            badge: '+12\u2191',
            badgeColor: 'text-green-500 bg-green-50 dark:bg-green-500/10'
          },
          {
            iconBg: 'bg-orange-50 dark:bg-orange-500/10',
            iconColor: 'text-orange-500',
            icon: <UserPlus className="text-orange-500" size={20} />,
            title: 'Đăng ký mới (24h)',
            value: '+120',
            note: 'So với hôm qua',
            badge: '+15%\u2191',
            badgeColor: 'text-green-500 bg-green-50 dark:bg-green-500/10'
          },
          {
            iconBg: 'bg-red-50 dark:bg-red-500/10',
            iconColor: 'text-red-500',
            icon: <MessageSquareWarning className="text-red-500" size={20} />,
            title: 'Bình luận chờ duyệt',
            value: '15',
            note: 'Đánh giá từ người đọc',
            badge: 'Cần xử lý',
            badgeColor: 'text-red-500 bg-red-50 dark:bg-red-500/10'
          }
        ].map((c, idx) => (
          <div key={idx} className="bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1">
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 ${c.iconBg} rounded-lg`}>
                {c.icon}
              </div>
              <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${c.badgeColor}`}>{c.badge}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{c.title}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{c.value}</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{c.note}</p>
          </div>
        ))}
      </div>

      {/* Chart and categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Xu hướng mượn sách</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Thống kê 30 ngày gần nhất</p>
            </div>
            <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg">
              <button className="px-3 py-1 bg-white dark:bg-slate-700 shadow-sm rounded-md text-slate-900 dark:text-white font-medium">Tháng này</button>
              <button className="px-3 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">Năm nay</button>
            </div>
          </div>
          <div className="relative w-full aspect-[2/1] max-h-[300px]">
            {/* Static SVG line chart to match HTML mock */}
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 300">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#137fec" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#137fec" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line stroke="#334155" strokeDasharray="4 4" strokeOpacity="0.2" x1="0" x2="800" y1="250" y2="250" />
              <line stroke="#334155" strokeDasharray="4 4" strokeOpacity="0.2" x1="0" x2="800" y1="175" y2="175" />
              <line stroke="#334155" strokeDasharray="4 4" strokeOpacity="0.2" x1="0" x2="800" y1="100" y2="100" />
              <line stroke="#334155" strokeDasharray="4 4" strokeOpacity="0.2" x1="0" x2="800" y1="25" y2="25" />
              <path d="M0,250 C50,240 100,150 150,160 C200,170 250,100 300,90 C350,80 400,120 450,110 C500,100 550,40 600,50 C650,60 700,140 750,120 L800,100 L800,300 L0,300 Z" fill="url(#chartGradient)" />
              <path d="M0,250 C50,240 100,150 150,160 C200,170 250,100 300,90 C350,80 400,120 450,110 C500,100 550,40 600,50 C650,60 700,140 750,120 L800,100" fill="none" stroke="#137fec" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              <circle cx="600" cy="50" r="6" fill="#137fec" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium">
            <span>Tuần 1</span>
            <span>Tuần 2</span>
            <span>Tuần 3</span>
            <span>Tuần 4</span>
          </div>
        </div>
        <div className="lg:col-span-1 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Phân bổ danh mục</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Các thể loại sách phổ biến</p>
          </div>
          {[
            { label: 'Khoa học', color: 'bg-primary', percent: 45 },
            { label: 'Văn học', color: 'bg-purple-500', percent: 30 },
            { label: 'Kinh tế', color: 'bg-orange-500', percent: 15 },
            { label: 'Lịch sử', color: 'bg-teal-500', percent: 10 }
          ].map((i) => (
            <div key={i.label} className="flex-1 flex flex-col justify-center gap-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{i.label}</span>
                  <span className="text-slate-500">{i.percent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <div className={`h-full ${i.color} rounded-full`} style={{ width: `${i.percent}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members + comments blocks (static) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Thành viên mới</h3>
            <button className="text-sm text-primary font-medium hover:underline">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-6 py-4">Tên người dùng</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Ngày đăng ký</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {[
                  {
                    initials: 'NH',
                    name: 'Nguyễn Văn Hùng',
                    email: 'hung.nguyen@email.com',
                    date: '20/10/2023',
                    status: 'Đã kích hoạt',
                    statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  },
                  {
                    initials: 'TL',
                    name: 'Trần Thị Lan',
                    email: 'lan.tran@email.com',
                    date: '19/10/2023',
                    status: 'Chờ xác minh',
                    statusColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  },
                  {
                    initials: 'LM',
                    name: 'Lê Minh',
                    email: 'minh.le@email.com',
                    date: '18/10/2023',
                    status: 'Đã kích hoạt',
                    statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }
                ].map((m) => (
                  <tr key={m.email}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                          {m.initials}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{m.email}</td>
                    <td className="px-6 py-4 text-slate-500">{m.date}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${m.statusColor}`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Bình luận chờ duyệt</h3>
            <span className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 text-xs font-bold px-2 py-1 rounded">15 pending</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[300px] p-0">
            {[
              { name: 'Phạm Đức', book: 'Đắc Nhân Tâm', time: '5 phút trước', text: 'Cuốn sách rất hữu ích!' },
              { name: 'Ngọc Anh', book: 'Tư duy nhanh và chậm', time: '10 phút trước', text: 'Nên có thêm ví dụ minh họa.' }
            ].map((c, i) => (
              <div key={i} className="p-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-900 dark:text-white">{c.name}</span>
                    <span className="text-xs text-slate-500">• Sách: "{c.book}"</span>
                  </div>
                  <span className="text-xs text-slate-400">{c.time}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{c.text}</p>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1 text-xs rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Duyệt</button>
                  <button className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Từ chối</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
